"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailedContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--error, #ff4d4f)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
        ⚠️
      </div>
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: 900,
          marginBottom: "1rem",
        }}
      >
        Payment Failed
      </h1>
      <p style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: "2rem", maxWidth: "400px" }}>
        The payment was declined or expired. Please try scanning the QR code again or contact the staff.
      </p>
      
      {paymentId && (
        <div style={{ background: "rgba(0,0,0,0.1)", padding: "10px 20px", borderRadius: "20px", fontSize: "0.8rem", fontFamily: "monospace" }}>
          ID: {paymentId}
        </div>
      )}
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--error, #ff4d4f)" }}></div>}>
      <FailedContent />
    </Suspense>
  );
}
