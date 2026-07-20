"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import QRCode from "react-qr-code";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const linkId = searchParams.get("link_id");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);

  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<
    "loading" | "input" | "qr" | "processing" | "success"
  >("loading");
  const [currency, setCurrency] = useState<string>("IDR");
  const [globalMargin, setGlobalMargin] = useState<number>(10.0);
  const [businessName, setBusinessName] = useState<string>("");

  useEffect(() => {
    async function init() {
      if (!linkId) {
        alert("Payment link is missing.");
        setStatus("input");
        return;
      }

      let currentBusinessId = null;
      try {
        const { data: link, error: linkError } = await supabase
          .from("payment_links")
          .select("business_id, agent_id, is_active, ttl_expires_at")
          .eq("id", linkId)
          .single();

        if (linkError || !link || !link.is_active || new Date(link.ttl_expires_at) < new Date()) {
          alert("Payment link is invalid or has expired.");
          setStatus("input");
          return;
        }
        currentBusinessId = link.business_id;
        setBusinessId(link.business_id);
        setAgentId(link.agent_id);
      } catch (e) {
        console.error("Error fetching link:", e);
        setStatus("input");
        return;
      }

      try {
        const { data: business } = await supabase
          .from("businesses")
          .select("owner_id, name")
          .eq("id", currentBusinessId)
          .single();

        if (business?.name) {
          setBusinessName(business.name);
        }

        if (business?.owner_id) {
          const { data: user } = await supabase
            .from("profiles")
            .select("currency")
            .eq("id", business.owner_id)
            .single();

          if (user?.currency) {
            setCurrency(user.currency);
          }
        }

        // Fetch Global Margin from offers
        const { data: offer } = await supabase
          .from("offers")
          .select("global_margin_percent")
          .eq("business_id", currentBusinessId)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (offer?.global_margin_percent) {
          setGlobalMargin(offer.global_margin_percent);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      }
      setStatus("input");
    }
    init();
  }, [linkId]);

  // В V4: скидка туристу (30% от Global Margin)
  const TOURIST_DISCOUNT_PERCENT = (globalMargin / 100) * 0.3;

  // Парсим значение, разрешая цифры, точки и запятые
  const rawAmount = parseFloat(amount.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const discount = rawAmount * TOURIST_DISCOUNT_PERCENT;
  const finalAmount = rawAmount - discount;

  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handlePay = async () => {
    if (rawAmount <= 0) return;
    setStatus("processing");

    try {
      const res = await fetch("/api/v1/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: rawAmount,
          currency,
          linkId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.checkoutUrl) {
        // Redirect to Xendit Hosted Checkout
        window.location.href = data.checkoutUrl;
      } else {
        // Fallback for local testing if checkoutUrl is missing
        setPaymentId(data.paymentId);
        setStatus("qr");
      }
    } catch (e) {
      console.error(e);
      setStatus("input");
      alert("Payment initialization failed");
    }
  };

  const formatCurrencyValue = (num: number) => {
    return new Intl.NumberFormat("ru-RU", {
      maximumFractionDigits: currency === "IDR" ? 0 : 2,
    }).format(num);
  };

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--surface)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes spin { to { transform: rotate(360deg); } }`,
          }}
        />
      </div>
    );
  }

  if (status === "qr") {
    // Тестовая нагрузка (payload) для QR-кода
    const qrPayload = `agentcore:pay?b=${businessId}&a=${agentId}&payment_id=${paymentId}&amount=${finalAmount}&currency=${currency}`;

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            marginBottom: "2rem",
            textAlign: "center",
            letterSpacing: "1px",
          }}
        >
          SCAN TO PAY
        </h2>

        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "16px",
            marginBottom: "2rem",
          }}
        >
          <QRCode
            value={qrPayload}
            size={240}
            bgColor="#ffffff"
            fgColor="#0a0a0a"
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p
            style={{ opacity: 0.7, marginBottom: "0.5rem", fontSize: "0.9rem" }}
          >
            Total Amount
          </p>
          <h1 style={{ fontSize: "2.5rem", color: "var(--primary)" }}>
            {formatCurrencyValue(finalAmount)} {currency}
          </h1>
        </div>


      </div>
    );
  }

  if (status === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--success)", // Строгий зеленый экран успеха для кассира
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: 900,
            marginBottom: "1rem",
            textTransform: "uppercase",
          }}
        >
          PAID
        </h1>
        <div
          style={{
            background: "rgba(0,0,0,0.2)",
            padding: "2rem",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <p
            style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "0.5rem" }}
          >
            Amount Paid
          </p>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: "2rem",
            }}
          >
            {formatCurrencyValue(finalAmount)} {currency}
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              paddingTop: "1rem",
              opacity: 0.8,
            }}
          >
            <span>Date:</span>
            <strong>
              {new Date().toLocaleDateString()}{" "}
              {new Date().toLocaleTimeString()}
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.5rem",
              opacity: 0.8,
            }}
          >
            <span>Ref ID:</span>
            <strong>#AC-{Math.floor(Math.random() * 1000000)}</strong>
          </div>
        </div>
        <p style={{ marginTop: "2rem", fontSize: "1.2rem", fontWeight: 700 }}>
          SHOW THIS SCREEN TO STAFF
        </p>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid var(--surface)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <h2 style={{ marginTop: "2rem", fontSize: "1.5rem", fontWeight: 700 }}>
          Processing Payment...
        </h2>
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes spin { to { transform: rotate(360deg); } }`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "2px",
            color: "var(--primary)",
          }}
        >
          PAY CORE
        </h1>
        <p style={{ opacity: 0.6, fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Secure Checkout
        </p>
        {businessName && (
          <div style={{
            marginTop: "1.5rem",
            padding: "0.75rem",
            background: "var(--surface)",
            borderRadius: "8px",
            border: "1px solid var(--surface-border)",
            display: "inline-block",
            minWidth: "200px"
          }}>
            <p style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "1px" }}>Payment to</p>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>{businessName}</h2>
          </div>
        )}
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "400px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            padding: "2rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            border: "1px solid var(--surface-border)",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Enter Bill Amount
          </h2>

          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                // Только цифры, форматируем с пробелами
                const val = e.target.value.replace(/\D/g, "");
                if (val) {
                  setAmount(
                    new Intl.NumberFormat("ru-RU").format(parseInt(val, 10)),
                  );
                } else {
                  setAmount("");
                }
              }}
              style={{
                width: "100%",
                background: "var(--background)",
                border: "2px solid var(--surface-border)",
                borderRadius: "8px",
                padding: "1rem 4.5rem 1rem 1rem", // right padding for currency
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--foreground)",
                outline: "none",
              }}
              placeholder="0"
            />
            <span
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.2rem",
                fontWeight: 700,
                opacity: 0.5,
              }}
            >
              {currency}
            </span>
          </div>

          {rawAmount > 0 && (
            <div
              style={{
                background: "rgba(249, 115, 22, 0.1)",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid rgba(249, 115, 22, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  opacity: 0.8,
                }}
              >
                <span>Subtotal:</span>
                <span>
                  {formatCurrencyValue(rawAmount)} {currency}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  color: "var(--primary)",
                  fontWeight: 700,
                }}
              >
                <span>AgentCore Discount ({(TOURIST_DISCOUNT_PERCENT * 100).toFixed(1)}%):</span>
                <span>
                  - {formatCurrencyValue(discount)} {currency}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(249, 115, 22, 0.2)",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                }}
              >
                <span>Total to Pay:</span>
                <span>
                  {formatCurrencyValue(finalAmount)} {currency}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handlePay}
          disabled={rawAmount <= 0}
          style={{
            width: "100%",
            background:
              rawAmount > 0 ? "var(--primary)" : "var(--surface-border)",
            color: rawAmount > 0 ? "#000" : "var(--foreground)",
            opacity: rawAmount > 0 ? 1 : 0.5,
            padding: "1.2rem",
            fontSize: "1.2rem",
            fontWeight: 800,
            border: "none",
            borderRadius: "8px",
            cursor: rawAmount > 0 ? "pointer" : "not-allowed",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          Loading...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
