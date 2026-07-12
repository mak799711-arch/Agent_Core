"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Offer } from "@/lib/interfaces/offers";
import { formatCurrency } from "@/lib/utils/currency";

interface AgentMapClientProps {
  activeOffers: any[];
  userCurrency: string;
  onCopyLink: (businessId: string) => void;
  copiedId: string | null;
  theme?: "light" | "dark";
}

// Custom icon using simple HTML to avoid asset loading issues
const customIcon = new L.DivIcon({
  html: `
    <div style="
      background-color: #ff5e00;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>
  `,
  className: "custom-leaflet-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Helper component to change map style when theme changes
function MapThemer({ theme }: { theme: string }) {
  const map = useMap();
  useEffect(() => {
    // We could technically swap TileLayers, but React-Leaflet handles TileLayer changes 
    // by remounting if we change the url prop.
  }, [theme, map]);
  return null;
}

export default function AgentMapClient({
  activeOffers,
  userCurrency,
  onCopyLink,
  copiedId,
  theme = "dark",
}: AgentMapClientProps) {
  const defaultLat = -8.65; // Bali
  const defaultLng = 115.2167; // Bali

  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", zIndex: 0, borderRadius: "16px", overflow: "hidden", border: "1px solid var(--surface-border)" }}>
      <MapContainer
        center={[defaultLat, defaultLng]}
        zoom={11}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "500px",
          zIndex: 0,
        }}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapThemer theme={theme} />

        {activeOffers.map((offer, index) => {
          if (
            offer.business &&
            offer.business.latitude &&
            offer.business.longitude
          ) {
            return (
              <Marker
                key={offer.id || index}
                position={[offer.business.latitude, offer.business.longitude]}
                icon={customIcon}
              >
                <Popup closeButton={false}>
                  <div
                    style={{
                      color: "#000",
                      minWidth: "160px",
                      fontFamily: "sans-serif",
                      padding: "5px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 5px 0",
                        fontSize: "14px",
                        fontWeight: 800,
                      }}
                    >
                      {offer.business.name}
                    </h4>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      {offer.title}
                    </p>
                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#ff5e00",
                      }}
                    >
                      Reward: {formatCurrency(offer.rewardAmount, userCurrency)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyLink(offer.businessId);
                      }}
                      style={{
                        background:
                          copiedId === offer.businessId ? "#10b981" : "#ff5e00",
                        color: "white",
                        border: "none",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        width: "100%",
                        fontWeight: "bold",
                      }}
                    >
                      {copiedId === offer.businessId
                        ? "✓ Copied"
                        : "Copy Checkout Link"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
