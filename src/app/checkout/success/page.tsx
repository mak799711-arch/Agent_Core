"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--success, #52c41a)",
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
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: 900,
          marginBottom: "1rem",
        }}
      >
        PAID
      </h1>
      <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "2rem" }}>
        Show this screen to the staff
      </p>
      
      {paymentId && (
        <div style={{ background: "rgba(0,0,0,0.1)", padding: "10px 20px", borderRadius: "20px", fontSize: "0.8rem", fontFamily: "monospace" }}>
          ID: {paymentId}
        </div>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--success, #52c41a)" }}></div>}>
      <SuccessContent />
    </Suspense>
  );
}
