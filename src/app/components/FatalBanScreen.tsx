"use client";

import React, { useState } from "react";
import { UserProfile } from "@/lib/interfaces/auth";

export default function FatalBanScreen({ user }: { user: UserProfile }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const { supabase } = await import("@/lib/supabase/client");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const res = await fetch("/api/v1/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      
      setSent(true);
      setMessage("");
    } catch (e: any) {
      setError(e.message || "Failed to send message. Try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "linear-gradient(145deg, #2a0808 0%, #110000 100%)",
          border: "1px solid #ff4444",
          borderRadius: "24px",
          padding: "30px",
          boxShadow: "0 10px 40px rgba(255, 0, 0, 0.2)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "rgba(255, 68, 68, 0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
          }}
        >
          <span style={{ fontSize: "40px" }}>🚫</span>
        </div>
        
        <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "15px", color: "#ff4444" }}>
          Простите, вы забанены
        </h1>
        <p style={{ fontSize: "16px", color: "#ccc", marginBottom: "30px", lineHeight: 1.5 }}>
          Ваш аккаунт был заблокирован за нарушение правил платформы. Устройство отключено.
        </p>

        {sent ? (
          <div style={{ background: "rgba(76, 175, 80, 0.1)", border: "1px solid #4CAF50", borderRadius: "12px", padding: "20px", color: "#4CAF50" }}>
            Ваше сообщение успешно отправлено администратору. Ожидайте ответа.
          </div>
        ) : (
          <div style={{ textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#888", fontSize: "14px" }}>
              Вы можете отправить апелляцию администратору:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Опишите ситуацию..."
              rows={4}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "12px",
                color: "#fff",
                fontSize: "14px",
                marginBottom: "15px",
                resize: "none",
                outline: "none",
                fontFamily: "inherit"
              }}
            />
            {error && <p style={{ color: "#ff4444", fontSize: "14px", marginTop: "-10px", marginBottom: "10px" }}>{error}</p>}
            <button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              style={{
                width: "100%",
                padding: "14px",
                background: sending || !message.trim() ? "#444" : "#ff4444",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: sending || !message.trim() ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {sending ? "Отправка..." : "Написать админу"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
