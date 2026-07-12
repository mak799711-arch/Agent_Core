"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface LocationPickerMapProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  theme?: "light" | "dark";
}

export default function LocationPickerMap({
  initialLat,
  initialLng,
  onLocationSelect,
  theme = "dark",
}: LocationPickerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerInstance = useRef<maplibregl.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const mapTilerKey = "ICwSd7c82yVo427gx1ar";

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    // Default to Bali if no initial coords
    const defaultLat = initialLat || -8.65;
    const defaultLng = initialLng || 115.2167;

    const styleUrl =
      theme === "dark"
        ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${mapTilerKey}`
        : `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [defaultLng, defaultLat],
      zoom: initialLat ? 15 : 11,
      minZoom: 2,
      attributionControl: false,
    });

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false,
    });
    map.addControl(geolocate, "top-right");

    const createMarkerEl = () => {
      const el = document.createElement("div");
      el.style.backgroundColor = "#ff5e00";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.5)";
      return el;
    };

    const updateMarker = (lng: number, lat: number) => {
      if (!markerInstance.current) {
        markerInstance.current = new maplibregl.Marker({ element: createMarkerEl(), draggable: true })
          .setLngLat([lng, lat])
          .addTo(map);
          
        markerInstance.current.on('dragend', () => {
          const lngLat = markerInstance.current!.getLngLat();
          onLocationSelect(lngLat.lat, lngLat.lng);
        });
      } else {
        markerInstance.current.setLngLat([lng, lat]);
      }
      onLocationSelect(lat, lng);
    };

    if (initialLat && initialLng) {
      updateMarker(initialLng, initialLat);
    }

    map.on("click", (e) => {
      updateMarker(e.lngLat.lng, e.lngLat.lat);
    });

    geolocate.on("geolocate", (e: any) => {
      updateMarker(e.coords.longitude, e.coords.latitude);
    });

    mapInstance.current = map;

    setTimeout(() => map.resize(), 500);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [initialLat, initialLng]);

  // Handle custom search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // bbox for Bali, Indonesia to prevent showing US/Spain results
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${mapTilerKey}&bbox=114.4,-8.9,115.7,-8.0`);
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (feature: any) => {
    const [lng, lat] = feature.center;
    if (mapInstance.current) {
      mapInstance.current.flyTo({ center: [lng, lat], zoom: 16 });
      
      if (!markerInstance.current) {
        const el = document.createElement("div");
        el.style.backgroundColor = "#ff5e00";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.5)";
        
        markerInstance.current = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([lng, lat])
          .addTo(mapInstance.current);
          
        markerInstance.current.on('dragend', () => {
          const lngLat = markerInstance.current!.getLngLat();
          onLocationSelect(lngLat.lat, lngLat.lng);
        });
      } else {
        markerInstance.current.setLngLat([lng, lat]);
      }
      
      onLocationSelect(lat, lng);
      setSearchResults([]);
      setSearchQuery(feature.place_name || feature.text);
    }
  };

  return (
    <div style={{ position: "relative", height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--surface-border)" }}>
      {/* Search Overlay */}
      <div style={{ position: "absolute", top: "10px", left: "10px", right: "50px", zIndex: 10 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", width: "100%", background: "var(--surface)", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)", overflow: "hidden", border: "1px solid var(--surface-border)" }}>
          <input 
            type="text" 
            placeholder="Поиск адреса (например, La Brisa Bali)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", border: "none", background: "transparent", color: "var(--foreground)", fontSize: "0.9rem", outline: "none" }}
          />
          <button type="submit" disabled={isSearching} style={{ background: "var(--primary)", color: "#000", border: "none", padding: "0 16px", fontWeight: "bold", cursor: "pointer", opacity: isSearching ? 0.7 : 1 }}>
            {isSearching ? "..." : "Найти"}
          </button>
        </form>
        
        {searchResults.length > 0 && (
          <div style={{ marginTop: "4px", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--surface-border)", boxShadow: "0 4px 15px rgba(0,0,0,0.4)", maxHeight: "200px", overflowY: "auto" }}>
            {searchResults.map((res: any) => (
              <div 
                key={res.id} 
                onClick={() => selectResult(res)}
                style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "0.85rem", display: "flex", flexDirection: "column" }}
              >
                <span style={{ fontWeight: "bold" }}>{res.text}</span>
                <span style={{ opacity: 0.7, fontSize: "0.75rem", marginTop: "2px" }}>{res.place_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }}></div>
      <style jsx global>{`
        .maplibregl-ctrl-group {
          background: rgba(30, 30, 30, 0.8) !important;
          backdrop-filter: blur(5px);
          border: 1px solid var(--surface-border) !important;
          border-radius: 8px !important;
        }
        .maplibregl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
        }
        .maplibregl-ctrl-icon {
          filter: invert(0.8) sepia(1) saturate(5) hue-rotate(350deg) brightness(1.2); /* Make it roughly orange */
        }
      `}</style>
    </div>
  );
}
