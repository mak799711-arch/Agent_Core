"use client";

import SettingsSidebar from "@/app/components/SettingsSidebar";

// Inside the component... I need to replace from line 58. Wait, I should fetch the whole page first to do it properly. Let's do a multi-replace, but first read the top of partner/page.tsx
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authService, offerRepository } from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";
import { Offer } from "@/lib/interfaces/offers";
import dynamic from "next/dynamic";

const AgentMap = dynamic(() => import("@/app/components/AgentMap"), {
  ssr: false,
  loading: () => <div style={{ height: "500px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>Загрузка карты...</div>
});

const translations: Record<string, any> = {
  en: {
    totalEarnings: "Total Earnings",
    mapView: "Map View",
    listView: "List View",
    exploreMap:
      "Explore active venues around you. Click a pin to copy your checkout link.",
    exploreList:
      "Generate a direct checkout link and send it to the tourist. You will receive commission automatically when they pay.",
    loading: "Loading Partner Portal...",
  },
  ru: {
    totalEarnings: "Общий заработок",
    mapView: "Ближайшие предложения",
    listView: "Доска заданий",
    exploreMap:
      "Изучайте активные заведения вокруг. Нажмите на пин, чтобы скопировать вашу ссылку.",
    exploreList:
      "Сгенерируйте прямую ссылку на оплату и отправьте туристу. Вы автоматически получите комиссию при оплате.",
    loading: "Загрузка...",
  },
  id: {
    totalEarnings: "Total Pendapatan",
    mapView: "Tawaran Terdekat",
    listView: "Papan Tugas",
    exploreMap:
      "Jelajahi tempat aktif di sekitar Anda. Klik pin untuk menyalin tautan checkout.",
    exploreList:
      "Hasilkan tautan pembayaran langsung dan kirimkan ke turis. Anda akan menerima komisi secara otomatis saat mereka membayar.",
    loading: "Memuat...",
  },
};

export default function PartnerDashboardV4() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== "partner") {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        // V4: Get active venues/offers
        const activeOffers = await offerRepository.getOffers({
          onlyActive: true,
        });
        setOffers(activeOffers);

        setLoading(false);
      } catch (err) {
        console.error("Error loading partner dashboard:", err);
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleCopyLink = (businessId: string) => {
    if (!user) return;
    // V4: Direct Checkout Gateway Link
    // In production, this would point to the actual domain.
    const link = `https://agentcore.app/checkout?b=${businessId}&a=${user.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(businessId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/login");
  };

  const lang = user?.language || "en";
  const t = translations[lang] || translations.en;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-gradient)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="spinner"
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--surface-border)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              marginBottom: "1rem",
              margin: "0 auto 1rem auto",
            }}
          />
          <p style={{ color: "var(--foreground)", fontWeight: 600 }}>
            {t.loading || "Loading..."}
          </p>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
                .spinner {
                  animation: spin 1s linear infinite;
                }
              `,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-gradient)",
        color: "var(--foreground)",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
          background: "var(--glass-bg)",
          padding: "1rem 1.5rem",
          borderRadius: "16px",
          border: "1px solid var(--surface-border)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Hamburger Icon */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--foreground)",
            fontSize: "1.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            marginLeft: "-8px",
          }}
        >
          ☰
        </button>

        {/* User Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={() => router.push("/partner/profile")}
        >
          <h4
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {user?.fullName || "Agent"}
          </h4>
          <img
            src={
              user?.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
            }
            alt="Avatar"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--primary)",
            }}
          />
        </div>
      </header>

      <SettingsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveTab("list")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background:
              activeTab === "list" ? "var(--primary)" : "var(--surface)",
            color: activeTab === "list" ? "#000" : "var(--foreground)",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {t.listView}
        </button>
        <button
          onClick={() => setActiveTab("map")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background:
              activeTab === "map" ? "var(--primary)" : "var(--surface)",
            color: activeTab === "map" ? "#000" : "var(--foreground)",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {t.mapView}
        </button>
      </div>

      <p style={{ opacity: 0.7, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        {activeTab === "map" ? t.exploreMap : t.exploreList}
      </p>

      {activeTab === "map" ? (
        <AgentMap
          activeOffers={offers}
          userCurrency={user?.currency || "IDR"}
          onCopyLink={handleCopyLink}
          copiedId={copiedLink}
          theme={user?.theme === "light" ? "light" : "dark"}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {offers.map((offer: any) => (
            <div
              key={offer.id}
              className="glass-panel"
              style={{
                padding: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "16px",
                border: "1px solid var(--surface-border)",
              }}
            >
              <div>
                <h4 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem 0" }}>
                  {offer.title}
                </h4>
                <p style={{ opacity: 0.7, fontSize: "0.9rem", margin: 0 }}>
                  Global Margin: 20% (You get {offer.rewardAmount} IDR)
                </p>
              </div>
              <button
                onClick={() => handleCopyLink(offer.businessId)}
                className="btn-primary"
                style={{
                  background:
                    copiedLink === offer.businessId
                      ? "var(--success)"
                      : "var(--primary)",
                }}
              >
                {copiedLink === offer.businessId ? "Copied!" : "Copy Link"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
