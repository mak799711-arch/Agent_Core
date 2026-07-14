"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, walletRepository } from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";
import { Transaction } from "@/lib/interfaces/wallet";
import { formatCurrency } from "@/lib/utils/currency";

export default function BusinessWalletPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== "business") {
          router.replace("/login");
          return;
        }
        setUser(currentUser);

        const bal = await walletRepository.getBalance(currentUser.id);
        setBalance(bal);

        const txs = await walletRepository.getTransactions(currentUser.id);
        setTransactions(txs);
      } catch (err) {
        console.error("Failed to load wallet", err);
      } finally {
        setLoading(false);
      }
    };
    loadWallet();
  }, [router]);

  const handleMockTopUp = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await walletRepository.createTransaction({
        userId: user.id,
        amount: 1000,
        type: "deposit",
        status: "completed",
      });
      const bal = await walletRepository.getBalance(user.id);
      setBalance(bal);
      const txs = await walletRepository.getTransactions(user.id);
      setTransactions(txs);
      setShowTopUp(false);
    } catch (err) {
      console.error(err);
      alert("Failed to top up");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--foreground)" }}>
        Loading Wallet...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
        padding: "var(--layout-padding)",
        paddingBottom: "6rem",
      }}
    >
      <header
        className="glass-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1rem",
        }}
      >
        <button
          onClick={() => router.push("/business")}
          style={{
            background: "none",
            border: "none",
            color: "var(--foreground)",
            cursor: "pointer",
            fontSize: "1.5rem",
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Wallet & Escrow</h1>
        <div style={{ width: "24px" }} />
      </header>

      <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Balance Card */}
        <div
          className="panel"
          style={{
            padding: "2rem",
            background: "linear-gradient(135deg, var(--primary) 0%, rgba(139, 92, 246, 0.8) 100%)",
            color: "#fff",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
          }}
        >
          <span style={{ fontSize: "0.9rem", opacity: 0.9, textTransform: "uppercase", letterSpacing: "1px" }}>
            Available Reserve
          </span>
          <h2 style={{ fontSize: "3rem", margin: "10px 0", fontWeight: 800 }}>
            {formatCurrency(balance, "USD")}
          </h2>
          <button
            className="btn-primary"
            onClick={() => setShowTopUp(true)}
            style={{
              background: "#fff",
              color: "var(--primary)",
              marginTop: "1rem",
              padding: "0.8rem 2rem",
            }}
          >
            Deposit Funds
          </button>
        </div>

        {/* Transactions List */}
        <div className="panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0" }}>Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p style={{ opacity: 0.5, textAlign: "center", margin: "2rem 0" }}>
              No transactions yet
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--surface-border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {tx.type === "deposit" ? "Deposit" : tx.type === "escrow_hold" ? "Escrow Hold" : tx.type === "escrow_release" ? "Escrow Released" : tx.type}
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>
                      {new Date(tx.createdAt || "").toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: ["deposit", "escrow_release"].includes(tx.type) ? "var(--success)" : "var(--error)",
                    }}
                  >
                    {["deposit", "escrow_release"].includes(tx.type) ? "+" : "-"}{formatCurrency(tx.amount, "USD")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="panel" style={{ width: "90%", maxWidth: "400px", padding: "2rem", textAlign: "center" }}>
            <h3 style={{ marginTop: 0 }}>Mock Payment</h3>
            <p style={{ opacity: 0.7, marginBottom: "2rem" }}>
              Simulate depositing $1,000 into your reserve balance for MVP testing.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowTopUp(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleMockTopUp}>Pay $1000</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
