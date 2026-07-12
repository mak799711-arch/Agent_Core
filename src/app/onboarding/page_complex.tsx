"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";

const translations = {
  en: {
    title: "Welcome to Agent Core",
    subtitle: "Let's set up your billing profile",
    langLabel: "Preferred Language",
    currLabel: "Preferred Currency",
    cardLabel: "Credit / Debit Card (For Payouts & Reserves)",
    cardHolder: "Card Number",
    cardExpiry: "MM/YY",
    cardCvc: "CVC",
    btnNext: "Next Step",
    btnSubmit: "Complete Registration",
    errorCard: "Please enter a valid card number",
    success: "Profile configured successfully!",
    step1: "Step 1: Settings",
    step2: "Step 2: Payment Card",
    step3: "Step 3: Contacts",
    secured: "Secure 256-bit SSL encryption",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+1 (555) 000-0000",
    contactTitle: "Contact Information",
    btnSignOut: "Sign Out / Switch Account",
  },
  ru: {
    title: "Добро пожаловать в Agent Core",
    subtitle: "Давайте настроим ваш профиль выплат",
    langLabel: "Предпочитаемый язык",
    currLabel: "Основная валюта",
    cardLabel: "Кредитная / Дебетовая карта (Для выплат и резервов)",
    cardHolder: "Номер карты",
    cardExpiry: "ММ/ГГ",
    cardCvc: "CVC",
    btnNext: "Следующий шаг",
    btnSubmit: "Завершить регистрацию",
    errorCard: "Пожалуйста, введите корректный номер карты",
    success: "Профиль успешно настроен!",
    step1: "Шаг 1: Настройки",
    step2: "Шаг 2: Платежная карта",
    step3: "Шаг 3: Контакты",
    secured: "Защищено 256-битным SSL шифрованием",
    emailLabel: "Электронная почта",
    phoneLabel: "Номер телефона",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+7 (999) 000-00-00",
    contactTitle: "Контактная информация",
    btnSignOut: "Выйти / Сменить аккаунт",
  },
  id: {
    title: "Selamat datang di Agent Core",
    subtitle: "Mari siapkan profil pembayaran Anda",
    langLabel: "Bahasa Pilihan",
    currLabel: "Mata Uang Pilihan",
    cardLabel: "Kartu Kredit / Debit (Untuk Pembayaran & Cadangan)",
    cardHolder: "Nomor Kartu",
    cardExpiry: "MM/YY",
    cardCvc: "CVC",
    btnNext: "Langkah berikutnya",
    btnSubmit: "Selesaikan Pendaftaran",
    errorCard: "Silakan masukkan nomor kartu yang valid",
    success: "Profil berhasil dikonfigurasi!",
    step1: "Langkah 1: Pengaturan",
    step2: "Langkah 2: Kartu Pembayaran",
    step3: "Langkah 3: Kontak",
    secured: "Enkripsi SSL 256-bit yang aman",
    emailLabel: "Alamat Email",
    phoneLabel: "Nomor Telepon",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+62 812-3456-7890",
    contactTitle: "Informasi Kontak",
    btnSignOut: "Keluar / Ganti Akun",
  },
};

export default function OnboardingPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<
    "ru" | "en" | "id" | "zh" | "es" | "de" | "fr"
  >("en");
  const [currency, setCurrency] = useState<
    "USD" | "IDR" | "EUR" | "RUB" | "CNY" | "AUD" | "SGD" | "GBP" | "JPY"
  >("USD");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  const t = (translations as any)[lang] || translations.en;

  useEffect(() => {
    async function checkUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLang(currentUser.language);
        setCurrency(currentUser.currency);
        setEmail(currentUser.email || "");
        setPhone(currentUser.phone || "");
        // Если карта уже привязана и контакты заполнены, перенаправляем сразу в дашборд
        if (currentUser.cardBound && currentUser.phone) {
          router.push(`/${currentUser.role}`);
        }
      }
      setLoading(false);
    }
    checkUser();
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    if (formattedValue.length <= 19) {
      setCardNumber(formattedValue);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = value;
    if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    if (formattedValue.length <= 5) {
      setExpiry(formattedValue);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCvc(value);
    }
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, "").length < 16) {
      alert(t.errorCard);
      return;
    }
    setStep(3);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await authService.updateProfile({
        language: lang,
        currency,
        cardBound: true,
        cardNumber,
        email,
        phone,
      });
      alert(t.success);
      if (user) {
        router.push(`/${user.role}`);
      }
    } catch (err) {
      alert("Failed to save profile");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              border: "3px solid rgba(34, 211, 238, 0.1)",
              borderTop: "3px solid var(--primary)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto",
            }}
          />
          <p style={{ color: "var(--foreground)", fontWeight: 600 }}>
            Loading Onboarding...
          </p>
          <style
            dangerouslySetInnerHTML={{
              __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.06) 0%, #090a0f 100%)",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background light */}
      <div
        style={{
          position: "absolute",
          width: "350px",
          height: "350px",
          background: "rgba(34, 211, 238, 0.05)",
          filter: "blur(90px)",
          borderRadius: "50%",
          top: "25%",
          left: "15%",
          pointerEvents: "none",
        }}
      />

      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "3rem 2.5rem",
          boxShadow: "var(--card-shadow)",
          borderRadius: "24px",
          border: "1px solid var(--glass-border)",
          zIndex: 1,
        }}
      >
        {/* Progress Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            fontSize: "0.8rem",
            opacity: 0.8,
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          <span
            style={{
              color: step === 1 ? "var(--primary)" : "var(--foreground)",
              transition: "color 0.2s",
            }}
          >
            {t.step1.toUpperCase()}
          </span>
          <span
            style={{
              color: step === 2 ? "var(--primary)" : "var(--foreground)",
              transition: "color 0.2s",
            }}
          >
            {t.step2.toUpperCase()}
          </span>
          <span
            style={{
              color: step === 3 ? "var(--primary)" : "var(--foreground)",
              transition: "color 0.2s",
            }}
          >
            {t.step3.toUpperCase()}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "var(--surface-border)",
            borderRadius: "10px",
            marginBottom: "2.5rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: step === 1 ? "33.3%" : step === 2 ? "66.6%" : "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, var(--primary), var(--accent))",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          ></div>
        </div>

        <h2
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            marginBottom: "0.4rem",
            textAlign: "center",
            letterSpacing: "-0.5px",
          }}
        >
          {t.title}
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            opacity: 0.6,
            marginBottom: "2.5rem",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {t.subtitle}
        </p>

        {step === 1 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}
          >
            {/* Language Selector */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                {t.langLabel}
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                style={{
                  width: "100%",
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

            {/* Currency Selector */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                {t.currLabel}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                style={{
                  width: "100%",
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
                <option value="AUD">AUD (A$)</option>
                <option value="SGD">SGD (S$)</option>
              </select>
            </div>

            <button
              onClick={handleNextStep}
              className="btn-primary"
              style={{
                marginTop: "1rem",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              {t.btnNext}
            </button>
          </div>
        )}

        {step === 2 && (
          <form
            onSubmit={handleCardSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}
          >
            {/* Card Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                {t.cardLabel}
              </label>

              {/* Virtual Mock Card Visual */}
              <div
                className="glass-panel"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)",
                  padding: "1.8rem",
                  borderRadius: "20px",
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "180px",
                  border: "1px solid var(--glass-border)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      letterSpacing: "1.5px",
                      opacity: 0.9,
                    }}
                  >
                    AGENT CARD
                  </span>
                  <div
                    style={{
                      width: "36px",
                      height: "24px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                    }}
                  ></div>
                </div>
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "2.5px",
                    margin: "1rem 0",
                    fontFamily: "monospace",
                  }}
                >
                  {cardNumber || "•••• •••• •••• ••••"}
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    opacity: 0.8,
                  }}
                >
                  <span style={{ textTransform: "uppercase" }}>
                    {user?.fullName || "CARD HOLDER"}
                  </span>
                  <span>{expiry || "MM/YY"}</span>
                </div>
              </div>

              {/* Card Form Fields */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  required
                  style={{
                    fontSize: "1.1rem",
                    letterSpacing: "1px",
                    textAlign: "center",
                  }}
                />

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder={t.cardExpiry}
                    required
                    style={{
                      flex: 1,
                      textAlign: "center",
                    }}
                  />
                  <input
                    type="password"
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder={t.cardCvc}
                    required
                    style={{
                      flex: 1,
                      textAlign: "center",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid var(--surface-border)",
                  boxShadow: "none",
                }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  flex: 2,
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)",
                  boxShadow: "0 4px 14px rgba(244, 63, 94, 0.2)",
                }}
              >
                {t.btnNext}
              </button>
            </div>

            <span
              style={{
                fontSize: "0.75rem",
                opacity: 0.5,
                textAlign: "center",
                marginTop: "0.5rem",
                display: "block",
                fontWeight: 600,
              }}
            >
              🔒 {t.secured}
            </span>
          </form>
        )}

        {step === 3 && (
          <form
            onSubmit={handleCompleteRegistration}
            style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "-0.5rem",
                color: "var(--primary)",
              }}
            >
              {t.contactTitle}
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
              }}
            >
              {/* Email Address */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  required
                  style={{ width: "100%", fontSize: "1rem", padding: "12px" }}
                />
              </div>

              {/* Phone Number */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  required
                  style={{ width: "100%", fontSize: "1rem", padding: "12px" }}
                />
              </div>
            </div>

            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}
            >
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid var(--surface-border)",
                  boxShadow: "none",
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="btn-primary"
                style={{
                  flex: 2,
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)",
                  boxShadow: "0 4px 14px rgba(244, 63, 94, 0.2)",
                }}
              >
                {submitLoading ? "Saving..." : t.btnSubmit}
              </button>
            </div>

            <span
              style={{
                fontSize: "0.75rem",
                opacity: 0.5,
                textAlign: "center",
                marginTop: "0.5rem",
                display: "block",
                fontWeight: 600,
              }}
            >
              🔒 {t.secured}
            </span>
          </form>
        )}

        {/* Sign Out / Switch Account */}
        <div
          style={{
            textAlign: "center",
            marginTop: "1.8rem",
            borderTop: "1px solid var(--surface-border)",
            paddingTop: "1.2rem",
          }}
        >
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: "none",
              border: "none",
              color: "var(--foreground)",
              opacity: 0.5,
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
          >
            {t.btnSignOut}
          </button>
        </div>
      </div>
    </div>
  );
}
