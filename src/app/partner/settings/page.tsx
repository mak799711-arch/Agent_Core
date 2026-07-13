"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, walletRepository } from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";
import VerificationBadge from "@/app/components/VerificationBadge";

const translations = {
  en: {
    title: "Profile Settings",
    back: "← Back to Dashboard",
    themeLabel: "Appearance Theme",
    langLabel: "Language",
    currLabel: "Currency",
    cardLabel: "Payment Methods",
    cardBound: "Active Payment Details",
    cardUnbound: "No card bound. Payouts are suspended.",
    btnUnbind: "Unbind Card",
    btnBind: "Bind New Card",
    btnSave: "Save Changes",
    success: "Settings updated successfully!",
    themes: {
      dark: "Dark",
      light: "Light"
    },
    verificationTitle: "Verification Status",
    verificationLock: "Verification is locked. Complete 100+ deals to apply.",
    verificationCurrent: "Completed Deals Progress",
    btnSimulate: "Simulate 105 Deals",
    btnApply: "Request Verification ✅",
    statusPending: "Verification request is pending review.",
    statusVerified: "Your profile is officially verified!"
  },
  ru: {
    title: "Настройки профиля",
    back: "← Назад в панель",
    themeLabel: "Тема оформления",
    langLabel: "Язык",
    currLabel: "Валюта",
    cardLabel: "Способы оплаты",
    cardBound: "Активные реквизиты",
    cardUnbound: "Карта не привязана. Выплаты приостановлены.",
    btnUnbind: "Отвязать карту",
    btnBind: "Привязать новую карту",
    btnSave: "Сохранить изменения",
    success: "Настройки успешно обновлены!",
    themes: {
      dark: "Темная",
      light: "Светлая"
    },
    verificationTitle: "Статус верификации",
    verificationLock: "Верификация заблокирована. Завершите 100+ сделок.",
    verificationCurrent: "Прогресс завершенных сделок",
    btnSimulate: "Симулировать 105 сделок",
    btnApply: "Запросить верификацию ✅",
    statusPending: "Запрос на верификацию на рассмотрении.",
    statusVerified: "Ваш профиль официально верифицирован!"
  },
  id: {
    title: "Pengaturan Profil",
    back: "← Kembali ke Dasbor",
    themeLabel: "Tema Tampilan",
    langLabel: "Bahasa",
    currLabel: "Mata Uang",
    cardLabel: "Metode Pembayaran",
    cardBound: "Detail Pembayaran Aktif",
    cardUnbound: "Tidak ada kartu terikat. Pembayaran ditangguhkan.",
    btnUnbind: "Lepas Kartu",
    btnBind: "Ikat Kartu Baru",
    btnSave: "Simpan Perubahan",
    success: "Pengaturan berhasil diperbarui!",
    themes: {
      dark: "Gelap",
      light: "Terang"
    },
    verificationTitle: "Status Verifikasi",
    verificationLock: "Verifikasi terkunci. Selesaikan 100+ kesepakatan.",
    verificationCurrent: "Kemajuan Kesepakatan Selesai",
    btnSimulate: "Simulasikan 105 Kesepakatan",
    btnApply: "Minta Verifikasi ✅",
    statusPending: "Permintaan verifikasi sedang ditinjau.",
    statusVerified: "Profil Anda resmi terverifikasi!"
  },
  zh: {
    title: "个人资料设置",
    back: "← 返回仪表板",
    themeLabel: "外观主题",
    langLabel: "语言",
    currLabel: "货币",
    cardLabel: "付款方式",
    cardBound: "有效付款信息",
    cardUnbound: "未绑定银行卡。付款已暂停。",
    btnUnbind: "解绑银行卡",
    btnBind: "绑定新卡",
    btnSave: "保存更改",
    success: "设置更新成功！",
    themes: {
      dark: "深色",
      light: "浅色"
    },
    verificationTitle: "验证状态",
    verificationLock: "验证已锁定。完成 100 笔以上交易以申请。",
    verificationCurrent: "已完成交易进度",
    btnSimulate: "模拟 105 笔交易",
    btnApply: "请求验证 ✅",
    statusPending: "验证请求正在审核中。",
    statusVerified: "您的个人资料已正式验证！"
  },
  es: {
    title: "Configuración del Perfil",
    back: "← Volver al Panel",
    themeLabel: "Tema de Apariencia",
    langLabel: "Idioma",
    currLabel: "Moneda",
    cardLabel: "Métodos de Pago",
    cardBound: "Detalles de Pago Activos",
    cardUnbound: "No hay tarjeta vinculada. Pagos suspendidos.",
    btnUnbind: "Desvincular Tarjeta",
    btnBind: "Vincular Nueva Tarjeta",
    btnSave: "Guardar Cambios",
    success: "¡Configuración actualizada con éxito!",
    themes: {
      dark: "Oscuro",
      light: "Claro"
    },
    verificationTitle: "Estado de Verificación",
    verificationLock: "Verificación bloqueada. Completa más de 100 acuerdos.",
    verificationCurrent: "Progreso de Acuerdos Completados",
    btnSimulate: "Simular 105 Acuerdos",
    btnApply: "Solicitar Verificación ✅",
    statusPending: "La solicitud de verificación está en revisión.",
    statusVerified: "¡Tu perfil está verificado oficialmente!"
  },
  de: {
    title: "Profileinstellungen",
    back: "← Zurück zum Dashboard",
    themeLabel: "Design",
    langLabel: "Sprache",
    currLabel: "Währung",
    cardLabel: "Zahlungsmethoden",
    cardBound: "Aktive Zahlungsdetails",
    cardUnbound: "Keine Karte gebunden. Auszahlungen sind ausgesetzt.",
    btnUnbind: "Karte entbinden",
    btnBind: "Neue Karte binden",
    btnSave: "Änderungen speichern",
    success: "Einstellungen erfolgreich aktualisiert!",
    themes: {
      dark: "Dunkel",
      light: "Hell"
    },
    verificationTitle: "Verifizierungsstatus",
    verificationLock: "Verifizierung gesperrt. Schließen Sie 100+ Deals ab.",
    verificationCurrent: "Fortschritt abgeschlossener Deals",
    btnSimulate: "105 Deals simulieren",
    btnApply: "Verifizierung anfordern ✅",
    statusPending: "Verifizierungsanfrage wird geprüft.",
    statusVerified: "Ihr Profil ist offiziell verifiziert!"
  },
  fr: {
    title: "Paramètres du Profil",
    back: "← Retour au Tableau de Bord",
    themeLabel: "Thème",
    langLabel: "Langue",
    currLabel: "Devise",
    cardLabel: "Méthodes de Paiement",
    cardBound: "Détails de Paiement Actifs",
    cardUnbound: "Aucune carte liée. Les paiements sont suspendus.",
    btnUnbind: "Délier la Carte",
    btnBind: "Lier une Nouvelle Carte",
    btnSave: "Enregistrer les Modifications",
    success: "Paramètres mis à jour avec succès !",
    themes: {
      dark: "Sombre",
      light: "Clair"
    },
    verificationTitle: "Statut de Vérification",
    verificationLock: "Vérification verrouillée. Complétez plus de 100 accords.",
    verificationCurrent: "Progression des Accords Terminés",
    btnSimulate: "Simuler 105 Accords",
    btnApply: "Demander la Vérification ✅",
    statusPending: "La demande de vérification est en cours d'examen.",
    statusVerified: "Votre profil est officiellement vérifié !"
  },
  ja: {
    title: "プロファイル設定",
    back: "← ダッシュボードに戻る",
    themeLabel: "外観テーマ",
    langLabel: "言語",
    currLabel: "通貨",
    cardLabel: "支払い方法",
    cardBound: "有効な支払い詳細",
    cardUnbound: "カードがバインドされていません。支払いは一時停止されています。",
    btnUnbind: "カードのバインド解除",
    btnBind: "新しいカードをバインド",
    btnSave: "変更を保存",
    success: "設定が正常に更新されました！",
    themes: {
      dark: "ダーク",
      light: "ライト"
    },
    verificationTitle: "確認ステータス",
    verificationLock: "確認がロックされています。申請するには100件以上の取引を完了してください。",
    verificationCurrent: "完了した取引の進行状況",
    btnSimulate: "105件の取引をシミュレート",
    btnApply: "確認をリクエスト ✅",
    statusPending: "確認リクエストは審査中です。",
    statusVerified: "あなたのプロファイルは正式に確認されました！"
  },
  ar: {
    title: "إعدادات الملف الشخصي",
    back: "← العودة إلى لوحة التحكم",
    themeLabel: "سمة المظهر",
    langLabel: "اللغة",
    currLabel: "العملة",
    cardLabel: "طرق الدفع",
    cardBound: "تفاصيل الدفع النشطة",
    cardUnbound: "لا توجد بطاقة مقيدة. العوائد معلقة.",
    btnUnbind: "إلغاء ربط البطاقة",
    btnBind: "ربط بطاقة جديدة",
    btnSave: "حفظ التغييرات",
    success: "تم تحديث الإعدادات بنجاح!",
    themes: {
      dark: "داكن",
      light: "فاتح"
    },
    verificationTitle: "حالة التحقق",
    verificationLock: "التحقق مقفل. أكمل 100+ صفقات للتقديم.",
    verificationCurrent: "تقدم الصفقات المكتملة",
    btnSimulate: "محاكاة 105 صفقات",
    btnApply: "طلب التحقق ✅",
    statusPending: "طلب التحقق قيد المراجعة.",
    statusVerified: "تم التحقق من ملفك الشخصي رسميًا!"
  },
  pt: {
    title: "Configurações do Perfil",
    back: "← Voltar ao Painel",
    themeLabel: "Tema de Aparência",
    langLabel: "Idioma",
    currLabel: "Moeda",
    cardLabel: "Métodos de Pagamento",
    cardBound: "Detalhes de Pagamento Ativos",
    cardUnbound: "Nenhuma cartão vinculado. Os pagamentos estão suspensos.",
    btnUnbind: "Desvincular Cartão",
    btnBind: "Vincular Novo Cartão",
    btnSave: "Salvar Alterações",
    success: "Configurações atualizadas com sucesso!",
    themes: {
      dark: "Escuro",
      light: "Claro"
    },
    verificationTitle: "Status de Verificação",
    verificationLock: "Verificação bloqueada. Complete 100+ acordos para solicitar.",
    verificationCurrent: "Progresso de Acordos Concluídos",
    btnSimulate: "Simular 105 Acordos",
    btnApply: "Solicitar Verificação ✅",
    statusPending: "A solicitação de verificação está sob análise.",
    statusVerified: "O seu perfil está oficialmente verificado!"
  },
  hi: {
    title: "प्रोफ़ाइल सेटिंग",
    back: "← डैशबोर्ड पर वापस",
    themeLabel: "प्रकटन थीम",
    langLabel: "भाषा",
    currLabel: "मुद्रा",
    cardLabel: "भुगतान की विधियां",
    cardBound: "सक्रिय भुगतान विवरण",
    cardUnbound: "कोई कार्ड बाध्य नहीं। भुगतान निलंबित हैं।",
    btnUnbind: "कार्ड अनबाइंड करें",
    btnBind: "नया कार्ड बाइंड करें",
    btnSave: "परिवर्तन सहेजें",
    success: "सेटिंग सफलतापूर्वक अपडेट की गई!",
    themes: {
      dark: "गहरा",
      light: "हल्का"
    },
    verificationTitle: "सत्यापन स्थिति",
    verificationLock: "सत्यापन लॉक है। आवेदन करने के लिए 100+ सौदे पूरे करें।",
    verificationCurrent: "पूरे किए गए सौदों की प्रगति",
    btnSimulate: "105 सौदों का अनुकरण करें",
    btnApply: "सत्यापन का अनुरोध करें ✅",
    statusPending: "सत्यापन अनुरोध समीक्षा के अधीन है।",
    statusVerified: "आपकी प्रोफ़ाइल आधिकारिक तौर पर सत्यापित है!"
  }
};;

export default function PartnerSettings() {
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

  // Profile specific
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Verification states
  const [dealsCount, setDealsCount] = useState(85);
  const [verificationStatus, setVerificationStatus] = useState<
    "none" | "pending" | "verified"
  >("none");

  const router = useRouter();
  const t = (translations as any)[lang] || translations.en;

  useEffect(() => {
    async function loadUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== "partner") {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLang(currentUser.language);
        setCurrency(currentUser.currency);
        setCardBound(currentUser.cardBound);
        setCardNumber(currentUser.cardNumber || "");
        setAvatarUrl(currentUser.avatarUrl || "");
        setBio(currentUser.bio || "");

        // Get theme
        let activeTheme =
          (localStorage.getItem("theme") as "dark" | "light" | null) ||
          (currentUser.theme as "dark" | "light");
        if (activeTheme !== "dark" && activeTheme !== "light") {
          activeTheme = "dark"; // Fallback for old 'neon' users
          localStorage.setItem("theme", "dark");
          document.documentElement.setAttribute("data-theme", "dark");
        }
        setTheme(activeTheme);

        // Load verification status from real DB
        const isVerified = currentUser.status === "verified";
        const hasPendingRequest = currentUser.status === "pending_verification";

        try {
          const txs = await walletRepository.getTransactions(currentUser.id);
          const completedRewards = txs.filter(
            (t) => t.type === "reward" && t.status === "completed",
          ).length;
          setDealsCount(completedRewards);
        } catch (e) {
          console.error("Failed to load deals", e);
          setDealsCount(0);
        }

        if (isVerified) {
          setVerificationStatus("verified");
        } else if (hasPendingRequest) {
          setVerificationStatus("pending");
        } else {
          setVerificationStatus("none");
        }
      }
      setLoading(false);
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];

    setUploadingAvatar(true);
    try {
      const newAvatarUrl = await authService.uploadAvatar(user.id, file);
      setAvatarUrl(newAvatarUrl);
      // Automatically save the avatar change to the profile
      await authService.updateProfile({ avatarUrl: newAvatarUrl });
    } catch (err) {
      alert("Error uploading avatar");
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUnbindCard = async () => {
    setCardBound(false);
    setCardNumber("");
  };

  const handleBindCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCard = newCardNumber.replace(/\D/g, "");
    if (cleanCard.length < 16) {
      alert(
        t.langLabel === "Language"
          ? "Invalid card number"
          : "Некорректный номер карты",
      );
      return;
    }
    const formattedCard = newCardNumber.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardNumber(formattedCard);
    setCardBound(true);
    setNewCardNumber("");
    setIsBinding(false);
  };

  const handleApplyVerification = async () => {
    if (!user) return;
    try {
      await authService.updateProfile({ status: "pending_verification" });
      setVerificationStatus("pending");
      alert(
        lang === "ru"
          ? "Заявка на верификацию отправлена!"
          : "Verification request submitted!",
      );
    } catch (err) {
      alert("Error submitting verification request");
    }
  };

  const handleSave = async () => {
    try {
      await authService.updateProfile({
        language: lang,
        currency,
        theme,
        cardBound,
        bio,
        cardNumber: cardBound ? cardNumber : null,
      });
      alert(t.success);
      router.push("/partner");
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error logging out", err);
    }
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
            Loading Settings...
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

  if (user?.status === "banned" || user?.isBlocked) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-gradient)",
        }}
      >
        <h1
          style={{
            color: "var(--foreground)",
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          Ваш аккаунт заблокирован
        </h1>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-gradient)",
        color: "var(--foreground)",
        padding: "3rem 2rem",
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
          background: "var(--ambient-glow)",
          filter: "blur(100px)",
          borderRadius: "50%",
          top: "10%",
          left: "15%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Back Link */}
        <a
          href="/partner"
          style={{
            color: "var(--primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "2rem",
            fontSize: "0.9rem",
            fontWeight: 700,
          }}
        >
          {t.back}
        </a>

        <h2
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            letterSpacing: "-0.8px",
          }}
        >
          {t.title}
          {verificationStatus === "verified" && <VerificationBadge size={22} />}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Profile Info (Avatar & Bio) */}
          <div
            className="glass-panel"
            style={{
              padding: "1.8rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              border: "1px solid var(--surface-border)",
              background: "var(--glass-bg)",
              borderRadius: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1.5rem",
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
                  }
                  alt="Avatar"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--primary)",
                  }}
                />
                <label
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: -4,
                    background: "var(--primary)",
                    color: "#000",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    opacity: uploadingAvatar ? 0.5 : 1,
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  <span style={{ fontSize: "14px" }}>
                    {uploadingAvatar ? "⏳" : "📷"}
                  </span>
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    opacity: 0.7,
                    letterSpacing: "0.5px",
                    marginBottom: "0.6rem",
                    display: "block",
                  }}
                >
                  О себе (Bio)
                </label>
                <textarea
                  className="input-field"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={
                    lang === "ru"
                      ? "Расскажите о себе, где вы работаете, ваши интересы..."
                      : "Tell us about yourself, your work, your interests..."
                  }
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Theme, Language & Currency */}
          <div
            className="glass-panel"
            style={{
              padding: "1.8rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1.5rem",
              border: "1px solid var(--surface-border)",
              background: "var(--glass-bg)",
              borderRadius: "20px",
            }}
          >
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
                  textTransform: "uppercase",
                  opacity: 0.7,
                  letterSpacing: "0.5px",
                }}
              >
                {t.themeLabel || "Theme"}
              </label>
              <select
                className="input-field"
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as any)}
                style={{ width: "100%" }}
              >
                <option value="dark">{t.themes?.dark || "Dark Mode"}</option>
                <option value="light">{t.themes?.light || "Light Mode"}</option>
              </select>
            </div>

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
                  textTransform: "uppercase",
                  opacity: 0.7,
                  letterSpacing: "0.5px",
                }}
              >
                {t.langLabel}
              </label>
              <select
                className="input-field"
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                style={{ width: "100%" }}
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
                  textTransform: "uppercase",
                  opacity: 0.7,
                  letterSpacing: "0.5px",
                }}
              >
                {t.currLabel}
              </label>
              <select
                className="input-field"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                style={{ width: "100%" }}
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
          </div>

          {/* Verification Progress Box */}
          <div
            className="glass-panel"
            style={{
              padding: "1.8rem",
              border: "1px solid var(--surface-border)",
              background: "var(--glass-bg)",
              borderRadius: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "1.2rem",
                fontWeight: 700,
                textTransform: "uppercase",
                opacity: 0.7,
                letterSpacing: "0.5px",
              }}
            >
              {t.verificationTitle}
            </h3>

            {verificationStatus === "verified" && (
              <div
                style={{
                  color: "var(--success)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "1rem",
                }}
              >
                <VerificationBadge size={20} /> {t.statusVerified}
              </div>
            )}

            {verificationStatus === "pending" && (
              <div
                style={{
                  color: "var(--warning)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "1rem",
                }}
              >
                ⏳ {t.statusPending}
              </div>
            )}

            {verificationStatus === "none" && (
              <div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.7,
                    marginBottom: "1.2rem",
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {dealsCount < 100
                    ? t.verificationLock
                    : "Congratulations! You qualify for verification."}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      marginBottom: "6px",
                      fontWeight: 700,
                    }}
                  >
                    <span>{t.verificationCurrent}</span>
                    <span style={{ color: "var(--primary)" }}>
                      {dealsCount}/100
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min((dealsCount / 100) * 100, 100)}%`,
                        height: "100%",
                        background:
                          dealsCount >= 100
                            ? "var(--success)"
                            : "var(--primary)",
                        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {dealsCount < 100 ? (
                    <button
                      disabled
                      className="btn-primary"
                      style={{
                        padding: "10px 18px",
                        fontSize: "0.85rem",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--surface-border)",
                        color: "#666",
                        cursor: "not-allowed",
                        boxShadow: "none",
                      }}
                    >
                      🔒 {t.btnApply} (Locked)
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyVerification}
                      className="btn-primary"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--success) 0%, #10b981 100%)",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.2)",
                      }}
                    >
                      {t.btnApply}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card Management */}
          <div
            className="glass-panel"
            style={{
              padding: "1.8rem",
              border: "1px solid var(--surface-border)",
              background: "var(--glass-bg)",
              borderRadius: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                marginBottom: "1.2rem",
                fontWeight: 700,
                textTransform: "uppercase",
                opacity: 0.7,
                letterSpacing: "0.5px",
              }}
            >
              {t.cardLabel}
            </h3>

            {cardBound ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.01)",
                  padding: "1.2rem 1.5rem",
                  borderRadius: "16px",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.5,
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: 700,
                    }}
                  >
                    {t.cardBound.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      fontFamily: "monospace",
                    }}
                  >
                    {cardNumber}
                  </span>
                </div>
                <button
                  onClick={handleUnbindCard}
                  style={{
                    background: "none",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    color: "var(--error)",
                    padding: "8px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(244, 63, 94, 0.08)";
                    e.currentTarget.style.borderColor = "var(--error)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.borderColor =
                      "rgba(244, 63, 94, 0.3)";
                  }}
                >
                  {t.btnUnbind}
                </button>
              </div>
            ) : (
              <div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.5,
                    marginBottom: "1.2rem",
                    fontWeight: 500,
                  }}
                >
                  {t.cardUnbound}
                </p>

                {isBinding ? (
                  <form
                    onSubmit={handleBindCard}
                    style={{ display: "flex", gap: "0.5rem" }}
                  >
                    <input
                      className="input-field"
                      type="text"
                      value={newCardNumber}
                      onChange={(e) => {
                        setNewCardNumber(e.target.value);
                      }}
                      placeholder="Card / GoPay / Crypto Wallet"
                      required
                      style={{ flex: 1 }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: "10px 20px", fontSize: "0.85rem" }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBinding(false)}
                      className="btn-primary"
                      style={{
                        padding: "10px 20px",
                        fontSize: "0.85rem",
                        background: "rgba(255,255,255,0.01)",
                        border: "1px solid var(--surface-border)",
                        boxShadow: "none",
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsBinding(true)}
                    className="btn-primary"
                    style={{ width: "100%", padding: "12px" }}
                  >
                    {t.btnBind}
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", borderRadius: "12px" }}
          >
            {t.btnSave}
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: "rgba(244, 63, 94, 0.05)",
              border: "1px solid rgba(244, 63, 94, 0.2)",
              color: "var(--error)",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(244, 63, 94, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(244, 63, 94, 0.05)")
            }
          >
            {lang === "ru" ? "Выйти из аккаунта" : "Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
