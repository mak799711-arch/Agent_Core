"use client";

import { useEffect, useRef, useState } from "react";
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
    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

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

    if (initialLat && initialLng) {
      markerInstance.current = new maplibregl.Marker({ element: createMarkerEl(), draggable: true })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      markerInstance.current.on('dragend', () => {
        const lngLat = markerInstance.current!.getLngLat();
        onLocationSelect(lngLat.lat, lngLat.lng);
      });
    }

    map.on("click", (e) => {
      const { lat, lng } = e.lngLat;
      
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
    });

    geolocate.on("geolocate", (e: any) => {
      const lat = e.coords.latitude;
      const lng = e.coords.longitude;
      
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
    });

    mapInstance.current = map;

    setTimeout(() => {
      map.resize();
    }, 500);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [initialLat, initialLng]);

  return (
    <div style={{ position: "relative", height: "300px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--surface-border)" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }}></div>
      <div style={{ position: "absolute", top: "10px", left: "10px", background: "var(--glass-bg)", padding: "8px 12px", borderRadius: "8px", backdropFilter: "blur(5px)", border: "1px solid var(--surface-border)", fontSize: "0.85rem", fontWeight: "bold", zIndex: 1, pointerEvents: "none" }}>
        Кликни на карту, чтобы установить точку
      </div>
    </div>
  );
}
