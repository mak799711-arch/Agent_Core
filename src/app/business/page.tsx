"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  authService,
  offerRepository,
  walletRepository,
  businessRepository,
} from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";
import { Offer } from "@/lib/interfaces/offers";
import { formatCurrency, convertToUSD } from "@/lib/utils/currency";
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
    reserveNote: "🔒 Reserve Protection Active: Offers will automatically de-activate if reward amount exceeds your current reserve balance.",
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
    conditionsPlaceholder: "Describe conversion terms (e.g. purchase of main dish is required)",
    createBtn: "Create Offer",
    cancelBtn: "Cancel",
    codeError: "Active referral code not found or expired",
    offerError: "Offer not found",
    balanceError: "Insufficient reserve balance to pay the reward",
    balanceErrorCreate: "Insufficient reserve balance to cover the reward. Please deposit funds first.",
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
      services: "Services"
    },
    globalMarginLabel: "Global Margin (%)",
    globalMarginDesc: "This percentage will be split between the tourist discount, agent reward, and platform fee."
  },
  ru: {
    venue: "Менеджер заведения",
    exit: "Выйти",
    settings: "Настройки ⚙️",
    balanceLabel: "Активный баланс резерва",
    depositBtn: "Пополнить на $100",
    reserveNote: "🔒 Защита резервов активна: офферы автоматически отключаются, если сумма награды превышает текущий баланс резерва.",
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
    conditionsPlaceholder: "Опишите условия конверсии (например, обязательна покупка горячего блюда)",
    createBtn: "Создать предложение",
    cancelBtn: "Отмена",
    codeError: "Активный реферальный код не найден или истек",
    offerError: "Предложение не найдено",
    balanceError: "Недостаточно средств в резерве для выплаты награды",
    balanceErrorCreate: "Недостаточно средств на балансе резерва для создания предложения. Пожалуйста, пополните баланс.",
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
      services: "Услуги"
    },
    globalMarginLabel: "% за клиента",
    globalMarginDesc: "Этот процент будет разделен между скидкой туристу, вознаграждением агенту и платформой."
  },
  id: {
    venue: "Manajer Tempat",
    exit: "Keluar",
    settings: "Pengaturan ⚙️",
    balanceLabel: "Saldo Cadangan Aktif",
    depositBtn: "Setor $100",
    reserveNote: "🔒 Perlindungan Cadangan Aktif: Penawaran akan dinonaktifkan secara otomatis jika jumlah hadiah melebihi saldo cadangan Anda saat ini.",
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
    conditionsPlaceholder: "Jelaskan persyaratan konversi (misalnya, pembelian hidangan utama diperlukan)",
    createBtn: "Buat Penawaran",
    cancelBtn: "Batal",
    codeError: "Kode rujukan aktif tidak ditemukan atau kedaluwarsa",
    offerError: "Penawaran tidak ditemukan",
    balanceError: "Saldo cadangan tidak mencukupi untuk membayar hadiah",
    balanceErrorCreate: "Saldo cadangan tidak mencukupi untuk membuat penawaran ini. Silakan setor dana terlebih dahulu.",
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
      services: "Layanan"
    },
    globalMarginLabel: "Margin Global (%)",
    globalMarginDesc: "Persentase ini akan dibagi antara diskon turis, hadiah agen, dan biaya platform."
  },
  zh: {
    venue: "商户经理",
    exit: "退出",
    settings: "设置 ⚙️",
    balanceLabel: "活跃准备金余额",
    depositBtn: "充值 $100",
    reserveNote: "🔒 准备金保护已激活：如果奖励金额超过当前准备金余额，优惠将自动停用。",
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
      services: "服务"
    },
    globalMarginLabel: "总利润率 (%)",
    globalMarginDesc: "该百分比将在游客折扣、代理奖励和平台费用之间分配。"
  },
  es: {
    venue: "Gerente del Lugar",
    exit: "Salir",
    settings: "Ajustes ⚙️",
    balanceLabel: "Saldo de Reserva Activo",
    depositBtn: "Depositar $100",
    reserveNote: "🔒 Protección de Reserva Activa: Las ofertas se desactivarán automáticamente si la recompensa excede el saldo de reserva.",
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
    conditionsPlaceholder: "Describa los términos (ej. se requiere plato principal)",
    createBtn: "Crear Oferta",
    cancelBtn: "Cancelar",
    codeError: "Código de referido no encontrado o expirado",
    offerError: "Oferta no encontrada",
    balanceError: "Saldo de reserva insuficiente para pagar la recompensa",
    balanceErrorCreate: "Saldo de reserva insuficiente para crear la oferta. Deposite fondos primero.",
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
      services: "Servicios"
    },
    globalMarginLabel: "Margen Global (%)",
    globalMarginDesc: "Este porcentaje se dividirá entre el descuento para turistas, la recompensa para el agente y la tarifa de la plataforma."
  },
  de: {
    venue: "Veranstaltungsort-Manager",
    exit: "Beenden",
    settings: "Einstellungen ⚙️",
    balanceLabel: "Aktives Reserveguthaben",
    depositBtn: "100 $ einzahlen",
    reserveNote: "🔒 Reserveschutz aktiv: Angebote werden automatisch deaktiviert, wenn die Belohnung Ihr Guthaben übersteigt.",
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
    conditionsPlaceholder: "Bedingungen beschreiben (z. B. Hauptgericht erforderlich)",
    createBtn: "Angebot erstellen",
    cancelBtn: "Abbrechen",
    codeError: "Aktiver Empfehlungscode nicht gefunden oder abgelaufen",
    offerError: "Angebot nicht gefunden",
    balanceError: "Ungenügendes Reserveguthaben für die Belohnung",
    balanceErrorCreate: "Ungenügendes Reserveguthaben für dieses Angebot. Bitte zuerst einzahlen.",
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
      services: "Dienstleistungen"
    },
    globalMarginLabel: "Globale Marge (%)",
    globalMarginDesc: "Dieser Prozentsatz wird zwischen Touristenrabatt, Agentenbelohnung und Plattformgebühr aufgeteilt."
  },
  fr: {
    venue: "Gérant de l'Établissement",
    exit: "Quitter",
    settings: "Paramètres ⚙️",
    balanceLabel: "Solde de Réserve Actif",
    depositBtn: "Déposer 100 $",
    reserveNote: "🔒 Protection de Réserve Active : Les offres seront désactivées si la récompense dépasse le solde.",
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
    balanceErrorCreate: "Solde de réserve insuffisant pour créer l'offre. Veuillez déposer des fonds.",
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
      services: "Services"
    },
    globalMarginLabel: "Marge Globale (%)",
    globalMarginDesc: "Ce pourcentage sera réparti entre la remise touriste, la récompense agent et les frais de plateforme."
  },
  ja: {
    venue: "会場マネージャー",
    exit: "終了",
    settings: "設定 ⚙️",
    balanceLabel: "アクティブな準備金残高",
    depositBtn: "$100をデポジット",
    reserveNote: "🔒 準備金保護がアクティブです：報酬額が現在の準備金残高を超えると、オファーは自動的に無効になります。",
    attributeTitle: "紹介コードを適用",
    verifyBtn: "確認して支払う",
    offersTitle: "アクティブなオファー",
    rewardLabel: "報酬",
    statusActive: "アクティブ",
    statusPaused: "一時停止（残高不足）",
    noOffers: "まだオファーが作成されていません",
    noTransactions: "まだ取引が記録されていません",
    createTitle: "新しいオファーを作成",
    offerTitleLabel: "オファーのタイトル",
    offerTitlePlaceholder: "例: 特別プロモーション",
    categoryLabel: "カテゴリー",
    rewardTypeLabel: "報酬タイプ",
    fixedReward: "固定額",
    percentageReward: "請求額のパーセンテージ",
    rewardAmountLabel: "プロモーター報酬額（USD）",
    avgBillLabel: "平均請求額（USD）",
    percentLabel: "報酬パーセンテージ（％）",
    conditionsLabel: "条件/説明",
    conditionsPlaceholder: "変換条件を説明してください（例：メインディッシュの購入が必要）",
    createBtn: "オファーを作成",
    cancelBtn: "キャンセル",
    codeError: "アクティブな紹介コードが見つからないか、期限切れです",
    offerError: "オファーが見つかりません",
    balanceError: "報酬を支払うための準備金残高が不足しています",
    balanceErrorCreate: "報酬をカバーするための準備金残高が不足しています。先に資金を預けてください。",
    successPrefix: "紹介が確認されました！",
    depositSuccess: "準備金残高に正常に追加されました。",
    loading: "ビジネス・ポータルを読み込み中...",
    recentTransactions: "最近の取引",
    categories: {
      restaurant: "レストラン",
      nightlife: "ナイトライフ",
      real_estate: "不動産＆ヴィラ",
      beauty: "ビューティー＆スパ",
      fitness: "フィットネス＆スポーツ",
      retail: "小売",
      activity: "アクティビティ",
      services: "サービス"
    },
    globalMarginLabel: "グローバルマージン (%)",
    globalMarginDesc: "この割合は、観光客の割引、エージェントの報酬、およびプラットフォーム手数料に分配されます。"
  },
  ar: {
    venue: "مدير المكان",
    exit: "خروج",
    settings: "الإعدادات ⚙️",
    balanceLabel: "رصيد الاحتياطي النشط",
    depositBtn: "إيداع 100 دولار",
    reserveNote: "🔒 حماية الاحتياطي نشطة: سيتم إلغاء تنشيط العروض تلقائيًا إذا تجاوز مبلغ المكافأة رصيد الاحتياطي الحالي.",
    attributeTitle: "إدخال رمز الإحالة",
    verifyBtn: "التحقق والدفع",
    offersTitle: "عروضك النشطة",
    rewardLabel: "مكافأة",
    statusActive: "نشط",
    statusPaused: "متوقف (رصيد منخفض)",
    noOffers: "لم يتم إنشاء عروض حتى الآن",
    noTransactions: "لم يتم تسجيل معاملات حتى الآن",
    createTitle: "إنشاء عرض جديد",
    offerTitleLabel: "عنوان العرض",
    offerTitlePlaceholder: "مثال: ترويج خاص",
    categoryLabel: "فئة",
    rewardTypeLabel: "نوع المكافأة",
    fixedReward: "مبلغ ثابت",
    percentageReward: "نسبة من الفاتورة",
    rewardAmountLabel: "مبلغ مكافأة المروج (بالدولار الأمريكي)",
    avgBillLabel: "متوسط الفاتورة (بالدولار الأمريكي)",
    percentLabel: "نسبة المكافأة (%)",
    conditionsLabel: "الشروط / الوصف",
    conditionsPlaceholder: "صف شروط التحويل (مثال: شراء الطبق الرئيسي مطلوب)",
    createBtn: "إنشاء العرض",
    cancelBtn: "إلغاء",
    codeError: "رمز الإحالة النشط غير موجود أو منتهي الصلاحية",
    offerError: "العرض غير موجود",
    balanceError: "رصيد الاحتياطي غير كافٍ لدفع المكافأة",
    balanceErrorCreate: "رصيد الاحتياطي غير كافٍ لتغطية المكافأة. يرجى إيداع الأموال أولاً.",
    successPrefix: "تم تأكيد الإحالة!",
    depositSuccess: "تم إضافته بنجاح إلى رصيد الاحتياطي الخاص بك.",
    loading: "جارٍ تحميل بوابة الأعمال...",
    recentTransactions: "المعاملات الأخيرة",
    categories: {
      restaurant: "مطعم",
      nightlife: "حياة الليل",
      real_estate: "عقارات وفلل",
      beauty: "تجميل وسبا",
      fitness: "لياقة ورياضة",
      retail: "تجزئة",
      activity: "أنشطة",
      services: "خدمات"
    },
    globalMarginLabel: "الهامش الإجمالي (%)",
    globalMarginDesc: "سيتم تقسيم هذه النسبة بين خصم السائح ومكافأة الوكيل ورسوم المنصة."
  },
  pt: {
    venue: "Gestor de Local",
    exit: "Sair",
    settings: "Configurações ⚙️",
    balanceLabel: "Saldo de Reserva Ativo",
    depositBtn: "Depositar $100",
    reserveNote: "🔒 Proteção de Reserva Ativa: As ofertas serão desativadas automaticamente se o montante da recompensa exceder o saldo atual da sua reserva.",
    attributeTitle: "Atribuir Código de Referência",
    verifyBtn: "Verificar e Pagar",
    offersTitle: "As Suas Ofertas Ativas",
    rewardLabel: "Recompensa",
    statusActive: "ATIVO",
    statusPaused: "PAUSADO (Saldo Baixo)",
    noOffers: "Ainda não foram criadas ofertas",
    noTransactions: "Ainda não há transações registadas",
    createTitle: "Criar Nova Oferta",
    offerTitleLabel: "Título da Oferta",
    offerTitlePlaceholder: "ex: Promoção Especial",
    categoryLabel: "Categoria",
    rewardTypeLabel: "Tipo de Recompensa",
    fixedReward: "Montante Fixo",
    percentageReward: "Percentagem da Conta",
    rewardAmountLabel: "Montante de Recompensa do Promotor (em USD)",
    avgBillLabel: "Conta Média (em USD)",
    percentLabel: "Percentagem de Recompensa (%)",
    conditionsLabel: "Condições / Descrição",
    conditionsPlaceholder: "Descreva os termos de conversão (ex: é obrigatória a compra de um prato principal)",
    createBtn: "Criar Oferta",
    cancelBtn: "Cancelar",
    codeError: "Código de referência ativo não encontrado ou expirado",
    offerError: "Oferta não encontrada",
    balanceError: "Saldo de reserva insuficiente para pagar a recompensa",
    balanceErrorCreate: "Saldo de reserva insuficiente para cobrir a recompensa. Por favor, deposite fundos primeiro.",
    successPrefix: "Referência confirmada!",
    depositSuccess: "adicionado com sucesso ao seu saldo de reserva.",
    loading: "A carregar Portal de Negócios...",
    recentTransactions: "Transações Recentes",
    categories: {
      restaurant: "Restaurante",
      nightlife: "Vida Noturna",
      real_estate: "Imobiliária e Vilas",
      beauty: "Beleza e Spa",
      fitness: "Fitness e Desporto",
      retail: "Retalho",
      activity: "Atividades",
      services: "Serviços"
    },
    globalMarginLabel: "Margem Global (%)",
    globalMarginDesc: "Esta percentagem será dividida entre o desconto para turistas, a recompensa do agente e a taxa da plataforma."
  },
  hi: {
    venue: "स्थान प्रबंधक",
    exit: "बाहर निकलें",
    settings: "सेटिंग्स ⚙️",
    balanceLabel: "सक्रिय रिजर्व बैलेंस",
    depositBtn: "$100 जमा करें",
    reserveNote: "🔒 रिजर्व सुरक्षा सक्रिय: यदि इनाम राशि आपके वर्तमान रिजर्व बैलेंस से अधिक है, तो ऑफ़र स्वचालित रूप से निष्क्रिय हो जाएंगे।",
    attributeTitle: "रेफरल कोड एट्रिब्यूट करें",
    verifyBtn: "सत्यापित करें और भुगतान करें",
    offersTitle: "आपके सक्रिय ऑफ़र",
    rewardLabel: "इनाम",
    statusActive: "सक्रिय",
    statusPaused: "रुका हुआ (कम बैलेंस)",
    noOffers: "अभी तक कोई ऑफ़र नहीं बनाया गया है",
    noTransactions: "अभी तक कोई लेनदेन रिकॉर्ड नहीं किया गया है",
    createTitle: "नया ऑफ़र बनाएं",
    offerTitleLabel: "ऑफ़र शीर्षक",
    offerTitlePlaceholder: "उदा. विशेष पदोन्नति",
    categoryLabel: "श्रेणी",
    rewardTypeLabel: "इनाम का प्रकार",
    fixedReward: "निश्चित राशि",
    percentageReward: "बिल का प्रतिशत",
    rewardAmountLabel: "प्रमोटर इनाम राशि (USD में)",
    avgBillLabel: "औसत बिल (USD में)",
    percentLabel: "इनाम प्रतिशत (%)",
    conditionsLabel: "शर्तें / विवरण",
    conditionsPlaceholder: "रूपांतरण शर्तों का वर्णन करें (उदा. मुख्य पकवान की खरीद आवश्यक है)",
    createBtn: "ऑफ़र बनाएं",
    cancelBtn: "रद्द करें",
    codeError: "सक्रिय रेफरल कोड नहीं मिला या समाप्त हो गया है",
    offerError: "ऑफ़र नहीं मिला",
    balanceError: "इनाम का भुगतान करने के लिए अपर्याप्त रिजर्व बैलेंस",
    balanceErrorCreate: "इनाम को कवर करने के लिए अपर्याप्त रिजर्व बैलेंस। कृपया पहले धनराशि जमा करें।",
    successPrefix: "रेफरल की पुष्टि हो गई!",
    depositSuccess: "आपके रिजर्व बैलेंस में सफलतापूर्वक जोड़ा गया।",
    loading: "बिजनेस पोर्टल लोड हो रहा है...",
    recentTransactions: "हालिया लेनदेन",
    categories: {
      restaurant: "रेस्तरां",
      nightlife: "नाइटलाइफ़",
      real_estate: "रियल एस्टेट और विला",
      beauty: "ब्यूटी एंड स्पा",
      fitness: "फिटनेस और खेल",
      retail: "रिटेल",
      activity: "गतिविधियां",
      services: "सेवाएं"
    },
    globalMarginLabel: "वैश्विक मार्जिन (%)",
    globalMarginDesc: "यह प्रतिशत पर्यटक छूट, एजेंट इनाम और प्लेटफ़ॉर्म शुल्क के बीच विभाजित किया जाएगा।"
  }
};;

export default function BusinessDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shortCode, setShortCode] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
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
  const [globalMargin, setGlobalMargin] = useState<string>("10");
  const [averageBill, setAverageBill] = useState<string>("");
  const [newOfferConditions, setNewOfferConditions] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const lang = user?.language || "en";
  const t = (translations as any)[lang] || translations.en;

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

    const businessOffers = await offerRepository.getOffers({
      businessId: bus.id,
    });

    setOffers(businessOffers);
  };

  useEffect(() => {
    async function loadData() {
      try {
        let currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== "business") {
          await authService.signIn("business@agent.core", "password123");
          currentUser = await authService.getCurrentUser();
          router.push("/login");
          return;
        }

        if (currentUser) {
          setUser(currentUser);
          if (currentUser.theme) {
            document.documentElement.setAttribute('data-theme', currentUser.theme);
          }

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


  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const margin = parseFloat(globalMargin);
    if (isNaN(margin) || margin < 1 || margin > 100) {
      alert("Invalid Global Margin percentage (must be between 1 and 100)");
      return;
    }

    const avgBillVal = averageBill ? parseFloat(averageBill) : null;

    try {
      if (!businessId) {
        alert("Business record not found");
        return;
      }

      await offerRepository.createOffer({
        businessId: businessId,
        title: newOfferTitle,
        globalMarginPercent: margin,
        averageBill: avgBillVal,
        category: newOfferCategory,
        conditions: newOfferConditions || null,
      });

      setNewOfferTitle("");
      setGlobalMargin("10");
      setAverageBill("");
      setNewOfferConditions("");
      setNewOfferCategory("restaurant");

      setShowCreateModal(false);
      await refreshData(user.id);
    } catch (err) {
      alert("Failed to create offer");
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                  
                  {/* Toggle Button */}
                  <label style={{
                    position: "relative",
                    display: "inline-block",
                    width: "44px",
                    height: "24px"
                  }}>
                    <input 
                      type="checkbox" 
                      checked={offer.isActive}
                      onChange={async () => {
                        const newStatus = !offer.isActive;
                        try {
                          await offerRepository.updateOffer(offer.id, { isActive: newStatus });
                          setOffers(offers.map(o => o.id === offer.id ? { ...o, isActive: newStatus } : o));
                        } catch (e) {
                          alert("Failed to update status");
                        }
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: "absolute",
                      cursor: "pointer",
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: offer.isActive ? "var(--primary)" : "var(--surface-border)",
                      transition: ".4s",
                      borderRadius: "24px"
                    }}>
                      <span style={{
                        position: "absolute",
                        content: '""',
                        height: "18px",
                        width: "18px",
                        left: offer.isActive ? "22px" : "3px",
                        bottom: "3px",
                        backgroundColor: offer.isActive ? "#000" : "#fff",
                        transition: ".4s",
                        borderRadius: "50%"
                      }}></span>
                    </span>
                  </label>
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
              {/* Offer Title */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {t.offerTitleLabel || "Offer Title"}
                </label>
                <input
                  type="text"
                  value={newOfferTitle}
                  onChange={(e) => setNewOfferTitle(e.target.value)}
                  placeholder={t.offerTitlePlaceholder || "e.g. Special Promotion"}
                  required
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
              <div style={{ display: "flex", gap: "1rem" }}>
                {/* Global Margin Selection */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    flex: 1,
                  }}
                >
                  <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {t.globalMarginLabel}
                  </label>
                  <input
                    type="number"
                    value={globalMargin}
                    onChange={(e) => setGlobalMargin(e.target.value)}
                    placeholder="10"
                    required
                    min="1"
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
                  <p style={{ fontSize: "0.7rem", opacity: 0.6, marginTop: "2px" }}>
                    {t.globalMarginDesc}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    flex: 1,
                  }}
                >
                  <label style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {t.avgBillLabel ? t.avgBillLabel.replace("USD", user?.currency || "USD") : "Average Bill"}
                  </label>
                  <input
                    type="number"
                    value={averageBill}
                    onChange={(e) => setAverageBill(e.target.value)}
                    placeholder="e.g. 50"
                    min="0"
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
