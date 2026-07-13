"use client";

import React, { useState } from "react";
import { UserProfile } from "@/lib/interfaces/auth";
import { Offer } from "@/lib/interfaces/offers";

interface BusinessProfileModalProps {
  business: UserProfile;
  offers: Offer[];
  onClose: () => void;
  onCopyLink?: (offerId: string) => void;
  copiedId?: string | null;
}

export default function BusinessProfileModal({
  business,
  offers,
  onClose,
  onCopyLink,
  copiedId,
}: BusinessProfileModalProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNextPhoto = () => {
    if (business.photos && activePhotoIndex < business.photos.length - 1) {
      setActivePhotoIndex((prev) => prev + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex > 0) {
      setActivePhotoIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          padding: "24px",
          backgroundColor: "#1c1c1e", // Dark theme background
          color: "#fff",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#fff",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            lineHeight: "1",
            zIndex: 10,
          }}
        >
          &times;
        </button>

        {/* Header (Avatar + Name) */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #ff5e00",
              flexShrink: 0,
              background: "#333",
            }}
          >
            {business.avatarUrl ? (
              <img
                src={business.avatarUrl}
                alt={business.fullName || "Business"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", color: "#666" }}>
                🏪
              </div>
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
              {business.fullName || "Unnamed Venue"}
            </h2>
          </div>
        </div>

        {/* Gallery Carousel */}
        {business.photos && business.photos.length > 0 && (
          <div style={{ position: "relative", marginBottom: "20px", borderRadius: "12px", overflow: "hidden", aspectRatio: "16/9", background: "#000" }}>
            <img
              src={business.photos[activePhotoIndex]}
              alt="Gallery"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {business.photos.length > 1 && (
              <>
                {activePhotoIndex > 0 && (
                  <button
                    onClick={handlePrevPhoto}
                    style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    &#10094;
                  </button>
                )}
                {activePhotoIndex < business.photos.length - 1 && (
                  <button
                    onClick={handleNextPhoto}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    &#10095;
                  </button>
                )}
                <div style={{ position: "absolute", bottom: "10px", left: "0", right: "0", display: "flex", justifyContent: "center", gap: "6px" }}>
                  {business.photos.map((_, i) => (
                    <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i === activePhotoIndex ? "#ff5e00" : "rgba(255,255,255,0.5)" }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Bio */}
        {business.bio && (
          <div style={{ marginBottom: "24px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5", fontSize: "15px", whiteSpace: "pre-wrap" }}>
            {business.bio}
          </div>
        )}

        {/* Active Offers */}
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
          Active Offers
        </h3>
        
        {offers.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>No active offers right now.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#ff5e00", fontWeight: "700" }}>{offer.title}</h4>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
                    Reward: <strong>{offer.rewardType === "percentage" ? `${offer.rewardPercent}%` : formatCurrency(offer.rewardAmount, business.currency || "IDR")}</strong>
                  </div>
                </div>
                {onCopyLink && (
                  <button
                    onClick={() => onCopyLink(offer.id)}
                    style={{
                      padding: "10px",
                      background: copiedId === offer.id ? "#4caf50" : "#ff5e00",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                    }}
                  >
                    {copiedId === offer.id ? "Copied!" : "Copy Checkout Link"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
