"use client";

import { useEffect, useState } from "react";
import { getWalletBalance } from "@/app/actions/wallet";
import { formatCurrency } from "@/lib/utils/currency";
import { useRouter } from "next/navigation";

interface WalletWidgetProps {
  userId: string;
}

export default function WalletWidget({ userId }: WalletWidgetProps) {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const router = useRouter();

  useEffect(() => {
    async function loadBalance() {
      if (!userId) return;
      const res = await getWalletBalance(userId);
      setBalance(res.balance);
      setCurrency(res.currency);
    }
    loadBalance();
    
    // Auto refresh every 30s
    const interval = setInterval(loadBalance, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        background: "linear-gradient(135deg, rgba(255, 94, 0, 0.1), rgba(255, 94, 0, 0.05))",
        border: "1px solid rgba(255, 94, 0, 0.2)",
        borderRadius: "20px",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.borderColor = "rgba(255, 94, 0, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.borderColor = "rgba(255, 94, 0, 0.2)";
      }}
      title="Open Wallet"
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          background: "#ff5e00",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "12px",
        }}
      >
        $
      </div>
      <span style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.9rem" }}>
        {formatCurrency(balance, currency)}
      </span>
    </div>
  );
}
