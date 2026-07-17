"use client";

import SettingsSidebar from "@/app/components/SettingsSidebar";

// Inside the component... I need to replace from line 58. Wait, I should fetch the whole page first to do it properly. Let's do a multi-replace, but first read the top of partner/page.tsx
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authService, offerRepository } from "@/lib/services";
import { supabase } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/interfaces/auth";
import { Offer } from "@/lib/interfaces/offers";
import { formatCurrency } from "@/lib/utils/currency";
import dynamic from "next/dynamic";
import BusinessProfileModal from "@/app/components/BusinessProfileModal";

const AgentMap = dynamic(() => import("@/app/components/AgentMap"), {
  ssr: false,
  loading: () => <div style={{ height: "500px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>Загрузка карты...</div>
});

const translations = {
  en: {
    totalEarnings: "Total Earnings",
    mapView: "Map View",
    listView: "List View",
    exploreMap: "Explore active venues around you. Click a pin to copy your checkout link.",
    exploreList: "Generate a direct checkout link and send it to the tourist. You will receive commission automatically when they pay.",
    loading: "Loading Partner Portal..."
  },
  ru: {
    totalEarnings: "Общий заработок",
    mapView: "Карта",
    listView: "Список",
    exploreMap: "Исследуйте активные заведения вокруг. Нажмите на пин, чтобы скопировать ссылку.",
    exploreList: "Сгенерируйте ссылку и отправьте туристу. Вы получите комиссию автоматически после оплаты.",
    loading: "Загрузка портала партнера..."
  },
  id: {
    totalEarnings: "Total Pendapatan",
    mapView: "Tampilan Peta",
    listView: "Tampilan Daftar",
    exploreMap: "Jelajahi tempat aktif di sekitar Anda. Klik pin untuk menyalin tautan.",
    exploreList: "Hasilkan tautan pembayaran langsung dan kirimkan ke turis. Anda akan menerima komisi otomatis.",
    loading: "Memuat Portal Mitra..."
  },
  zh: {
    totalEarnings: "总收入",
    mapView: "地图视图",
    listView: "列表视图",
    exploreMap: "探索您周围的活跃场所。点击大头针复制您的结账链接。",
    exploreList: "生成直接结账链接并发送给游客。他们付款后您将自动收到佣金。",
    loading: "正在加载合作伙伴门户..."
  },
  es: {
    totalEarnings: "Ganancias Totales",
    mapView: "Vista de Mapa",
    listView: "Vista de Lista",
    exploreMap: "Explore lugares activos a su alrededor. Haga clic en un pin para copiar su enlace de pago.",
    exploreList: "Genere un enlace directo y envíelo al turista. Recibirá una comisión automáticamente cuando paguen.",
    loading: "Cargando Portal de Socios..."
  },
  de: {
    totalEarnings: "Gesamteinnahmen",
    mapView: "Kartenansicht",
    listView: "Listenansicht",
    exploreMap: "Erkunden Sie aktive Veranstaltungsorte in Ihrer Nähe. Klicken Sie auf einen Pin, um den Link zu kopieren.",
    exploreList: "Erstellen Sie einen direkten Checkout-Link und senden Sie ihn an den Touristen. Sie erhalten automatisch eine Provision, wenn diese bezahlen.",
    loading: "Lade Partnerportal..."
  },
  fr: {
    totalEarnings: "Gains Totaux",
    mapView: "Vue Carte",
    listView: "Vue Liste",
    exploreMap: "Explorez les lieux actifs autour de vous. Cliquez sur une épingle pour copier votre lien de paiement.",
    exploreList: "Générez un lien de paiement direct et envoyez-le au touriste. Vous recevrez une commission automatiquement lorsqu'ils paieront.",
    loading: "Chargement du Portail Partenaire..."
  },
  ja: {
    totalEarnings: "総収益",
    mapView: "マップビュー",
    listView: "リストビュー",
    exploreMap: "あなたの周りのアクティブな会場を探索します。ピンをクリックしてリンクをコピーしてください。",
    exploreList: "直接のチェックアウトリンクを生成して観光客に送信します。彼らが支払うと自動的にコミッションを受け取ります。",
    loading: "パートナーポータルを読み込み中..."
  },
  ar: {
    totalEarnings: "إجمالي الأرباح",
    mapView: "عرض الخريطة",
    listView: "عرض القائمة",
    exploreMap: "استكشف الأماكن النشطة من حولك. انقر فوق دبوس لنسخ رابط الدفع الخاص بك.",
    exploreList: "قم بإنشاء رابط دفع مباشر وأرسله إلى السائح. سوف تتلقى عمولة تلقائيًا عند الدفع.",
    loading: "جارٍ تحميل بوابة الشركاء..."
  },
  pt: {
    totalEarnings: "Ganhos Totais",
    mapView: "Vista de Mapa",
    listView: "Vista de Lista",
    exploreMap: "Explore locais ativos ao seu redor. Clique num pino para copiar o seu link de pagamento.",
    exploreList: "Gere um link de pagamento direto e envie para o turista. Receberá uma comissão automaticamente quando eles pagarem.",
    loading: "A carregar Portal do Parceiro..."
  },
  hi: {
    totalEarnings: "कुल कमाई",
    mapView: "मानचित्र दृश्य",
    listView: "सूची दृश्य",
    exploreMap: "अपने आस-पास सक्रिय स्थानों का अन्वेषण करें। अपने चेकआउट लिंक को कॉपी करने के लिए एक पिन पर क्लिक करें।",
    exploreList: "एक सीधा चेकआउट लिंक उत्पन्न करें और पर्यटक को भेजें। जब वे भुगतान करेंगे तो आपको स्वचालित रूप से कमीशन प्राप्त होगा।",
    loading: "पार्टनर पोर्टल लोड हो रहा है..."
  }
};;

export default function PartnerDashboardV4() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "map">("map");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<{ business: any; offers: Offer[] } | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<any[]>([]);
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
        if (currentUser.theme) {
          document.documentElement.setAttribute('data-theme', currentUser.theme);
        }

        // V4: Get active venues/offers
        const activeOffers = await offerRepository.getOffers({
          onlyActive: true,
        });
        setOffers(activeOffers);

        // Get all businesses for map bypassing RLS
        const { getPublicBusinesses } = await import("@/app/actions/getPublicBusinesses");
        const businesses = await getPublicBusinesses();
        setAllBusinesses(businesses);

        setLoading(false);
      } catch (err) {
        console.error("Error loading partner dashboard:", err);
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleCopyLink = async (businessId: string) => {
    if (!user) return;
    try {
      setCopiedLink("loading-" + businessId);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const res = await fetch("/api/v1/links/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          agentId: user.id,
          businessId,
          isSingleUse: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate link");

      const origin = window.location.origin;
      const link = `${origin}/checkout?link_id=${data.linkId}`;
      await navigator.clipboard.writeText(link);
      
      setCopiedLink(businessId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to generate link");
      setCopiedLink(null);
    }
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
          border: "none",
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
        user={user}
        onLogout={handleLogout}
      />
      
      {selectedBusiness && (
        <BusinessProfileModal
          business={selectedBusiness.business}
          offers={selectedBusiness.offers}
          onClose={() => setSelectedBusiness(null)}
          onCopyLink={handleCopyLink}
          copiedId={copiedLink}
        />
      )}

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
          allBusinesses={allBusinesses}
          userCurrency={user?.currency || "IDR"}
          onMarkerClick={(business, businessOffers) => setSelectedBusiness({ business, offers: businessOffers })}
          theme={user?.theme === "light" ? "light" : "dark"}
          lang={lang}
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
                  Global Margin: {offer.globalMarginPercent}%
                  {offer.averageBill ? ` (~ ${formatCurrency(offer.averageBill * (offer.globalMarginPercent / 100) * 0.6, user?.currency || "USD")} reward)` : ""}
                </p>
              </div>
              <button
                onClick={() => handleCopyLink(offer.businessId)}
                disabled={copiedLink === `loading-${offer.businessId}`}
                className="btn-primary"
                style={{
                  background:
                    copiedLink === offer.businessId
                      ? "var(--success)"
                      : "var(--primary)",
                  opacity: copiedLink === `loading-${offer.businessId}` ? 0.7 : 1
                }}
              >
                {copiedLink === `loading-${offer.businessId}` ? "Generating..." : copiedLink === offer.businessId ? "Copied!" : "Copy Link"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
