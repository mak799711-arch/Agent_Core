"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  authService,
  offerRepository,
  referralRepository,
  walletRepository,
  businessRepository,
} from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";
import { Offer } from "@/lib/interfaces/offers";
import { formatCurrency } from "@/lib/utils/currency";
import VerificationBadge from "@/app/components/VerificationBadge";
import { Transaction } from "@/lib/interfaces/wallet";
import { formatUserName } from "@/lib/utils/format";
import SettingsSidebar from "@/app/components/SettingsSidebar";

const translations = {
  en: {
    venue: "Venue Manager",
    exit: "Exit",
    settings: "Settings ⚙️",
    balanceLabel: "Active Reserve Balance",
    depositBtn: "Deposit $100",
    reserveNote:
      "🔒 Reserve Protection Active: Offers will automatically de-activate if reward amount exceeds your current reserve balance.",
    attributeTitle: "Attribute Referral Code",
    verifyBtn: "Verify & Pay",
    offersTitle: "Your Active Offers",
    rewardLabel: "Reward",
    statusActive: "ACTIVE",
    statusPaused: "PAUSED (Low Balance)",
    noOffers: "No offers created yet",
    noTransactions: "No transactions recorded yet",
    createTitle: "Create New Offer",
    offerTitleLabel: "Offer Title",
    offerTitlePlaceholder: "e.g. Special Promotion",
    categoryLabel: "Category",
    rewardTypeLabel: "Reward Type",
    fixedReward: "Fixed Amount",
    percentageReward: "Percentage of Bill",
    rewardAmountLabel: "Promoter Reward Amount (in USD)",
    avgBillLabel: "Average Bill (in USD)",
    percentLabel: "Reward Percentage (%)",
    conditionsLabel: "Conditions / Description",
    conditionsPlaceholder:
      "Describe conversion terms (e.g. purchase of main dish is required)",
    createBtn: "Create Offer",
    cancelBtn: "Cancel",
    codeError: "Active referral code not found or expired",
    offerError: "Offer not found",
    balanceError: "Insufficient reserve balance to pay the reward",
    balanceErrorCreate:
      "Insufficient reserve balance to cover the reward. Please deposit funds first.",
    successPrefix: "Referral confirmed!",
    depositSuccess: "successfully added to your reserve balance.",
    loading: "Loading Business Portal...",
    recentTransactions: "Recent Transactions",
    categories: {
      restaurant: "Restaurant",
      nightlife: "Nightlife",
      real_estate: "Real Estate & Villas",
      beauty: "Beauty & Spa",
      fitness: "Fitness & Sports",
      retail: "Retail",
      activity: "Activities",
      services: "Services",
    },
  },
  ru: {
    venue: "Менеджер заведения",
    exit: "Выйти",
    settings: "Настройки ⚙️",
    balanceLabel: "Активный баланс резерва",
    depositBtn: "Пополнить на $100",
    reserveNote:
      "🔒 Защита резервов активна: офферы автоматически отключаются, если сумма награды превышает текущий баланс резерва.",
    attributeTitle: "Подтвердить реферальный код",
    verifyBtn: "Проверить и выплатить",
    offersTitle: "Ваши активные предложения",
    rewardLabel: "Награда",
    statusActive: "АКТИВЕН",
    statusPaused: "ПАУЗА (Низкий баланс)",
    noOffers: "Офферы еще не созданы",
    noTransactions: "Транзакции пока отсутствуют",
    createTitle: "Создать новое предложение",
    offerTitleLabel: "Название предложения",
    offerTitlePlaceholder: "например, Специальное предложение",
    categoryLabel: "Категория",
    rewardTypeLabel: "Тип вознаграждения",
    fixedReward: "Фиксированная сумма",
    percentageReward: "Процент от чека",
    rewardAmountLabel: "Сумма награды промоутеру (в USD)",
    avgBillLabel: "Средний чек (в USD)",
    percentLabel: "Процент вознаграждения (%)",
    conditionsLabel: "Условия / Описание",
    conditionsPlaceholder:
      "Опишите условия конверсии (например, обязательна покупка горячего блюда)",
    createBtn: "Создать предложение",
    cancelBtn: "Отмена",
    codeError: "Активный реферальный код не найден или истек",
    offerError: "Предложение не найдено",
    balanceError: "Недостаточно средств в резерве для выплаты награды",
    balanceErrorCreate:
      "Недостаточно средств на балансе резерва для создания предложения. Пожалуйста, пополните баланс.",
    successPrefix: "Реферал подтвержден!",
    depositSuccess: "успешно добавлено к вашему балансу резерва.",
    loading: "Загрузка портала бизнеса...",
    recentTransactions: "Последние транзакции",
    categories: {
      restaurant: "Ресторан",
      nightlife: "Ночная жизнь",
      real_estate: "Недвижимость и Виллы",
      beauty: "Красота и Спа",
      fitness: "Фитнес и Спорт",
      retail: "Ритейл",
      activity: "Развлечения",
      services: "Услуги",
    },
  },
  id: {
    venue: "Manajer Tempat",
    exit: "Keluar",
    settings: "Pengaturan ⚙️",
    balanceLabel: "Saldo Cadangan Aktif",
    depositBtn: "Setor $100",
    reserveNote:
      "🔒 Perlindungan Cadangan Aktif: Penawaran akan dinonaktifkan secara otomatis jika jumlah hadiah melebihi saldo cadangan Anda saat ini.",
    attributeTitle: "Atribusikan Kode Rujukan",
    verifyBtn: "Verifikasi & Bayar",
    offersTitle: "Penawaran Aktif Anda",
    rewardLabel: "Hadiah",
    statusActive: "AKTIF",
    statusPaused: "DITANGGUHKAN (Saldo Rendah)",
    noOffers: "Belum ada penawaran yang dibuat",
    noTransactions: "Belum ada transaksi yang tercatat",
    createTitle: "Buat Penawaran Baru",
    offerTitleLabel: "Judul Penawaran",
    offerTitlePlaceholder: "mis. Promosi Spesial",
    categoryLabel: "Kategori",
    rewardTypeLabel: "Jenis Hadiah",
    fixedReward: "Jumlah Tetap",
    percentageReward: "Persentase Tagihan",
    rewardAmountLabel: "Jumlah Hadiah Promotor (dalam USD)",
    avgBillLabel: "Rata-rata Tagihan (dalam USD)",
    percentLabel: "Persentase Hadiah (%)",
    conditionsLabel: "Kondisi / Deskripsi",
    conditionsPlaceholder:
      "Jelaskan persyaratan konversi (misalnya, pembelian hidangan utama diperlukan)",
    createBtn: "Buat Penawaran",
    cancelBtn: "Batal",
    codeError: "Kode rujukan aktif tidak ditemukan atau kedaluwarsa",
    offerError: "Penawaran tidak ditemukan",
    balanceError: "Saldo cadangan tidak mencukupi untuk membayar hadiah",
    balanceErrorCreate:
      "Saldo cadangan tidak mencukupi untuk membuat penawaran ini. Silakan setor dana terlebih dahulu.",
    successPrefix: "Rujukan dikonfirmasi!",
    depositSuccess: "berhasil ditambahkan ke saldo cadangan Anda.",
    loading: "Memuat Panel Bisnis...",
    recentTransactions: "Transaksi Terakhir",
    categories: {
      restaurant: "Restoran",
      nightlife: "Hiburan Malam",
      real_estate: "Real Estat & Vila",
      beauty: "Kecantikan & Spa",
      fitness: "Kebugaran & Olahraga",
      retail: "Eceran",
      activity: "Aktivitas",
      services: "Layanan",
    },
  },
  zh: {
    venue: "商户经理",
    exit: "退出",
    settings: "设置 ⚙️",
    balanceLabel: "活跃准备金余额",
    depositBtn: "充值 $100",
    reserveNote:
      "🔒 准备金保护已激活：如果奖励金额超过当前准备金余额，优惠将自动停用。",
    attributeTitle: "验证推荐码",
    verifyBtn: "核销并支付",
    offersTitle: "您的活跃优惠",
    rewardLabel: "奖励",
    statusActive: "活跃",
    statusPaused: "已暂停 (余额不足)",
    noOffers: "暂无优惠活动",
    noTransactions: "暂无交易记录",
    createTitle: "创建新优惠",
    offerTitleLabel: "优惠标题",
    offerTitlePlaceholder: "例如：特别促销",
    categoryLabel: "类别",
    rewardTypeLabel: "奖励类型",
    fixedReward: "固定金额",
    percentageReward: "账单百分比",
    rewardAmountLabel: "推广员奖励金额 (USD)",
    avgBillLabel: "平均账单金额 (USD)",
    percentLabel: "奖励百分比 (%)",
    conditionsLabel: "条款与描述",
    conditionsPlaceholder: "描述核销条件 (例如：必须点主菜)",
    createBtn: "创建优惠",
    cancelBtn: "取消",
    codeError: "未找到活跃推荐码或已过期",
    offerError: "优惠未找到",
    balanceError: "准备金余额不足，无法支付奖励",
    balanceErrorCreate: "准备金余额不足，无法创建优惠。请先充值。",
    successPrefix: "推荐核销成功！",
    depositSuccess: "已成功存入您的准备金余额。",
    loading: "正在加载商户门户...",
    recentTransactions: "最近的交易",
    categories: {
      restaurant: "餐厅",
      nightlife: "夜生活",
      real_estate: "房地产与别墅",
      beauty: "美容与水疗",
      fitness: "健身与体育",
      retail: "零售",
      activity: "活动",
      services: "服务",
    },
  },
  es: {
    venue: "Gerente del Lugar",
    exit: "Salir",
    settings: "Ajustes ⚙️",
    balanceLabel: "Saldo de Reserva Activo",
    depositBtn: "Depositar $100",
    reserveNote:
      "🔒 Protección de Reserva Activa: Las ofertas se desactivarán automáticamente si la recompensa excede el saldo de reserva.",
    attributeTitle: "Atribuir Código de Referido",
    verifyBtn: "Verificar y Pagar",
    offersTitle: "Sus Ofertas Activas",
    rewardLabel: "Recompensa",
    statusActive: "ACTIVO",
    statusPaused: "PAUSADO (Saldo Bajo)",
    noOffers: "Aún no hay ofertas creadas",
    noTransactions: "Aún no hay transacciones registradas",
    createTitle: "Crear Nueva Oferta",
    offerTitleLabel: "Título de la Oferta",
    offerTitlePlaceholder: "ej. Promoción Especial",
    categoryLabel: "Categoría",
    rewardTypeLabel: "Tipo de Recompensa",
    fixedReward: "Monto Fijo",
    percentageReward: "Porcentaje de la Cuenta",
    rewardAmountLabel: "Monto de Recompensa al Promotor (en USD)",
    avgBillLabel: "Cuenta Promedio (en USD)",
    percentLabel: "Porcentaje de Recompensa (%)",
    conditionsLabel: "Condiciones / Descripción",
    conditionsPlaceholder:
      "Describa los términos (ej. se requiere plato principal)",
    createBtn: "Crear Oferta",
    cancelBtn: "Cancelar",
    codeError: "Código de referido no encontrado o expirado",
    offerError: "Oferta no encontrada",
    balanceError: "Saldo de reserva insuficiente para pagar la recompensa",
    balanceErrorCreate:
      "Saldo de reserva insuficiente para crear la oferta. Deposite fondos primero.",
    successPrefix: "¡Referido confirmado!",
    depositSuccess: "añadido con éxito a su saldo de reserva.",
    loading: "Cargando Portal de Negocios...",
    recentTransactions: "Transacciones Recientes",
    categories: {
      restaurant: "Restaurante",
      nightlife: "Vida nocturna",
      real_estate: "Bienes raíces y villas",
      beauty: "Belleza y spa",
      fitness: "Fitness y deportes",
      retail: "Minorista",
      activity: "Actividades",
      services: "Servicios",
    },
  },
  de: {
    venue: "Veranstaltungsort-Manager",
    exit: "Beenden",
    settings: "Einstellungen ⚙️",
    balanceLabel: "Aktives Reserveguthaben",
    depositBtn: "100 $ einzahlen",
    reserveNote:
      "🔒 Reserveschutz aktiv: Angebote werden automatisch deaktiviert, wenn die Belohnung Ihr Guthaben übersteigt.",
    attributeTitle: "Empfehlungscode zuordnen",
    verifyBtn: "Verifizieren & Bezahlen",
    offersTitle: "Ihre aktiven Angebote",
    rewardLabel: "Belohnung",
    statusActive: "AKTIV",
    statusPaused: "PAUSIERT (Wenig Guthaben)",
    noOffers: "Noch keine Angebote erstellt",
    noTransactions: "Noch keine Transaktionen aufgezeichnet",
    createTitle: "Neues Angebot erstellen",
    offerTitleLabel: "Angebotstitel",
    offerTitlePlaceholder: "z. B. Sonderaktion",
    categoryLabel: "Kategorie",
    rewardTypeLabel: "Belohnungstyp",
    fixedReward: "Fester Betrag",
    percentageReward: "Prozent der Rechnung",
    rewardAmountLabel: "Promoter-Belohnungsbetrag (in USD)",
    avgBillLabel: "Durchschnittliche Rechnung (in USD)",
    percentLabel: "Belohnungsprozentsatz (%)",
    conditionsLabel: "Bedingungen / Beschreibung",
    conditionsPlaceholder:
      "Bedingungen beschreiben (z. B. Hauptgericht erforderlich)",
    createBtn: "Angebot erstellen",
    cancelBtn: "Abbrechen",
    codeError: "Aktiver Empfehlungscode nicht gefunden oder abgelaufen",
    offerError: "Angebot nicht gefunden",
    balanceError: "Ungenügendes Reserveguthaben für die Belohnung",
    balanceErrorCreate:
      "Ungenügendes Reserveguthaben für dieses Angebot. Bitte zuerst einzahlen.",
    successPrefix: "Empfehlung bestätigt!",
    depositSuccess: "erfolgreich Ihrem Reserveguthaben gutgeschrieben.",
    loading: "Business-Portal wird geladen...",
    recentTransactions: "Letzte Transaktionen",
    categories: {
      restaurant: "Restaurant",
      nightlife: "Nachtleben",
      real_estate: "Immobilien & Villen",
      beauty: "Schönheit & Spa",
      fitness: "Fitness & Sport",
      retail: "Einzelhandel",
      activity: "Aktivitäten",
      services: "Dienstleistungen",
    },
  },
  fr: {
    venue: "Gérant de l'Établissement",
    exit: "Quitter",
    settings: "Paramètres ⚙️",
    balanceLabel: "Solde de Réserve Actif",
    depositBtn: "Déposer 100 $",
    reserveNote:
      "🔒 Protection de Réserve Active : Les offres seront désactivées si la récompense dépasse le solde.",
    attributeTitle: "Attribuer Code de Parrainage",
    verifyBtn: "Vérifier & Payer",
    offersTitle: "Vos Offres Actives",
    rewardLabel: "Récompense",
    statusActive: "ACTIF",
    statusPaused: "PAUSÉ (Solde Bas)",
    noOffers: "Aucune offre créée",
    noTransactions: "Aucune transaction enregistrée pour le moment",
    createTitle: "Créer une Offre",
    offerTitleLabel: "Titre de l'Offre",
    offerTitlePlaceholder: "ex. Promotion Spéciale",
    categoryLabel: "Catégorie",
    rewardTypeLabel: "Type de Récompense",
    fixedReward: "Montant Fixe",
    percentageReward: "Pourcentage de l'Addition",
    rewardAmountLabel: "Montant de Récompense (en USD)",
    avgBillLabel: "Addition Moyenne (en USD)",
    percentLabel: "Pourcentage de Récompensa (%)",
    conditionsLabel: "Conditions / Description",
    conditionsPlaceholder: "Décrivez les termes (ex. plat principal requis)",
    createBtn: "Créer l'Offre",
    cancelBtn: "Annuler",
    codeError: "Code de parrainage non trouvé ou expiré",
    offerError: "Offre non trouvée",
    balanceError: "Solde de réserve insuffisant pour payer la récompense",
    balanceErrorCreate:
      "Solde de réserve insuffisant pour créer l'offre. Veuillez déposer des fonds.",
    successPrefix: "Parrainage confirmé !",
    depositSuccess: "ajouté avec succès à votre solde de réserve.",
    loading: "Chargement du Portail Entreprise...",
    recentTransactions: "Transactions Récentes",
    categories: {
      restaurant: "Restaurant",
      nightlife: "Vie nocturne",
      real_estate: "Immobilier & Villas",
      beauty: "Beauté & Spa",
      fitness: "Fitness & Sports",
      retail: "Commerce de détail",
      activity: "Activités",
      services: "Services",
    },
  },
};

export default function BusinessDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shortCode, setShortCode] = useState("");
  const [history, setHistory] = useState<Transaction[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOfferTitle, setNewOfferTitle] = useState("");
  const [newOfferCategory, setNewOfferCategory] = useState<
    | "nightlife"
    | "restaurant"
    | "real_estate"
    | "beauty"
    | "fitness"
    | "retail"
    | "activity"
    | "services"
  >("restaurant");
  const [rewardType, setRewardType] = useState<"fixed" | "percentage">("fixed");
  const [newOfferReward, setNewOfferReward] = useState("");
  const [newOfferPercent, setNewOfferPercent] = useState("");
  const [newOfferAvgBill, setNewOfferAvgBill] = useState("");
  const [newOfferConditions, setNewOfferConditions] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const lang = user?.language || "en";
  const t = translations[lang];

  const refreshData = async (userId: string) => {
    let bus = await businessRepository.getBusinessByOwnerId(userId);
    if (!bus) {
      // Create default if missing for some reason
      bus = await businessRepository.createBusiness({
        ownerId: userId,
        name: `${user?.fullName || "My"} Venue`,
        description: "",
        address: "",
        latitude: null,
        longitude: null,
      });
    }
    setBusinessId(bus.id);
    setLat(bus.latitude);
    setLng(bus.longitude);
    setAddress(bus.address);

    const bal = await walletRepository.getBalance(userId);
    setBalance(bal);

    const businessOffers = await offerRepository.getOffers({
      businessId: bus.id,
    });

    // Reserve Protection Layer Logic:
    const updatedOffers = await Promise.all(
      businessOffers.map(async (offer) => {
        const isBalanceSufficient = bal >= offer.rewardAmount;
        if (offer.isActive !== isBalanceSufficient) {
          return await offerRepository.updateOffer(offer.id, {
            isActive: isBalanceSufficient,
          });
        }
        return offer;
      }),
    );

    setOffers(updatedOffers);

    const txs = await walletRepository.getTransactions(userId);
    setHistory(txs.slice().reverse());
  };

  useEffect(() => {
    async function loadData() {
      try {
        let currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== "business") {
          await authService.signIn("business@agent.core", "password123");
          currentUser = await authService.getCurrentUser();
        }

        if (currentUser) {
          setUser(currentUser);

          const activeTheme =
            localStorage.getItem("theme") || currentUser.theme;
          document.documentElement.setAttribute("data-theme", activeTheme);

          await refreshData(currentUser.id);
        }
      } catch (err) {
        console.error("Error loading business dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!user) return;

    try {
      const session = await referralRepository.getSessionByCode(shortCode);
      if (!session) {
        setStatusMessage({ text: t.codeError, type: "error" });
        return;
      }

      const offer = await offerRepository.getOfferById(session.offerId);
      if (!offer) {
        setStatusMessage({ text: t.offerError, type: "error" });
        return;
      }

      await referralRepository.completeSession(session.id);

      // Money is already held in escrow (escrow_hold). We now pay the promoter:
      await walletRepository.createTransaction({
        userId: session.partnerId,
        amount: offer.rewardAmount,
        type: "reward",
        sessionId: session.id,
        status: "completed",
      });

      // Deduct reward from business reserve balance:
      await walletRepository.createTransaction({
        userId: session.businessId,
        amount: offer.rewardAmount,
        type: "fee",
        sessionId: session.id,
        status: "completed",
      });

      setStatusMessage({
        text: `${t.successPrefix} ${formatCurrency(offer.rewardAmount, user.currency)} paid to promoter.`,
        type: "success",
      });
      setShortCode("");
      await refreshData(user.id);
    } catch (err) {
      const error = err as Error;
      setStatusMessage({
        text: error.message || "Error confirming referral",
        type: "error",
      });
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let computedReward = 0;
    let percentVal: number | null = null;
    let avgBillVal: number | null = null;

    if (rewardType === "fixed") {
      computedReward = parseFloat(newOfferReward.replace(/,/g, ""));
    } else {
      const pct = parseFloat(newOfferPercent.replace(/,/g, ""));
      const bill = parseFloat(newOfferAvgBill.replace(/,/g, ""));
      if (isNaN(pct) || pct <= 0 || isNaN(bill) || bill <= 0) {
        alert("Invalid percentage or average bill value");
        return;
      }
      computedReward = (bill * pct) / 100;
      percentVal = pct;
      avgBillVal = bill;
    }

    if (isNaN(computedReward) || computedReward <= 0) {
      alert("Invalid reward calculation");
      return;
    }

    if (balance < computedReward) {
      alert(t.balanceErrorCreate);
      return;
    }

    try {
      if (!businessId) {
        alert("Business record not found");
        return;
      }

      await offerRepository.createOffer({
        businessId: businessId,
        title: newOfferTitle,
        rewardAmount: computedReward,
        rewardType,
        rewardPercent: percentVal,
        averageBill: avgBillVal,
        category: newOfferCategory,
        conditions: newOfferConditions || null,
      });

      setNewOfferTitle("");
      setNewOfferReward("");
      setNewOfferPercent("");
      setNewOfferAvgBill("");
      setNewOfferConditions("");
      setNewOfferCategory("restaurant");

      setShowCreateModal(false);
      await refreshData(user.id);
    } catch (err) {
      alert("Failed to create offer");
    }
  };

  const handleDepositReserve = async () => {
    if (!user) return;
    try {
      await walletRepository.createTransaction({
        userId: user.id,
        amount: 100.0,
        type: "deposit",
        sessionId: null,
        status: "completed",
      });
      await refreshData(user.id);
      setStatusMessage({
        text: `${formatCurrency(100.0, user.currency)} ${t.depositSuccess}`,
        type: "success",
      });
    } catch (err) {
      alert("Deposit failed");
    }
  };

  const handleLogout = async () => {
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
            {t?.loading || "Loading..."}
          </p>
          <style
            dangerouslySetInnerHTML={{
              __html:
                `
        /* Hide number arrows */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
` +
                `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-gradient)",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "24px",
            padding: "30px",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(244, 63, 94, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--error)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1
            style={{
              color: "var(--foreground)",
              fontSize: "1.4rem",
              fontWeight: 700,
              marginBottom: "15px",
            }}
          >
            Аккаунт заблокирован
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              textAlign: "left",
              background: "rgba(0,0,0,0.2)",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.6,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Дата разблокировки:
              </span>
              <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
                {user.banUntil
                  ? new Date(user.banUntil).toLocaleDateString("ru-RU")
                  : "Навсегда (Пермабан)"}
              </span>
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.6,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Причина:
              </span>
              <span style={{ fontWeight: 600, color: "var(--error)" }}>
                {user.banReason || "Нарушение правил платформы"}
              </span>
            </div>
          </div>
        </div>
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        className="glass-header"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
          padding: "var(--header-padding, 1rem)",
          marginLeft: "var(--header-margin-horizontal, 0)",
          marginRight: "var(--header-margin-horizontal, 0)",
          marginTop: "var(--header-margin-top, 0)",
          position: "sticky",
          top: 0,
          zIndex: 90,
        }}
      >
        {/* Hamburger Icon */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--foreground)",
            cursor: "pointer",
            padding: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
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
          onClick={() => router.push("/business/profile")}
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
            {user?.fullName}
            {user?.status === "verified" && <VerificationBadge size={14} />}
          </h4>
          <img
            src={
              user?.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
            }
            alt="Avatar"
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "2.5px solid var(--primary)",
              objectFit: "cover",
            }}
          />
        </div>
      </header>

      <SettingsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Centered Single Column Layout */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Offers List */}
        <div className="panel" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ margin: 0 }}>{t.offersTitle}</h3>
            {/* Small Plus Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--primary)",
                color: "#000000",
                border: "none",
                fontSize: "1.5rem",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.1s ease",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.95)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              +
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  padding: "1rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {offer.imageUrl && (
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        float: "left",
                        marginRight: "12px",
                      }}
                    />
                  )}
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>
                    {offer.title}
                  </h4>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.5,
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    {t.rewardLabel}:{" "}
                    <strong>
                      {user &&
                        formatCurrency(offer.rewardAmount, user.currency)}
                    </strong>
                    {offer.rewardType === "percentage" &&
                      user &&
                      ` (${offer.rewardPercent}% of ${formatCurrency(offer.averageBill || 0, user.currency)} check)`}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      opacity: 0.4,
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    Category:{" "}
                    <strong style={{ textTransform: "uppercase" }}>
                      {offer.category}
                    </strong>
                  </span>
                  {offer.conditions && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        opacity: 0.4,
                        display: "block",
                        marginTop: "2px",
                      }}
                    >
                      {offer.conditions}
                    </span>
                  )}
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: offer.isActive
                        ? "rgba(82,196,26,0.1)"
                        : "rgba(255,77,79,0.1)",
                      color: offer.isActive ? "var(--success)" : "var(--error)",
                    }}
                  >
                    {offer.isActive ? t.statusActive : t.statusPaused}
                  </span>
                </div>
              </div>
            ))}
            {offers.length === 0 && (
              <p
                style={{
                  opacity: 0.4,
                  fontSize: "0.85rem",
                  textAlign: "center",
                  padding: "1rem 0",
                }}
              >
                {t.noOffers}
              </p>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="panel" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              marginBottom: "1.2rem",
              fontSize: "1.15rem",
              fontWeight: 700,
            }}
          >
            {t.recentTransactions}
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {history.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.01)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {tx.type === "deposit"
                      ? "💳 Reserve Deposit"
                      : tx.type === "fee"
                        ? "💸 Commission Deducted"
                        : tx.type === "reward"
                          ? "🎁 Promoter Reward"
                          : "🔄 Wallet Transaction"}
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      opacity: 0.4,
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: tx.type === "deposit" ? "#52c41a" : "#ff4d4f",
                    }}
                  >
                    {tx.type === "deposit" ? "+" : "-"}
                    {user && formatCurrency(tx.amount, user.currency)}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      opacity: 0.5,
                      textTransform: "uppercase",
                      marginTop: "2px",
                    }}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p
                style={{
                  opacity: 0.4,
                  fontSize: "0.85rem",
                  textAlign: "center",
                  padding: "1rem 0",
                }}
              >
                {t.noTransactions || "No transactions recorded yet"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal dialog for creating new offer */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "2rem",
              background: "var(--background)",
              border: "1px solid var(--accent)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
            }}
          >
            <h3
              style={{
                marginBottom: "1.5rem",
                fontSize: "1.3rem",
                fontWeight: 700,
              }}
            >
              {t.createTitle}
            </h3>

            <form
              onSubmit={handleCreateOffer}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
              }}
            >
              {/* Category Selector */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {t.categoryLabel}
                </label>
                <select
                  value={newOfferCategory}
                  onChange={(e) => setNewOfferCategory(e.target.value as any)}
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--foreground)",
                    padding: "10px",
                    borderRadius: "6px",
                    outline: "none",
                    appearance: "none",
                  }}
                >
                  <option
                    value="restaurant"
                    style={{ background: "var(--background)" }}
                  >
                    {t.categories.restaurant}
                  </option>
                  <option
                    value="nightlife"
                    style={{ background: "var(--background)" }}
                  >
                    {t.categories.nightlife}
                  </option>
                  <option
                    value="real_estate"
                    style={{ background: "var(--background)" }}
                  >
                    {t.categories.real_estate}
                  </option>
                  <option
                    value="beauty"
                    style={{ background: "var(--background)" }}
                  >
                    {t.categories.beauty}
                  </option>
                  <option
                    value="fitness"
                    style={{ background: "var(--background)" }}
                  >
                    {t.categories.fitness}
                  </option>
                  <option
                    value="retail"
                    style={{ background: "var(--background)" }}
                  >
                    {t.categories.retail}
                  </option>
                  <option
                    value="activity"
                    style={{ background: "var(--background)" }}
                  >
                    {t.categories.activity}
                  </option>
                  <option
                    value="services"
                    style={{ background: "var(--background)" }}
                  >
                    {t.categories.services}
                  </option>
                </select>
              </div>

              {/* Reward Type Selection */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {t.rewardTypeLabel}
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setRewardType("fixed")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      border: "2px solid",
                      borderColor:
                        rewardType === "fixed" ? "#FFFFFF" : "transparent",
                      background:
                        rewardType === "fixed"
                          ? "rgba(255,255,255,0.1)"
                          : "var(--input-bg)",
                      color: "var(--foreground)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    {t.fixedReward}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRewardType("percentage")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      border: "2px solid",
                      borderColor:
                        rewardType === "percentage" ? "#FFFFFF" : "transparent",
                      background:
                        rewardType === "percentage"
                          ? "rgba(255,255,255,0.1)"
                          : "var(--input-bg)",
                      color: "var(--foreground)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    {t.percentageReward}
                  </button>
                </div>
              </div>

              {rewardType === "fixed" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {t.rewardAmountLabel.replace(
                      "USD",
                      user?.currency || "USD",
                    )}
                  </label>
                  <input
                    type="text"
                    value={newOfferReward}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d.]/g, "");
                      const parts = val.split(".");
                      if (parts[0])
                        parts[0] = Number(parts[0]).toLocaleString("en-US");
                      setNewOfferReward(parts.join("."));
                    }}
                    placeholder="5.00"
                    required
                    min="0.01"
                    step="0.01"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--surface-border)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "var(--foreground)",
                      outline: "none",
                    }}
                  />
                  {newOfferReward &&
                    !isNaN(Number(newOfferReward.replace(/,/g, ""))) && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--primary)",
                          marginTop: "4px",
                        }}
                      >
                        Preview:{" "}
                        {formatCurrency(
                          parseFloat(newOfferReward.replace(/,/g, "")),
                          user?.currency || "USD",
                        )}
                      </div>
                    )}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                      {t.avgBillLabel.replace("USD", user?.currency || "USD")}
                    </label>
                    <input
                      type="text"
                      value={newOfferAvgBill}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d.]/g, "");
                        const parts = val.split(".");
                        if (parts[0])
                          parts[0] = Number(parts[0]).toLocaleString("en-US");
                        setNewOfferAvgBill(parts.join("."));
                      }}
                      placeholder="100.00"
                      required
                      min="1"
                      step="0.01"
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--surface-border)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        color: "var(--foreground)",
                        outline: "none",
                      }}
                    />
                    {newOfferAvgBill &&
                      !isNaN(Number(newOfferAvgBill.replace(/,/g, ""))) && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--primary)",
                            marginTop: "4px",
                          }}
                        >
                          Preview:{" "}
                          {formatCurrency(
                            parseFloat(newOfferAvgBill.replace(/,/g, "")),
                            user?.currency || "USD",
                          )}
                        </div>
                      )}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                      {t.percentLabel}
                    </label>
                    <input
                      type="number"
                      value={newOfferPercent}
                      onChange={(e) => setNewOfferPercent(e.target.value)}
                      placeholder="10"
                      required
                      min="0.1"
                      max="100"
                      step="0.1"
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--surface-border)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        color: "var(--foreground)",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {t.conditionsLabel}
                </label>
                <textarea
                  value={newOfferConditions}
                  onChange={(e) => setNewOfferConditions(e.target.value)}
                  placeholder={t.conditionsPlaceholder}
                  rows={3}
                  style={{
                    background: "var(--input-bg)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "var(--foreground)",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    background: "var(--input-bg)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--foreground)",
                    padding: "12px",
                    borderRadius: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2 }}
                >
                  {t.createBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
