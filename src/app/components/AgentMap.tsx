"use client";

import { useEffect, useRef } from "react";
import { Offer } from "@/lib/interfaces/offers";
import { formatCurrency } from "@/lib/utils/currency";

declare global {
  interface Window {
    mapboxgl: any;
    copyCheckoutLink: (id: string) => void;
  }
}

interface AgentMapProps {
  activeOffers: any[];
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
  const mapboxMap = useRef<any>(null);
  const markers = useRef<any[]>([]);

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

      const defaultLat = -8.65; // Bali
      const defaultLng = 115.2167; // Bali

      const map = new window.mapboxgl.Map({
        container: mapContainer.current,
        style:
          theme === "dark"
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/light-v11",
        center: [defaultLng, defaultLat],
        zoom: 11,
      });

      map.addControl(new window.mapboxgl.NavigationControl(), "top-right");

      mapboxMap.current = map;

      // Fix for map resizing issues
      setTimeout(() => {
        map.resize();
      }, 500);

      renderMarkers();
    }

    return () => {
      if (mapboxMap.current) {
        mapboxMap.current.remove();
        mapboxMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapboxMap.current) {
      mapboxMap.current.setStyle(
        theme === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11",
      );
    }
  }, [theme]);

  useEffect(() => {
    if (mapboxMap.current) {
      renderMarkers();
    }
  }, [activeOffers, copiedId]);

  const renderMarkers = () => {
    const map = mapboxMap.current;
    if (!map) return;

    // Clear existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    activeOffers.forEach((offer) => {
      if (
        offer.business &&
        offer.business.latitude &&
        offer.business.longitude
      ) {
        // Create custom popup HTML
        const popupHtml = `
          <div style="color: #000; min-width: 160px; font-family: sans-serif; padding: 5px;">
            <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: 800;">${offer.business.name}</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${offer.title}</p>
            <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #ff5e00;">
              Reward: ${formatCurrency(offer.rewardAmount, userCurrency)}
            </p>
            <button onclick="window.copyCheckoutLink('${offer.businessId}')" style="background: ${copiedId === offer.businessId ? "#10b981" : "#ff5e00"}; color: white; border: none; padding: 8px 10px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: bold;">
              ${copiedId === offer.businessId ? "✓ Copied" : "Copy Checkout Link"}
            </button>
          </div>
        `;

        const popup = new window.mapboxgl.Popup({ offset: 25 }).setHTML(
          popupHtml,
        );

        const marker = new window.mapboxgl.Marker({ color: "#ff5e00" })
          .setLngLat([offer.business.longitude, offer.business.latitude])
          .setPopup(popup)
          .addTo(map);

        markers.current.push(marker);
      }
    });
  };

  // Expose function to global scope so popup can call it
  useEffect(() => {
    (window as any).copyCheckoutLink = (id: string) => {
      onCopyLink(id);
    };
  }, [onCopyLink]);

  return (
    <div style={{ position: "relative", height: "100%" }}>
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
