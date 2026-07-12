"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Offer } from "@/lib/interfaces/offers";
import { formatCurrency } from "@/lib/utils/currency";

interface AgentMapProps {
  activeOffers: Offer[];
  userCurrency: string;
  onCopyLink: (businessId: string) => void;
  copiedId: string | null;
  theme?: "light" | "dark";
}

export default function AgentMap({
  activeOffers,
  userCurrency,
  onCopyLink,
  copiedId,
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
      
      mapInstance.current = map;

      // Fix for map resizing issues
      setTimeout(() => {
        map.resize();
      }, 500);

    } catch (err) {
      console.error("Failed to initialize MapLibre:", err);
    }

    return () => {
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

    activeOffers.forEach((offer) => {
      if (
        offer.business &&
        offer.business.latitude &&
        offer.business.longitude
      ) {
        // Create custom DOM element for the marker to look like our orange pin
        const el = document.createElement('div');
        el.style.backgroundColor = '#ff5e00';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        const popupHtml = `
          <div style="color: #000; min-width: 160px; font-family: sans-serif; padding: 5px;">
            <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: 800;">${offer.business.name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${offer.title}</p>
            <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #ff5e00;">
              Reward: ${formatCurrency(offer.rewardAmount, userCurrency)}
            </p>
            <button id="copy-btn-${offer.businessId}" style="background: ${copiedId === offer.businessId ? '#10b981' : '#ff5e00'}; color: white; border: none; padding: 8px 10px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: bold;">
              ${copiedId === offer.businessId ? '✓ Copied' : 'Copy Checkout Link'}
            </button>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(popupHtml);

        // Add event listener to the button after popup opens
        popup.on('open', () => {
          const btn = document.getElementById(`copy-btn-${offer.businessId}`);
          if (btn) {
            btn.onclick = () => {
              onCopyLink(offer.businessId);
            };
          }
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([offer.business.longitude, offer.business.latitude])
          .setPopup(popup)
          .addTo(map);

        markers.current.push(marker);
      }
    });
  }, [activeOffers, copiedId, userCurrency, onCopyLink]);

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
