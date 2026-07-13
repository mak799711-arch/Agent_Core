"use client";

import { useEffect, useRef } from "react";
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
}

export default function AgentMap({
  activeOffers,
  allBusinesses = [],
  userCurrency,
  onMarkerClick,
  theme = "dark",
}: AgentMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  // The MapTiler key provided by the user
  const mapTilerKey = "ICwSd7c82yVo427gx1ar";

  useEffect(() => {
    if (mapInstance.current) return;
    if (!mapContainer.current) return;

    const defaultLat = -8.65; // Bali
    const defaultLng = 115.2167; // Bali

    // Changed to streets-v2 for a colorful map instead of colorless dataviz
    const styleUrl =
      theme === "dark"
        ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${mapTilerKey}`
        : `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [defaultLng, defaultLat],
        zoom: 11,
        minZoom: 9, // Prevent zooming out to the whole world
        maxZoom: 18, // Prevent zooming in too close
        maxBounds: [
          [110.0, -12.0], // South-West bound (Longitude, Latitude)
          [120.0, -5.0],  // North-East bound (Longitude, Latitude)
        ],
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
      });
      map.addControl(geolocate);

      // Trigger geolocation once the map loads
      map.on('load', () => {
        geolocate.trigger();
      });
      
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
      
      mapInstance.current = map;

      // Fix for map resizing issues (squares not loading fully)
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstance.current) {
          mapInstance.current.resize();
        }
      });
      resizeObserver.observe(mapContainer.current);

    } catch (err) {
      console.error("Failed to initialize MapLibre:", err);
    }

    return () => {
      if (mapContainer.current) {
        // We can't easily disconnect the observer here without storing it in a ref, but MapLibre remove handles cleanup mostly.
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      const styleUrl =
        theme === "dark"
          ? `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${mapTilerKey}`
          : `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
      mapInstance.current.setStyle(styleUrl);
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

    businessMap.forEach(({ business, offers }) => {
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

      if (business.avatarUrl) {
        el.innerHTML = `<img src="${business.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`;
      } else {
        const fallbackId = business.id || business.ownerId || Math.random().toString();
        el.innerHTML = `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackId}" style="width: 100%; height: 100%; object-fit: cover;" />`;
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
  }, [activeOffers, allBusinesses, onMarkerClick]);

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
          height: "100%",
          minHeight: "500px",
          borderRadius: "16px",
          border: "1px solid var(--surface-border)",
          zIndex: 0,
        }}
      ></div>
    </div>
  );
}
