"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, ticketRepository } from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";

const translations = {
  en: {
    title: "Settings",
    themeLabel: "Theme",
    langLabel: "Language",
    currLabel: "Currency",
    cardLabel: "Payment",
    cardUnbound: "No card",
    btnUnbind: "Unbind",
    btnBind: "Add Card",
    verificationTitle: "Verification",
    statusPending: "Pending",
    statusVerified: "Verified",
    statusNone: "Not verified",
    logout: "Log Out",
  },
  ru: {
    title: "Настройки",
    themeLabel: "Тема",
    langLabel: "Язык",
    currLabel: "Валюта",
    cardLabel: "Оплата",
    cardUnbound: "Нет карты",
    btnUnbind: "Отвязать",
    btnBind: "Добавить",
    verificationTitle: "Верификация",
    statusPending: "На рассмотрении",
    statusVerified: "Верифицирован",
    statusNone: "Не верифицирован",
    logout: "Выйти",
  },
  id: {
    title: "Pengaturan",
    themeLabel: "Tema",
    langLabel: "Bahasa",
    currLabel: "Mata Uang",
    cardLabel: "Pembayaran",
    cardUnbound: "Tidak ada",
    btnUnbind: "Lepaskan",
    btnBind: "Tambah",
    verificationTitle: "Verifikasi",
    statusPending: "Tertunda",
    statusVerified: "Terverifikasi",
    statusNone: "Belum diverifikasi",
    logout: "Keluar",
  },
  zh: {
    title: "设置",
    themeLabel: "主题",
    langLabel: "语言",
    currLabel: "货币",
    cardLabel: "支付",
    cardUnbound: "未绑定",
    btnUnbind: "解绑",
    btnBind: "添加",
    verificationTitle: "验证",
    statusPending: "待处理",
    statusVerified: "已验证",
    statusNone: "未验证",
    logout: "登出",
  },
  es: {
    title: "Ajustes",
    themeLabel: "Tema",
    langLabel: "Idioma",
    currLabel: "Moneda",
    cardLabel: "Pago",
    cardUnbound: "Sin tarjeta",
    btnUnbind: "Desvincular",
    btnBind: "Añadir",
    verificationTitle: "Verificación",
    statusPending: "Pendiente",
    statusVerified: "Verificado",
    statusNone: "No verificado",
    logout: "Cerrar sesión",
  },
  de: {
    title: "Einstellungen",
    themeLabel: "Design",
    langLabel: "Sprache",
    currLabel: "Währung",
    cardLabel: "Zahlung",
    cardUnbound: "Keine Karte",
    btnUnbind: "Trennen",
    btnBind: "Hinzufügen",
    verificationTitle: "Verifizierung",
    statusPending: "Ausstehend",
    statusVerified: "Verifiziert",
    statusNone: "Nicht verifiziert",
    logout: "Abmelden",
  },
  fr: {
    title: "Paramètres",
    themeLabel: "Thème",
    langLabel: "Langue",
    currLabel: "Devise",
    cardLabel: "Paiement",
    cardUnbound: "Aucune carte",
    btnUnbind: "Délier",
    btnBind: "Ajouter",
    verificationTitle: "Vérification",
    statusPending: "En attente",
    statusVerified: "Vérifié",
    statusNone: "Non vérifié",
    logout: "Déconnexion",
  },
  ja: {
    title: "設定",
    themeLabel: "テーマ",
    langLabel: "言語",
    currLabel: "通貨",
    cardLabel: "支払い",
    cardUnbound: "カードなし",
    btnUnbind: "解除",
    btnBind: "追加",
    verificationTitle: "検証",
    statusPending: "保留中",
    statusVerified: "検証済み",
    statusNone: "未検証",
    logout: "ログアウト",
  },
  ar: {
    title: "الإعدادات",
    themeLabel: "سمة",
    langLabel: "لغة",
    currLabel: "عملة",
    cardLabel: "دفع",
    cardUnbound: "لا توجد بطاقة",
    btnUnbind: "إلغاء الربط",
    btnBind: "إضافة",
    verificationTitle: "التحقق",
    statusPending: "قيد الانتظار",
    statusVerified: "تم التحقق",
    statusNone: "لم يتم التحقق",
    logout: "تسجيل الخروج",
  },
  pt: {
    title: "Configurações",
    themeLabel: "Tema",
    langLabel: "Idioma",
    currLabel: "Moeda",
    cardLabel: "Pagamento",
    cardUnbound: "Sem cartão",
    btnUnbind: "Desvincular",
    btnBind: "Adicionar",
    verificationTitle: "Verificação",
    statusPending: "Pendente",
    statusVerified: "Verificado",
    statusNone: "Não verificado",
    logout: "Sair",
  },
  hi: {
    title: "सेटिंग्स",
    themeLabel: "थीम",
    langLabel: "भाषा",
    currLabel: "मुद्रा",
    cardLabel: "भुगतान",
    cardUnbound: "कोई कार्ड नहीं",
    btnUnbind: "अनलिंक करें",
    btnBind: "जोड़ें",
    verificationTitle: "सत्यापन",
    statusPending: "लंबित",
    statusVerified: "सत्यापित",
    statusNone: "असत्यापित",
    logout: "लॉग आउट",
  },
};

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsSidebar({
  isOpen,
  onClose,
}: SettingsSidebarProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<
    "ru" | "en" | "id" | "zh" | "es" | "de" | "fr"
  >("en");
  const [currency, setCurrency] = useState<
    "USD" | "IDR" | "EUR" | "RUB" | "CNY" | "AUD" | "SGD" | "GBP" | "JPY"
  >("USD");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [cardBound, setCardBound] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  const [newCardNumber, setNewCardNumber] = useState("");
  const [isBinding, setIsBinding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsReload, setNeedsReload] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "none" | "pending" | "verified"
  >("none");

  // Support Modal State
  const [showSupport, setShowSupport] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  const router = useRouter();
  const t = (translations as any)[lang] || translations.en;

  const handleSupportSubmit = async () => {
    if (!supportMessage.trim() || !user) return;
    setIsSubmittingSupport(true);
    try {
      await ticketRepository.createTicket(user.id, supportMessage);
      alert(lang === "ru" ? "Сообщение отправлено! Мы свяжемся с вами." : "Message sent! We will contact you soon.");
      setShowSupport(false);
      setSupportMessage("");
    } catch (error) {
      console.error(error);
      alert(lang === "ru" ? "Ошибка при отправке." : "Failed to send message.");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    async function loadUser() {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLang(currentUser.language);
        setCurrency(currentUser.currency);
        setCardBound(currentUser.cardBound);
        setCardNumber(currentUser.cardNumber || "");
        setAvatarUrl(currentUser.avatarUrl || "");

        let activeTheme =
          (localStorage.getItem("theme") as "dark" | "light" | null) ||
          (currentUser.theme as "dark" | "light");
        if (activeTheme !== "dark" && activeTheme !== "light")
          activeTheme = "dark";
        setTheme(activeTheme);

        if (currentUser.status === "verified")
          setVerificationStatus("verified");
        else if (currentUser.status === "pending")
          setVerificationStatus("pending");
        else setVerificationStatus("none");
      }
      setLoading(false);
    }
    loadUser();
  }, [isOpen, router]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const autoSave = async (updates: Partial<UserProfile>) => {
    try {
      await authService.updateProfile(updates);
    } catch (err) {
      console.error("Failed to auto-save", err);
    }
  };

  const handleThemeChange = async (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    await autoSave({ theme: newTheme });
    // Removed setNeedsReload(true) since AgentMap now updates dynamically!
  };

  const handleLangChange = async (newLang: any) => {
    setLang(newLang);
    await autoSave({ language: newLang });
    setNeedsReload(true);
  };

  const handleCurrencyChange = async (newCurr: any) => {
    setCurrency(newCurr);
    await autoSave({ currency: newCurr });
    setNeedsReload(true);
  };

  const handleUnbindCard = async () => {
    setCardBound(false);
    setCardNumber("");
    autoSave({ cardBound: false, cardNumber: null });
  };

  const handleBindCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCard = newCardNumber.replace(/\D/g, "");
    if (cleanCard.length < 16) return;
    const formattedCard = newCardNumber.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardNumber(formattedCard);
    setCardBound(true);
    setNewCardNumber("");
    setIsBinding(false);
    autoSave({ cardBound: true, cardNumber: formattedCard });
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    try {
      await authService.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error logging out", err);
    }
  };

  const handleProfileClick = () => {
    onClose();
    if (user?.role === "partner") {
      router.push("/partner/profile");
    } else {
      router.push("/business/profile");
    }
  };

  const handleClose = () => {
    if (needsReload) {
      window.location.reload();
    } else {
      onClose();
    }
  };

  const rowStyle = {
    padding: "1.2rem 1.5rem",
    borderBottom: "1px solid var(--surface-border)",
  };

  return (
    <>
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.2)",
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.2s ease-in-out",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: "280px",
          maxWidth: "85vw",
          background: "var(--background)",
          borderRight: "1px solid var(--surface-border)",
          zIndex: 1000,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.1)" : "none",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderBottom: "1px solid var(--surface-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>
            {t.title}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--foreground)",
              cursor: "pointer",
              fontSize: "1.5rem",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
              ...
            </div>
          ) : (
            <>
              {/* Profile Icon as a link to profile page */}
              <div
                style={{
                  ...rowStyle,
                  display: "flex",
                  justifyContent: "center",
                  padding: "2rem 1.5rem",
                }}
              >
                <img
                  onClick={handleProfileClick}
                  src={
                    avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
                  }
                  alt="Profile"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--primary)",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                />
              </div>



              {/* Theme Toggle (Horizontal) */}
              <div
                style={{
                  ...rowStyle,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {t.themeLabel}
                </span>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "44px",
                      height: "24px",
                      background:
                        theme === "dark"
                          ? "var(--primary)"
                          : "rgba(128,128,128,0.3)",
                      borderRadius: "12px",
                      transition: "background 0.3s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: theme === "dark" ? "22px" : "2px",
                        width: "20px",
                        height: "20px",
                        background: "#fff",
                        borderRadius: "50%",
                        transition: "left 0.3s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                  <input
                    type="checkbox"
                    style={{ display: "none" }}
                    checked={theme === "dark"}
                    onChange={() =>
                      handleThemeChange(theme === "dark" ? "light" : "dark")
                    }
                  />
                </label>
              </div>

              {/* Language (Vertical) */}
              <div
                style={{
                  ...rowStyle,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "4px",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {t.langLabel}
                </span>
                <select
                  value={lang}
                  onChange={(e) => handleLangChange(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "var(--primary)",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="id">Bahasa Indonesia</option>
                  <option value="zh">中文 (Chinese)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="fr">Français (French)</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="ar">العربية (Arabic)</option>
                  <option value="pt">Português (Portuguese)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              {/* Currency (Vertical) */}
              <div
                style={{
                  ...rowStyle,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "4px",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {t.currLabel}
                </span>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "var(--primary)",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="IDR">IDR (Rp)</option>
                  <option value="RUB">RUB (₽)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="BRL">BRL (R$)</option>
                </select>
              </div>

              {/* Verification (Vertical) */}
              {user?.role === "business" && (
                <div
                  style={{
                    ...rowStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        verificationStatus === "verified"
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(255, 170, 0, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      border: `2px solid ${verificationStatus === "verified" ? "var(--success)" : "var(--warning)"}`,
                    }}
                  >
                    {verificationStatus === "verified" ? "✅" : "⏳"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {t.verificationTitle}
                    </span>
                    <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                      {verificationStatus === "verified"
                        ? t.statusVerified
                        : verificationStatus === "pending"
                          ? t.statusPending
                          : t.statusNone}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Card (Vertical) */}
              <div
                style={{
                  ...rowStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {t.cardLabel}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div style={{ fontSize: "1.6rem" }}>💳</div>
                  <div style={{ flex: 1 }}>
                    {cardBound ? (
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontFamily: "monospace",
                          letterSpacing: "1px",
                        }}
                      >
                        {cardNumber}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                        {t.cardUnbound}
                      </div>
                    )}
                  </div>
                  {cardBound ? (
                    <button
                      onClick={handleUnbindCard}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--error)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t.btnUnbind}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsBinding(!isBinding)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t.btnBind}
                    </button>
                  )}
                </div>
                {isBinding && !cardBound && (
                  <form
                    onSubmit={handleBindCard}
                    style={{
                      width: "100%",
                      display: "flex",
                      gap: "8px",
                      marginTop: "6px",
                    }}
                  >
                    <input
                      type="text"
                      value={newCardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNewCardNumber(
                          val.replace(/(\d{4})(?=\d)/g, "$1 ").trim(),
                        );
                      }}
                      placeholder="0000 0000 0000 0000"
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        fontSize: "0.85rem",
                        background: "var(--surface-bg)",
                        border: "1px solid var(--surface-border)",
                        color: "var(--foreground)",
                        borderRadius: "6px",
                      }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        borderRadius: "6px",
                      }}
                    >
                      OK
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>


        {/* Support Button at the bottom */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderTop: "1px solid var(--surface-border)",
            display: "flex",
            gap: "1rem",
            background: "var(--background)",
          }}
        >
          <button
            onClick={() => setShowSupport(true)}
            className="btn-secondary"
            style={{ width: "100%" }}
          >
            {lang === "ru" ? "Служба поддержки" : lang === "id" ? "Dukungan" : "Support"}
          </button>
        </div>

        {/* Footer Logout (Removed Save button) */}
        <div
          style={{
            padding: "1.2rem 1.5rem",
            borderTop: "1px solid var(--surface-border)",
            display: "flex",
            gap: "1rem",
            background: "var(--background)",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(244, 63, 94, 0.1)",
              border: "1px solid rgba(244, 63, 94, 0.2)",
              color: "var(--error)",
              fontSize: "0.9rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            {t.logout || "Logout"}
          </button>
        </div>
      </div>

      {/* Support Modal */}
      {showSupport && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
        >
          <div className="panel" style={{ width: "100%", maxWidth: "500px", padding: "2rem", position: "relative" }}>
            <button
              onClick={() => setShowSupport(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                color: "var(--foreground)",
                fontSize: "1.5rem",
                cursor: "pointer"
              }}
            >
              ×
            </button>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
              {lang === "ru" ? "Служба поддержки" : "Support"}
            </h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "1.5rem" }}>
              {lang === "ru" 
                ? "Опишите вашу проблему или задайте вопрос. Мы ответим вам в ближайшее время." 
                : "Describe your issue or ask a question. We will get back to you shortly."}
            </p>
            <textarea
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder={lang === "ru" ? "Ваше сообщение..." : "Your message..."}
              rows={5}
              style={{
                width: "100%",
                background: "var(--surface-bg)",
                border: "1px solid var(--surface-border)",
                color: "var(--foreground)",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                resize: "vertical",
                fontSize: "0.95rem"
              }}
            />
            <button
              onClick={handleSupportSubmit}
              disabled={isSubmittingSupport || !supportMessage.trim()}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              {isSubmittingSupport ? "..." : (lang === "ru" ? "Отправить" : "Send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
