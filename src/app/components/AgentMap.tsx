"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Offer } from "@/lib/interfaces/offers";
import { formatCurrency } from "@/lib/utils/currency";

interface AgentMapProps {
  activeOffers: Offer[];
  allBusinesses?: any[];
  userCurrency: string;
  onMarkerClick: (business: any, offers: Offer[]) => void;
  theme?: "light" | "dark";
  lang?: string;
}

const mapTranslations: Record<string, string> = {
  en: "Map is loading...",
  ru: "Карта загружается...",
  id: "Peta sedang memuat...",
  zh: "地图加载中...",
  es: "El mapa se está cargando...",
  de: "Karte wird geladen...",
  fr: "Chargement de la carte...",
  ja: "マップを読み込んでいます...",
  ar: "جاري تحميل الخريطة...",
  pt: "O mapa está carregando...",
  hi: "नक्शा लोड हो रहा है..."
};

export default function AgentMap({
  activeOffers,
  allBusinesses = [],
  userCurrency,
  onMarkerClick,
  theme = "dark",
  lang = "en",
}: AgentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [isLocating, setIsLocating] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // The MapTiler key provided by the user
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || "ICwSd7c82yVo427gx1ar";

  useEffect(() => {
    if (mapInstance.current) return;
    if (!mapContainer.current) return;

    // Get last saved location or default to [0, 0] (won't be visible due to loading screen)
    let savedCenter: [number, number] = [0, 0];
    let savedZoom = 16.5;
    try {
      const saved = localStorage.getItem("lastMapCenter");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lng && parsed.lat) {
          savedCenter = [parsed.lng, parsed.lat];
          if (parsed.zoom) savedZoom = parsed.zoom;
        }
      }
    } catch (e) {
      console.warn("Failed to parse lastMapCenter", e);
    }

    // Changed to streets-v2 for a colorful map instead of colorless dataviz
    const styleUrl =
      theme === "dark"
        ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${mapTilerKey}`
        : `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: savedCenter,
        zoom: savedZoom,
        minZoom: 3, // Allow zooming out further
        maxZoom: 18, // Prevent zooming in too close
        // maxBounds removed so the user can see everything smoothly
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
        touchZoomRotate: false,
        keyboard: false,
      });
      
      // Add geolocation control to track user
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: false, // We hide the blue circle to keep it clean, or we style it orange
        fitBoundsOptions: {
          maxZoom: 17
        }
      });
      map.addControl(geolocate);

      // Trigger geolocation once the map loads
      map.on('load', () => {
        geolocate.trigger();
        
        // Safety timeout: if geolocation takes more than 6 seconds or hangs, reveal the map anyway
        setTimeout(() => setIsLocating(false), 6000);
      });

      geolocate.on('geolocate', () => {
        // Wait for the map to finish flying to the user's location before revealing
        map.once('moveend', () => setIsLocating(false));
        // Fallback just in case moveend doesn't fire
        setTimeout(() => setIsLocating(false), 1500);
      });
      geolocate.on('error', () => setIsLocating(false)); // fallback gracefully
      
      // Hide default MapTiler/Mapbox POIs (shops, restaurants, etc.) so only our venues stand out
      map.on('style.load', () => {
        const style = map.getStyle();
        if (style && style.layers) {
          style.layers.forEach((layer) => {
            if (layer.id.includes('poi') || layer.source_layer === 'poi') {
              map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
          });
        }
      });
      
      // Save location when map moves
      map.on('moveend', () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        localStorage.setItem("lastMapCenter", JSON.stringify({
          lng: center.lng,
          lat: center.lat,
          zoom: zoom
        }));
      });

      mapInstance.current = map;

      // Fix for map resizing issues (squares not loading fully)
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstance.current) {
          mapInstance.current.resize();
        }
      });
      resizeObserver.observe(mapContainer.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapInstance.current = null;
      };
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setIsLocating(false);
    }
  }, []);

  // Dynamically update theme style without reloading map
  useEffect(() => {
    if (mapInstance.current) {
      const styleUrl =
        theme === "dark"
          ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${mapTilerKey}`
          : `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
      mapInstance.current.setStyle(styleUrl);
      
      // We need to re-apply the POI hiding after the new style loads
      mapInstance.current.once('style.load', () => {
        const style = mapInstance.current?.getStyle();
        if (style && style.layers) {
          style.layers.forEach((layer) => {
            if (layer.id.includes('poi') || layer.source_layer === 'poi') {
              mapInstance.current?.setLayoutProperty(layer.id, 'visibility', 'none');
            }
          });
        }
      });
    }
  }, [theme]);

  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    // Group offers by business
    const businessMap = new Map<string, { business: any; offers: Offer[] }>();
    
    // First add all businesses that have coordinates, initializing with empty offers
    allBusinesses.forEach((b: any) => {
      if (b.latitude && b.longitude) {
        businessMap.set(b.id, { business: b, offers: [] });
      }
    });

    // Then group active offers into their businesses (and add business if missing somehow)
    activeOffers.forEach((offer: any) => {
      if (offer.business && offer.business.latitude && offer.business.longitude) {
        const bId = offer.business.id || offer.businessId;
        if (!businessMap.has(bId)) {
          businessMap.set(bId, { business: offer.business, offers: [] });
        }
        businessMap.get(bId)!.offers.push(offer);
      }
    });

    const filteredMap = new Map<string, { business: any; offers: Offer[] }>();
    businessMap.forEach(({ business, offers }, key) => {
      if (!searchQuery) {
        filteredMap.set(key, { business, offers });
        return;
      }
      
      const q = searchQuery.toLowerCase();
      const n1 = (business.name || "").toLowerCase();
      const n2 = (business.fullName || "").toLowerCase();
      const matchName = n1.includes(q) || n2.includes(q);
      const matchOffer = offers.some((o: any) => o.title.toLowerCase().includes(q));
      
      if (matchName || matchOffer) {
        filteredMap.set(key, { business, offers });
      }
    });

    filteredMap.forEach(({ business, offers }) => {
      // Create custom DOM element for the marker to look like an avatar
      const el = document.createElement('div');
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.border = offers.length > 0 ? '3px solid #ff5e00' : '3px solid #666'; // Gray out if no offers
      el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
      el.style.cursor = 'pointer';
      el.style.overflow = 'hidden';
      el.style.backgroundColor = '#333';

      if (business.avatarUrl && !business.avatarUrl.includes('dicebear.com')) {
        el.innerHTML = `<img src="${business.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`;
      } else {
        const seed = business.fullName || business.name || 'Business';
        const bg = theme === 'light' ? 'f3f4f6' : '1a1a1a';
        const txt = theme === 'light' ? '000000' : 'ffffff';
        el.innerHTML = `<img src="https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}&textColor=${txt}" style="width: 100%; height: 100%; object-fit: cover;" />`;
      }

      // Add click listener
      el.addEventListener('click', () => {
        onMarkerClick(business, offers);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([business.longitude, business.latitude])
        .addTo(map);

      markers.current.push(marker);
    });

    // If search yields exactly one result, fly to it
    if (searchQuery && filteredMap.size === 1) {
      const singleResult = Array.from(filteredMap.values())[0].business;
      map.flyTo({
        center: [singleResult.longitude, singleResult.latitude],
        zoom: 15,
        essential: true,
      });
    }
  }, [activeOffers, allBusinesses, onMarkerClick, searchQuery, theme]);

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <style>{`
        /* Make the geolocation dot orange */
        .maplibregl-user-location-dot {
          background-color: #ff5e00 !important;
        }
        .maplibregl-user-location-dot::before {
          background-color: #ff5e00 !important;
        }
        .maplibregl-user-location-accuracy-circle {
          background-color: rgba(255, 94, 0, 0.15) !important;
        }
      `}</style>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "calc(100vh - 250px)",
          maxHeight: "55vh",
          minHeight: "350px",
          borderRadius: "16px",
          border: "1px solid var(--surface-border)",
          backgroundColor: theme === "dark" ? "#1a1a1c" : "#f0f0f0",
          zIndex: 0,
        }}
      ></div>

      {/* Search Overlay */}
      <div style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        right: "64px", // Leave room for MapTiler controls
        zIndex: 1,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          background: theme === "dark" ? "rgba(28, 28, 30, 0.8)" : "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderRadius: "12px",
          padding: "8px 16px",
          border: "1px solid var(--surface-border)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
        }}>
          <span style={{ marginRight: "10px", opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            placeholder="Search venues or offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "var(--foreground)",
              outline: "none",
              fontSize: "15px",
              fontWeight: 500
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--foreground)",
                opacity: 0.5,
                cursor: "pointer",
                padding: "0 4px",
                fontSize: "18px",
                lineHeight: 1
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {isLocating && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme === "dark" ? "#1a1a1c" : "#f9fafb",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255, 94, 0, 0.3)",
              borderTopColor: "#ff5e00",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "1rem",
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ fontWeight: 600, color: "var(--foreground)", opacity: 0.8 }}>
            {mapTranslations[lang] || mapTranslations.en}
          </p>
        </div>
      )}
    </div>
  );
}
