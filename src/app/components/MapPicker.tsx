"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    mapboxgl: any;
  }
}

interface MapPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string | null;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  theme?: "light" | "dark";
}

export default function MapPicker({
  initialLat,
  initialLng,
  initialAddress,
  onLocationSelect,
  theme = "dark",
}: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapboxMap = useRef<any>(null);
  const marker = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState(initialAddress || "");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!window.mapboxgl) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (mapboxMap.current) return;
      if (!mapContainer.current) return;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
      window.mapboxgl.accessToken = token;

      const defaultLat = initialLat || -8.65;
      const defaultLng = initialLng || 115.2167;

      const map = new window.mapboxgl.Map({
        container: mapContainer.current,
        style:
          theme === "dark"
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/light-v11",
        center: [defaultLng, defaultLat], // Mapbox uses [lng, lat]
        zoom: 12,
      });

      map.addControl(new window.mapboxgl.NavigationControl(), "top-right");

      mapboxMap.current = map;

      // Ensure map resizes correctly if inside a tab or modal
      setTimeout(() => {
        map.resize();
      }, 500);

      if (initialLat && initialLng) {
        marker.current = new window.mapboxgl.Marker({ color: "#ff5e00" })
          .setLngLat([initialLng, initialLat])
          .addTo(map);
      }

      map.on("click", async (e: any) => {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;
        setPin(lat, lng);

        try {
          // Using OSM Nominatim for reverse geocoding since Mapbox geocoding requires a token and can have limits
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const data = await res.json();
          if (data && data.display_name) {
            setSearchQuery(data.display_name);
            onLocationSelect(lat, lng, data.display_name);
          } else {
            onLocationSelect(lat, lng, "Selected from map");
          }
        } catch (err) {
          console.error(err);
          onLocationSelect(lat, lng, "Selected from map");
        }
      });
    }

    return () => {
      if (mapboxMap.current) {
        mapboxMap.current.remove();
        mapboxMap.current = null;
      }
    };
  }, [initialLat, initialLng]);

  // Update theme dynamically
  useEffect(() => {
    if (mapboxMap.current) {
      mapboxMap.current.setStyle(
        theme === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11",
      );
    }
  }, [theme]);

  const setPin = (lat: number, lng: number) => {
    if (!mapboxMap.current) return;

    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new window.mapboxgl.Marker({ color: "#ff5e00" })
        .setLngLat([lng, lat])
        .addTo(mapboxMap.current);
    }
    mapboxMap.current.flyTo({ center: [lng, lat], zoom: 15 });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPin(lat, lng);
    onLocationSelect(lat, lng, result.display_name);
    setResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
      }}
    >
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          className="input-field"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for your venue (e.g. Potato Head Bali)"
          style={{ flex: 1, color: "var(--foreground)" }}
        />
        <button type="submit" className="btn-primary" disabled={isSearching}>
          {isSearching ? "..." : "Search"}
        </button>
      </form>

      {results.length > 0 && (
        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--surface-border)",
            borderRadius: "8px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => selectResult(r)}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ fontSize: "0.85rem" }}>{r.display_name}</span>
            </div>
          ))}
        </div>
      )}

      <div
        ref={mapContainer}
        style={{
          flex: 1,
          minHeight: "400px",
          borderRadius: "12px",
          border: "1px solid var(--surface-border)",
          zIndex: 0,
        }}
      ></div>
      <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>
        * You can also click directly on the map to pin your exact location
        manually.
      </p>
    </div>
  );
}
