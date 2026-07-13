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
    contactTitle: "Contact Information"
  },
  ru: {
    title: "Добро пожаловать в Agent Core",
    subtitle: "Давайте настроим платежный профиль",
    langLabel: "Предпочитаемый язык",
    currLabel: "Предпочитаемая валюта",
    cardLabel: "Кредитная / Дебетовая карта",
    cardHolder: "Номер карты",
    cardExpiry: "ММ/ГГ",
    cardCvc: "CVC",
    btnNext: "Следующий шаг",
    btnSubmit: "Завершить регистрацию",
    errorCard: "Пожалуйста, введите действительный номер карты",
    success: "Профиль успешно настроен!",
    step1: "Шаг 1: Настройки",
    step2: "Шаг 2: Карта оплаты",
    step3: "Шаг 3: Контакты",
    secured: "Безопасное 256-битное шифрование SSL",
    emailLabel: "Электронная почта",
    phoneLabel: "Номер телефона",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+7 (999) 000-00-00",
    contactTitle: "Контактная информация"
  },
  id: {
    title: "Selamat datang di Agent Core",
    subtitle: "Mari atur profil penagihan Anda",
    langLabel: "Bahasa Pilihan",
    currLabel: "Mata Uang Pilihan",
    cardLabel: "Kartu Kredit / Debit",
    cardHolder: "Nomor Kartu",
    cardExpiry: "BB/TT",
    cardCvc: "CVC",
    btnNext: "Langkah Selanjutnya",
    btnSubmit: "Selesaikan Pendaftaran",
    errorCard: "Masukkan nomor kartu yang valid",
    success: "Profil berhasil dikonfigurasi!",
    step1: "Langkah 1: Pengaturan",
    step2: "Langkah 2: Kartu Pembayaran",
    step3: "Langkah 3: Kontak",
    secured: "Enkripsi SSL 256-bit yang aman",
    emailLabel: "Alamat Email",
    phoneLabel: "Nomor Telepon",
    emailPlaceholder: "anda@contoh.com",
    phonePlaceholder: "+62 812-3456-7890",
    contactTitle: "Informasi Kontak"
  },
  zh: {
    title: "欢迎来到 Agent Core",
    subtitle: "让我们设置您的账单档案",
    langLabel: "首选语言",
    currLabel: "首选货币",
    cardLabel: "信用卡/借记卡",
    cardHolder: "卡号",
    cardExpiry: "月/年",
    cardCvc: "安全码(CVC)",
    btnNext: "下一步",
    btnSubmit: "完成注册",
    errorCard: "请输入有效的卡号",
    success: "档案配置成功！",
    step1: "步骤 1：设置",
    step2: "步骤 2：付款卡",
    step3: "步骤 3：联系方式",
    secured: "安全的 256 位 SSL 加密",
    emailLabel: "电子邮件地址",
    phoneLabel: "电话号码",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+86 138 0000 0000",
    contactTitle: "联系信息"
  },
  es: {
    title: "Bienvenido a Agent Core",
    subtitle: "Configuremos su perfil de facturación",
    langLabel: "Idioma Preferido",
    currLabel: "Moneda Preferida",
    cardLabel: "Tarjeta de Crédito / Débito",
    cardHolder: "Número de Tarjeta",
    cardExpiry: "MM/AA",
    cardCvc: "CVC",
    btnNext: "Siguiente Paso",
    btnSubmit: "Completar Registro",
    errorCard: "Por favor ingrese un número de tarjeta válido",
    success: "¡Perfil configurado con éxito!",
    step1: "Paso 1: Ajustes",
    step2: "Paso 2: Tarjeta de Pago",
    step3: "Paso 3: Contactos",
    secured: "Cifrado SSL seguro de 256 bits",
    emailLabel: "Correo Electrónico",
    phoneLabel: "Número de Teléfono",
    emailPlaceholder: "usted@ejemplo.com",
    phonePlaceholder: "+34 600 000 000",
    contactTitle: "Información de Contacto"
  },
  de: {
    title: "Willkommen bei Agent Core",
    subtitle: "Richten wir Ihr Rechnungsprofil ein",
    langLabel: "Bevorzugte Sprache",
    currLabel: "Bevorzugte Währung",
    cardLabel: "Kredit- / Debitkarte",
    cardHolder: "Kartennummer",
    cardExpiry: "MM/JJ",
    cardCvc: "CVC",
    btnNext: "Nächster Schritt",
    btnSubmit: "Registrierung abschließen",
    errorCard: "Bitte geben Sie eine gültige Kartennummer ein",
    success: "Profil erfolgreich konfiguriert!",
    step1: "Schritt 1: Einstellungen",
    step2: "Schritt 2: Zahlungskarte",
    step3: "Schritt 3: Kontakte",
    secured: "Sichere 256-Bit-SSL-Verschlüsselung",
    emailLabel: "E-Mail-Adresse",
    phoneLabel: "Telefonnummer",
    emailPlaceholder: "sie@beispiel.de",
    phonePlaceholder: "+49 170 1234567",
    contactTitle: "Kontaktinformationen"
  },
  fr: {
    title: "Bienvenue sur Agent Core",
    subtitle: "Configurons votre profil de facturation",
    langLabel: "Langue Préférée",
    currLabel: "Devise Préférée",
    cardLabel: "Carte de Crédit / Débit",
    cardHolder: "Numéro de Carte",
    cardExpiry: "MM/AA",
    cardCvc: "CVC",
    btnNext: "Étape Suivante",
    btnSubmit: "Terminer l'Inscription",
    errorCard: "Veuillez entrer un numéro de carte valide",
    success: "Profil configuré avec succès !",
    step1: "Étape 1 : Paramètres",
    step2: "Étape 2 : Carte de Paiement",
    step3: "Étape 3 : Contacts",
    secured: "Cryptage SSL 256 bits sécurisé",
    emailLabel: "Adresse E-mail",
    phoneLabel: "Numéro de Téléphone",
    emailPlaceholder: "vous@exemple.fr",
    phonePlaceholder: "+33 6 12 34 56 78",
    contactTitle: "Informations de Contact"
  },
  ja: {
    title: "Agent Core へようこそ",
    subtitle: "請求プロファイルを設定しましょう",
    langLabel: "希望の言語",
    currLabel: "希望の通貨",
    cardLabel: "クレジット / デビットカード",
    cardHolder: "カード番号",
    cardExpiry: "月/年",
    cardCvc: "CVC",
    btnNext: "次のステップ",
    btnSubmit: "登録を完了する",
    errorCard: "有効なカード番号を入力してください",
    success: "プロファイルが正常に構成されました！",
    step1: "ステップ 1: 設定",
    step2: "ステップ 2: 支払いカード",
    step3: "ステップ 3: 連絡先",
    secured: "安全な256ビットSSL暗号化",
    emailLabel: "メールアドレス",
    phoneLabel: "電話番号",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+81 90-1234-5678",
    contactTitle: "連絡先情報"
  },
  ar: {
    title: "مرحبا بك في Agent Core",
    subtitle: "دعنا نعد ملف تعريف الفواتير الخاص بك",
    langLabel: "اللغة المفضلة",
    currLabel: "العملة المفضلة",
    cardLabel: "بطاقة الائتمان / الخصم",
    cardHolder: "رقم البطاقة",
    cardExpiry: "شهر/سنة",
    cardCvc: "رمز الأمان",
    btnNext: "الخطوة التالية",
    btnSubmit: "إكمال التسجيل",
    errorCard: "الرجاء إدخال رقم بطاقة صالح",
    success: "تم تكوين الملف الشخصي بنجاح!",
    step1: "الخطوة 1: الإعدادات",
    step2: "الخطوة 2: بطاقة الدفع",
    step3: "الخطوة 3: جهات الاتصال",
    secured: "تشفير SSL آمن 256 بت",
    emailLabel: "عنوان البريد الإلكتروني",
    phoneLabel: "رقم الهاتف",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+971 50 123 4567",
    contactTitle: "معلومات الاتصال"
  },
  pt: {
    title: "Bem-vindo ao Agent Core",
    subtitle: "Vamos configurar o seu perfil de faturação",
    langLabel: "Idioma Preferido",
    currLabel: "Moeda Preferida",
    cardLabel: "Cartão de Crédito / Débito",
    cardHolder: "Número do Cartão",
    cardExpiry: "MM/AA",
    cardCvc: "CVC",
    btnNext: "Próximo Passo",
    btnSubmit: "Concluir Registo",
    errorCard: "Por favor, insira um número de cartão válido",
    success: "Perfil configurado com sucesso!",
    step1: "Passo 1: Configurações",
    step2: "Passo 2: Cartão de Pagamento",
    step3: "Passo 3: Contactos",
    secured: "Criptografia SSL de 256 bits segura",
    emailLabel: "Endereço de E-mail",
    phoneLabel: "Número de Telefone",
    emailPlaceholder: "voce@exemplo.pt",
    phonePlaceholder: "+351 912 345 678",
    contactTitle: "Informações de Contacto"
  },
  hi: {
    title: "एजेंट कोर में आपका स्वागत है",
    subtitle: "आइए अपनी बिलिंग प्रोफ़ाइल सेट करें",
    langLabel: "पसंदीदा भाषा",
    currLabel: "पसंदीदा मुद्रा",
    cardLabel: "क्रेडिट / डेबिट कार्ड",
    cardHolder: "कार्ड नंबर",
    cardExpiry: "एमएम/वाईवाई",
    cardCvc: "सीवीसी",
    btnNext: "अगला कदम",
    btnSubmit: "पंजीकरण पूर्ण करें",
    errorCard: "कृपया एक मान्य कार्ड नंबर दर्ज करें",
    success: "प्रोफ़ाइल सफलतापूर्वक कॉन्फ़िगर की गई!",
    step1: "चरण 1: सेटिंग्स",
    step2: "चरण 2: भुगतान कार्ड",
    step3: "चरण 3: संपर्क",
    secured: "सुरक्षित 256-बिट एसएसएल एन्क्रिप्शन",
    emailLabel: "ईमेल पता",
    phoneLabel: "फ़ोन नंबर",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "+91 98765 43210",
    contactTitle: "संपर्क जानकारी"
  }
};;

export default function OnboardingPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<
    "ru" | "en" | "id" | "zh" | "es" | "de" | "fr"
  >("en");
  const [currency, setCurrency] = useState<
    "USD" | "IDR" | "EUR" | "RUB" | "CNY" | "AUD" | "SGD" | "GBP" | "JPY"
  >("USD");
  const [paymentMethod, setPaymentMethod] = useState<
    "CARD" | "EWALLET" | "CRYPTO" | "BANK"
  >("CARD");
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
        // Redirect if already configured
        if (currentUser.cardBound && currentUser.phone) {
          router.push(`/${currentUser.role}`);
        }
      }
      setLoading(false);
    }
    checkUser();
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (paymentMethod !== "CARD") {
      setCardNumber(e.target.value); // Allow free text for phone/crypto/bank
      return;
    }
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
    const needs16Digits = paymentMethod === "CARD";
    if (needs16Digits && cardNumber.replace(/\s/g, "").length < 16) {
      alert(t.errorCard);
      return;
    }
    if (!cardNumber) {
      alert("Please enter payment details");
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

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              border: "3px solid var(--surface-border)",
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
    <div className="page-container">
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "var(--panel-padding)",
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
            1
            <span style={{ display: "inline" }}>
              : {t.step1.split(":")[1]?.trim() || t.step1}
            </span>
          </span>
          <span
            style={{
              color: step === 2 ? "var(--primary)" : "var(--foreground)",
              transition: "color 0.2s",
            }}
          >
            2
            <span style={{ display: "inline" }}>
              : {t.step2.split(":")[1]?.trim() || t.step2}
            </span>
          </span>
          <span
            style={{
              color: step === 3 ? "var(--primary)" : "var(--foreground)",
              transition: "color 0.2s",
            }}
          >
            3
            <span style={{ display: "inline" }}>
              : {t.step3.split(":")[1]?.trim() || t.step3}
            </span>
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
              background: "var(--primary)",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          ></div>
        </div>

        <h2
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "0.4rem",
            textAlign: "center",
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
          }}
        >
          {t.title}
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#888888",
            marginBottom: "2.5rem",
            textAlign: "center",
          }}
        >
          {t.subtitle}
        </p>

        {step === 1 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Language Selector */}
            <div className="form-group">
              <label className="form-label">{t.langLabel}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="input-field"
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
            <div className="form-group">
              <label className="form-label">{t.currLabel}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="input-field"
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

            <button
              onClick={handleNextStep}
              className="btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
            >
              {t.btnNext}
            </button>
          </div>
        )}

        {step === 2 && (
          <form
            onSubmit={handleCardSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value as any);
                  setCardNumber("");
                  setExpiry("");
                  setCvc("");
                }}
                className="input-field"
                style={{ marginBottom: "0.5rem" }}
              >
                <option value="CARD">Credit / Debit Card</option>
                <option value="EWALLET">E-Wallet (GoPay / OVO / DANA)</option>
                <option value="CRYPTO">Crypto Wallet (USDT TRC20)</option>
                <option value="BANK">Local Bank Transfer</option>
              </select>

              {/* Virtual Mock Card Visual */}
              <div
                style={{
                  background: "var(--surface-border)",
                  padding: "clamp(1rem, 4vw, 1.8rem)",
                  borderRadius: "12px",
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "clamp(145px, 22vw, 180px)",
                  position: "relative",
                  overflow: "hidden",
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
                      color: "var(--foreground)",
                    }}
                  >
                    {paymentMethod === "CARD"
                      ? "AGENT CARD"
                      : "PAYMENT PROFILE"}
                  </span>
                  <div
                    style={{
                      width: "36px",
                      height: "24px",
                      background: "var(--background)",
                      borderRadius: "6px",
                    }}
                  ></div>
                </div>
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    margin: "1rem 0",
                    fontFamily: "monospace",
                    textAlign: "center",
                    color: "var(--primary)",
                    wordBreak: "break-all",
                  }}
                >
                  {cardNumber ||
                    (paymentMethod === "CARD"
                      ? "•••• •••• •••• ••••"
                      : "NO DETAILS")}
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    color: "#888888",
                  }}
                >
                  <span style={{ textTransform: "uppercase" }}>
                    {user?.fullName || "CARD HOLDER"}
                  </span>
                  <span>
                    {paymentMethod === "CARD" ? expiry || "MM/YY" : "ACTIVE"}
                  </span>
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
                  className="input-field"
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder={
                    paymentMethod === "EWALLET"
                      ? "Phone Number (e.g. +62 812...)"
                      : paymentMethod === "CRYPTO"
                        ? "Wallet Address (USDT TRC20)"
                        : paymentMethod === "BANK"
                          ? "Account Number / IBAN"
                          : "0000 0000 0000 0000"
                  }
                  required
                  style={{ textAlign: "center", letterSpacing: "1px" }}
                />

                {paymentMethod === "CARD" && (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <input
                      className="input-field"
                      type="text"
                      value={expiry}
                      onChange={handleExpiryChange}
                      placeholder={t.cardExpiry}
                      required
                      style={{ flex: 1, textAlign: "center" }}
                    />
                    <input
                      className="input-field"
                      type="password"
                      value={cvc}
                      onChange={handleCvcChange}
                      placeholder={t.cardCvc}
                      required
                      style={{ flex: 1, textAlign: "center" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid var(--surface-border)",
                  color: "var(--foreground)",
                }}
              >
                Back
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                {t.btnNext}
              </button>
            </div>

            <span
              style={{
                fontSize: "0.75rem",
                color: "#777777",
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
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: "var(--foreground)",
              }}
            >
              {t.contactTitle}
            </h3>

            <div className="form-group">
              <label className="form-label">{t.emailLabel}</label>
              <input
                className="input-field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.phoneLabel}</label>
              <input
                className="input-field"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid var(--surface-border)",
                  color: "var(--foreground)",
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="btn-primary"
                style={{ flex: 2 }}
              >
                {submitLoading ? "Saving..." : t.btnSubmit}
              </button>
            </div>

            <span
              style={{
                fontSize: "0.75rem",
                color: "#777777",
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
      </div>
    </div>
  );
}
