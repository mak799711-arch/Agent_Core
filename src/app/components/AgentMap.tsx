"use client";

import dynamic from "next/dynamic";
import { Offer } from "@/lib/interfaces/offers";

// Dynamically import the leaflet implementation to disable SSR
// (Leaflet relies on the 'window' object, which crashes Next.js SSR)
const AgentMapClient = dynamic(() => import("./AgentMapClient"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        borderRadius: "16px",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--foreground)",
        border: "1px solid var(--surface-border)",
      }}
    >
      <div style={{ textAlign: "center", opacity: 0.7 }}>
        <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🗺️</div>
        <div>Loading map...</div>
      </div>
    </div>
  ),
});

interface AgentMapProps {
  activeOffers: Offer[];
  userCurrency: string;
  onCopyLink: (businessId: string) => void;
  copiedId: string | null;
  theme?: "light" | "dark";
}

export default function AgentMap(props: AgentMapProps) {
  return <AgentMapClient {...props} />;
}
