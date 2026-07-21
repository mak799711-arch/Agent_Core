"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  authService,
  walletRepository,
} from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";
import { ReferralSession } from "@/lib/interfaces/referrals";
import { formatCurrency } from "@/lib/utils/currency";
import VerificationBadge from "@/app/components/VerificationBadge";
import QRScanner from "@/app/components/QRScanner";
import { supabase } from "@/lib/supabase/client";

const translations = {
  en: {
    admin: "Platform Administrator",
    exit: "Sign Out",
    dashboardTitle: "Platform Command Center",
    loading: "Loading Admin Console...",
    totalVolume: "Platform Turnover",
    totalAgents: "Agents Count",
    totalBusinesses: "Businesses Count",
    tabActive: "Most Active (Top-10)",
    tabBanned: "Ban List",
    tabRequests: "Verification Requests",
    tabAudit: "Audit & Fraud",
    tabSupport: "Support Tickets",
    status: "Status",
    role: "Role",
    agent: "Agent",
    venue: "Venue",
    volume: "Turnover",
    escrow: "Active Escrow",
    action: "Actions",
    verified: "VERIFIED",
    unverified: "UNVERIFIED",
    banned: "BANNED",
    banDuration: "Ban Duration",
    banOptionsTitle: "Select Ban Duration",
    banOption1d: "1 Day",
    banOption1w: "1 Week",
    banOption1m: "1 Month",
    banOption1y: "1 Year",
    banOptionForever: "Forever",
    btnCancel: "Cancel",
    unban: "Unban User",
    successUpdate: "Action completed successfully!",
    promoters: "Active Promoters & Agents",
    merchants: "Active Businesses",
    emptyActiveAgents: "No active promoters registered yet.",
    emptyActiveVenues: "No active businesses registered yet.",
    emptyBanned: "All users are in good standing. Ban list is empty.",
    emptyRequests: "Verification queue is empty.",
    emptySessions: "No sessions match your search criteria.",
    searchCode: "Enter Deal ID manually",
    searchPromoter: "Search by Promoter ID",
    btnFlag: "Flag Fraud",
    btnBlock: "Block Promoter",
    btnUnblock: "Unblock",
    geoLocation: "Location",
    sessionCode: "Session Code",
    created: "Created At"
  },
  ru: {
    admin: "Администратор платформы",
    exit: "Выход",
    dashboardTitle: "Командный центр платформы",
    loading: "Загрузка консоли администратора...",
    totalVolume: "Оборот платформы",
    totalAgents: "Кол-во агентов",
    totalBusinesses: "Кол-во заведений",
    tabActive: "Самые активные (Топ-10)",
    tabBanned: "Бан-лист",
    tabRequests: "Запросы верификации",
    tabAudit: "Аудит и Фрод",
    tabSupport: "Жалобы и Вопросы",
    status: "Статус",
    role: "Роль",
    agent: "Агент",
    venue: "Заведение",
    volume: "Оборот",
    escrow: "В холде (Escrow)",
    action: "Действия",
    verified: "ВЕРИФИЦИРОВАН",
    unverified: "НЕ ВЕРИФИЦИРОВАН",
    banned: "В БАНЕ",
    banDuration: "Срок блокировки",
    banOptionsTitle: "Выберите срок",
    banOption1d: "1 день",
    banOption1w: "1 неделя",
    banOption1m: "1 месяц",
    banOption1y: "1 год",
    banOptionForever: "Навсегда",
    btnCancel: "Отмена",
    unban: "Разбанить",
    successUpdate: "Действие выполнено!",
    promoters: "Активные промоутеры",
    merchants: "Активные бизнесы",
    emptyActiveAgents: "Нет активных агентов.",
    emptyActiveVenues: "Нет активных заведений.",
    emptyBanned: "Бан-лист пуст.",
    emptyRequests: "Очередь верификации пуста.",
    emptySessions: "Нет сессий.",
    searchCode: "Ввести ID сделки вручную",
    searchPromoter: "Поиск по ID промоутера",
    btnFlag: "Отметить фрод",
    btnBlock: "Заблокировать",
    btnUnblock: "Разблокировать",
    geoLocation: "Локация",
    sessionCode: "Код сессии",
    created: "Создано"
  },
  id: {
    admin: "Administrator Platform",
    exit: "Keluar",
    dashboardTitle: "Pusat Komando Platform",
    loading: "Memuat Konsol Admin...",
    totalVolume: "Omset Platform",
    totalAgents: "Jumlah Agen",
    totalBusinesses: "Jumlah Bisnis",
    tabActive: "Paling Aktif (Top-10)",
    tabBanned: "Daftar Blokir",
    tabRequests: "Permintaan Verifikasi",
    tabAudit: "Audit & Penipuan",
    status: "Status",
    role: "Peran",
    agent: "Agen",
    venue: "Tempat",
    volume: "Omset",
    escrow: "Escrow Aktif",
    action: "Aksi",
    verified: "TERVERIFIKASI",
    unverified: "BELUM TERVERIFIKASI",
    banned: "DIBLOKIR",
    banDuration: "Durasi Blokir",
    banOptionsTitle: "Pilih Durasi Blokir",
    banOption1d: "1 Hari",
    banOption1w: "1 Minggu",
    banOption1m: "1 Bulan",
    banOption1y: "1 Tahun",
    banOptionForever: "Selamanya",
    btnCancel: "Batal",
    unban: "Buka Blokir Pengguna",
    successUpdate: "Tindakan berhasil diselesaikan!",
    promoters: "Promotor & Agen Aktif",
    merchants: "Bisnis Aktif",
    emptyActiveAgents: "Belum ada promotor aktif.",
    emptyActiveVenues: "Belum ada bisnis aktif.",
    emptyBanned: "Semua pengguna dalam status baik.",
    emptyRequests: "Antrean verifikasi kosong.",
    emptySessions: "Tidak ada sesi.",
    searchCode: "Cari dengan Kode",
    searchPromoter: "Cari dengan ID Promotor",
    btnFlag: "Tandai Penipuan",
    btnBlock: "Blokir Promotor",
    btnUnblock: "Buka Blokir",
    geoLocation: "Lokasi",
    sessionCode: "Kode Sesi",
    created: "Dibuat Pada"
  },
  zh: {
    admin: "平台管理员",
    exit: "退出",
    dashboardTitle: "平台指挥中心",
    loading: "正在加载管理控制台...",
    totalVolume: "平台营业额",
    totalAgents: "代理数量",
    totalBusinesses: "商户数量",
    tabActive: "最活跃 (Top-10)",
    tabBanned: "封禁名单",
    tabRequests: "验证请求",
    tabAudit: "审计与欺诈",
    status: "状态",
    role: "角色",
    agent: "代理",
    venue: "场所",
    volume: "营业额",
    escrow: "活跃托管",
    action: "操作",
    verified: "已验证",
    unverified: "未验证",
    banned: "已封禁",
    banDuration: "封禁时长",
    banOptionsTitle: "选择封禁时长",
    banOption1d: "1 天",
    banOption1w: "1 周",
    banOption1m: "1 个月",
    banOption1y: "1 年",
    banOptionForever: "永久",
    btnCancel: "取消",
    unban: "解封用户",
    successUpdate: "操作成功完成！",
    promoters: "活跃推广员和代理",
    merchants: "活跃商户",
    emptyActiveAgents: "暂无活跃推广员注册。",
    emptyActiveVenues: "暂无活跃商户注册。",
    emptyBanned: "所有用户状态良好。封禁名单为空。",
    emptyRequests: "验证队列为空。",
    emptySessions: "没有符合搜索条件的会话。",
    searchCode: "按代码搜索",
    searchPromoter: "按推广员ID搜索",
    btnFlag: "标记欺诈",
    btnBlock: "封禁推广员",
    btnUnblock: "解除封禁",
    geoLocation: "位置",
    sessionCode: "会话代码",
    created: "创建时间"
  },
  es: {
    admin: "Administrador de la Plataforma",
    exit: "Cerrar sesión",
    dashboardTitle: "Centro de Comando",
    loading: "Cargando Consola de Admin...",
    totalVolume: "Facturación de la Plataforma",
    totalAgents: "Conteo de Agentes",
    totalBusinesses: "Conteo de Negocios",
    tabActive: "Más Activos (Top-10)",
    tabBanned: "Lista de Baneos",
    tabRequests: "Solicitudes de Verificación",
    tabAudit: "Auditoría y Fraude",
    status: "Estado",
    role: "Rol",
    agent: "Agente",
    venue: "Lugar",
    volume: "Facturación",
    escrow: "Escrow Activo",
    action: "Acciones",
    verified: "VERIFICADO",
    unverified: "NO VERIFICADO",
    banned: "BANEADO",
    banDuration: "Duración del Baneo",
    banOptionsTitle: "Seleccione la Duración",
    banOption1d: "1 Día",
    banOption1w: "1 Semana",
    banOption1m: "1 Mes",
    banOption1y: "1 Año",
    banOptionForever: "Para siempre",
    btnCancel: "Cancelar",
    unban: "Desbanear Usuario",
    successUpdate: "¡Acción completada con éxito!",
    promoters: "Promotores Activos",
    merchants: "Negocios Activos",
    emptyActiveAgents: "No hay promotores registrados.",
    emptyActiveVenues: "No hay negocios registrados.",
    emptyBanned: "La lista de baneos está vacía.",
    emptyRequests: "La cola de verificación está vacía.",
    emptySessions: "No hay sesiones.",
    searchCode: "Buscar por Código",
    searchPromoter: "Buscar por ID",
    btnFlag: "Marcar Fraude",
    btnBlock: "Bloquear Promotor",
    btnUnblock: "Desbloquear",
    geoLocation: "Ubicación",
    sessionCode: "Código de Sesión",
    created: "Creado en"
  },
  de: {
    admin: "Plattform-Administrator",
    exit: "Abmelden",
    dashboardTitle: "Plattform-Kommandozentrale",
    loading: "Lade Admin-Konsole...",
    totalVolume: "Plattform-Umsatz",
    totalAgents: "Anzahl Agenten",
    totalBusinesses: "Anzahl Unternehmen",
    tabActive: "Am aktivsten (Top-10)",
    tabBanned: "Bann-Liste",
    tabRequests: "Verifizierungsanfragen",
    tabAudit: "Audit & Betrug",
    status: "Status",
    role: "Rolle",
    agent: "Agent",
    venue: "Veranstaltungsort",
    volume: "Umsatz",
    escrow: "Aktives Treuhandkonto",
    action: "Aktionen",
    verified: "VERIFIZIERT",
    unverified: "UNVERIFIZIERT",
    banned: "GEBANNT",
    banDuration: "Bann-Dauer",
    banOptionsTitle: "Bann-Dauer auswählen",
    banOption1d: "1 Tag",
    banOption1w: "1 Woche",
    banOption1m: "1 Monat",
    banOption1y: "1 Jahr",
    banOptionForever: "Für immer",
    btnCancel: "Abbrechen",
    unban: "Benutzer entbannen",
    successUpdate: "Aktion erfolgreich abgeschlossen!",
    promoters: "Aktive Promoter",
    merchants: "Aktive Unternehmen",
    emptyActiveAgents: "Noch keine aktiven Promoter.",
    emptyActiveVenues: "Noch keine aktiven Unternehmen.",
    emptyBanned: "Bann-Liste ist leer.",
    emptyRequests: "Verifizierungs-Warteschlange ist leer.",
    emptySessions: "Keine Sitzungen.",
    searchCode: "Nach Code suchen",
    searchPromoter: "Nach Promoter-ID suchen",
    btnFlag: "Betrug markieren",
    btnBlock: "Promoter blockieren",
    btnUnblock: "Entblocken",
    geoLocation: "Standort",
    sessionCode: "Sitzungscode",
    created: "Erstellt am"
  },
  fr: {
    admin: "Administrateur de Plateforme",
    exit: "Se déconnecter",
    dashboardTitle: "Centre de Commande",
    loading: "Chargement de la Console Admin...",
    totalVolume: "Chiffre d'Affaires",
    totalAgents: "Nombre d'Agents",
    totalBusinesses: "Nombre d'Entreprises",
    tabActive: "Les Plus Actifs (Top-10)",
    tabBanned: "Liste des Bannis",
    tabRequests: "Demandes de Vérification",
    tabAudit: "Audit & Fraude",
    status: "Statut",
    role: "Rôle",
    agent: "Agent",
    venue: "Lieu",
    volume: "Chiffre d'Affaires",
    escrow: "Séquestre Actif",
    action: "Actions",
    verified: "VÉRIFIÉ",
    unverified: "NON VÉRIFIÉ",
    banned: "BANNI",
    banDuration: "Durée du Bannissement",
    banOptionsTitle: "Sélectionner la Durée",
    banOption1d: "1 Jour",
    banOption1w: "1 Semaine",
    banOption1m: "1 Mois",
    banOption1y: "1 An",
    banOptionForever: "Pour toujours",
    btnCancel: "Annuler",
    unban: "Débannir",
    successUpdate: "Action terminée avec succès !",
    promoters: "Promoteurs Actifs",
    merchants: "Entreprises Actives",
    emptyActiveAgents: "Aucun promoteur enregistré.",
    emptyActiveVenues: "Aucune entreprise enregistrée.",
    emptyBanned: "La liste est vide.",
    emptyRequests: "La file est vide.",
    emptySessions: "Aucune session.",
    searchCode: "Chercher par Code",
    searchPromoter: "Chercher par ID",
    btnFlag: "Signaler Fraude",
    btnBlock: "Bloquer",
    btnUnblock: "Débloquer",
    geoLocation: "Emplacement",
    sessionCode: "Code de Session",
    created: "Créé à"
  },
  ja: {
    admin: "プラットフォーム管理者",
    exit: "サインアウト",
    dashboardTitle: "プラットフォームコマンドセンター",
    loading: "管理コンソールを読み込み中...",
    totalVolume: "プラットフォーム売上",
    totalAgents: "エージェント数",
    totalBusinesses: "ビジネス数",
    tabActive: "最もアクティブ (トップ10)",
    tabBanned: "アクセス禁止リスト",
    tabRequests: "検証リクエスト",
    tabAudit: "監査と不正",
    status: "ステータス",
    role: "役割",
    agent: "エージェント",
    venue: "会場",
    volume: "売上",
    escrow: "アクティブエスクロー",
    action: "アクション",
    verified: "確認済み",
    unverified: "未確認",
    banned: "禁止",
    banDuration: "禁止期間",
    banOptionsTitle: "禁止期間を選択",
    banOption1d: "1日",
    banOption1w: "1週間",
    banOption1m: "1ヶ月",
    banOption1y: "1年",
    banOptionForever: "永久",
    btnCancel: "キャンセル",
    unban: "禁止解除",
    successUpdate: "アクションが正常に完了しました！",
    promoters: "アクティブプロモーター",
    merchants: "アクティブビジネス",
    emptyActiveAgents: "プロモーターはまだいません。",
    emptyActiveVenues: "ビジネスはまだいません。",
    emptyBanned: "禁止リストは空です。",
    emptyRequests: "検証キューは空です。",
    emptySessions: "セッションはありません。",
    searchCode: "コードで検索",
    searchPromoter: "プロモーターIDで検索",
    btnFlag: "不正を報告",
    btnBlock: "ブロック",
    btnUnblock: "ブロック解除",
    geoLocation: "場所",
    sessionCode: "セッションコード",
    created: "作成日時"
  },
  ar: {
    admin: "مسؤول المنصة",
    exit: "تسجيل الخروج",
    dashboardTitle: "مركز قيادة المنصة",
    loading: "جارٍ تحميل وحدة تحكم المسؤول...",
    totalVolume: "إجمالي حجم التداول",
    totalAgents: "عدد الوكلاء",
    totalBusinesses: "عدد الأعمال",
    tabActive: "الأكثر نشاطا (أفضل 10)",
    tabBanned: "قائمة الحظر",
    tabRequests: "طلبات التحقق",
    tabAudit: "التدقيق والاحتيال",
    status: "الحالة",
    role: "الدور",
    agent: "الوكيل",
    venue: "المكان",
    volume: "حجم التداول",
    escrow: "الضمان النشط",
    action: "إجراءات",
    verified: "تم التحقق",
    unverified: "غير مؤكد",
    banned: "محظور",
    banDuration: "مدة الحظر",
    banOptionsTitle: "اختر مدة الحظر",
    banOption1d: "1 يوم",
    banOption1w: "1 أسبوع",
    banOption1m: "1 شهر",
    banOption1y: "1 سنة",
    banOptionForever: "إلى الأبد",
    btnCancel: "إلغاء",
    unban: "رفع الحظر",
    successUpdate: "تم الإجراء بنجاح!",
    promoters: "المروجون النشطون",
    merchants: "الأعمال النشطة",
    emptyActiveAgents: "لا يوجد مروجون مسجلون.",
    emptyActiveVenues: "لا يوجد أعمال مسجلة.",
    emptyBanned: "قائمة الحظر فارغة.",
    emptyRequests: "طابور التحقق فارغ.",
    emptySessions: "لا توجد جلسات.",
    searchCode: "البحث بالرمز",
    searchPromoter: "البحث بمعرف المروج",
    btnFlag: "الإبلاغ عن احتيال",
    btnBlock: "حظر المروج",
    btnUnblock: "رفع الحظر",
    geoLocation: "الموقع",
    sessionCode: "رمز الجلسة",
    created: "تاريخ الإنشاء"
  },
  pt: {
    admin: "Administrador da Plataforma",
    exit: "Sair",
    dashboardTitle: "Centro de Comando",
    loading: "Carregando Consola...",
    totalVolume: "Faturação",
    totalAgents: "Contagem de Agentes",
    totalBusinesses: "Contagem de Negócios",
    tabActive: "Mais Ativos (Top-10)",
    tabBanned: "Lista de Banidos",
    tabRequests: "Pedidos de Verificação",
    tabAudit: "Auditoria e Fraude",
    status: "Status",
    role: "Função",
    agent: "Agente",
    venue: "Local",
    volume: "Faturação",
    escrow: "Garantia Ativa",
    action: "Ações",
    verified: "VERIFICADO",
    unverified: "NÃO VERIFICADO",
    banned: "BANIDO",
    banDuration: "Duração do Banimento",
    banOptionsTitle: "Selecione a Duração",
    banOption1d: "1 Dia",
    banOption1w: "1 Semana",
    banOption1m: "1 Mês",
    banOption1y: "1 Ano",
    banOptionForever: "Para sempre",
    btnCancel: "Cancelar",
    unban: "Desbanir",
    successUpdate: "Ação concluída com sucesso!",
    promoters: "Promotores Ativos",
    merchants: "Negócios Ativos",
    emptyActiveAgents: "Nenhum promotor.",
    emptyActiveVenues: "Nenhum negócio.",
    emptyBanned: "Lista de banidos está vazia.",
    emptyRequests: "Fila de verificação vazia.",
    emptySessions: "Nenhuma sessão.",
    searchCode: "Pesquisar por Código",
    searchPromoter: "Pesquisar por ID",
    btnFlag: "Sinalizar Fraude",
    btnBlock: "Bloquear",
    btnUnblock: "Desbloquear",
    geoLocation: "Localização",
    sessionCode: "Código da Sessão",
    created: "Criado em"
  },
  hi: {
    admin: "प्लेटफ़ॉर्म व्यवस्थापक",
    exit: "साइन आउट",
    dashboardTitle: "प्लेटफ़ॉर्म कमांड सेंटर",
    loading: "व्यवस्थापक कंसोल लोड हो रहा है...",
    totalVolume: "प्लेटफ़ॉर्म टर्नओवर",
    totalAgents: "एजेंटों की संख्या",
    totalBusinesses: "व्यवसायों की संख्या",
    tabActive: "सबसे सक्रिय (टॉप-10)",
    tabBanned: "प्रतिबंध सूची",
    tabRequests: "सत्यापन अनुरोध",
    tabAudit: "ऑडिट और धोखाधड़ी",
    tabSupport: "समर्थन",
    status: "स्थिति",
    role: "भूमिका",
    agent: "एजेंट",
    venue: "स्थान",
    volume: "टर्नओवर",
    escrow: "सक्रिय एस्क्रो",
    action: "कार्रवाई",
    verified: "सत्यापित",
    unverified: "असत्यापित",
    banned: "प्रतिबंधित",
    banDuration: "प्रतिबंध अवधि",
    banOptionsTitle: "प्रतिबंध अवधि चुनें",
    banOption1d: "1 दिन",
    banOption1w: "1 सप्ताह",
    banOption1m: "1 महीना",
    banOption1y: "1 वर्ष",
    banOptionForever: "हमेशा के लिए",
    btnCancel: "रद्द करें",
    unban: "अनबैन करें",
    successUpdate: "कार्रवाई सफलतापूर्वक पूरी हुई!",
    promoters: "सक्रिय प्रमोटर",
    merchants: "सक्रिय व्यवसाय",
    emptyActiveAgents: "कोई प्रमोटर पंजीकृत नहीं।",
    emptyActiveVenues: "कोई व्यवसाय पंजीकृत नहीं।",
    emptyBanned: "प्रतिबंध सूची खाली है।",
    emptyRequests: "सत्यापन कतार खाली है।",
    emptySessions: "कोई सत्र नहीं।",
    searchCode: "कोड द्वारा खोजें",
    searchPromoter: "प्रमोटर आईडी द्वारा खोजें",
    btnFlag: "धोखाधड़ी चिह्नित करें",
    btnBlock: "ब्लॉक करें",
    btnUnblock: "अनब्लॉक करें",
    geoLocation: "स्थान",
    sessionCode: "सत्र कोड",
    created: "पर बनाया गया"
  }
};

interface EnrichedUser extends UserProfile {
  volume: number;
  escrowAmount: number;
  banDuration: string;
}

interface PendingRequest {
  id: string;
  targetId: string;
  fullName: string;
  email: string;
  role: "partner" | "business";
  dealsCount: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "active" | "banned" | "requests" | "audit" | "support"
  >("active");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [selectedBanUser, setSelectedBanUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banUntil, setBanUntil] = useState("");
  const router = useRouter();

  const [agents, setAgents] = useState<EnrichedUser[]>([]);
  const [restaurants, setRestaurants] = useState<EnrichedUser[]>([]);
  const [bannedUsers, setBannedUsers] = useState<EnrichedUser[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [sessions, setSessions] = useState<ReferralSession[]>([]);
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>([]);
  const [searchSessionCode, setSearchSessionCode] = useState("");
  const [searchPromoterId, setSearchPromoterId] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const lang = user?.language || "en";
  const t = (translations as any)[lang] || translations.en;

  const loadPlatformData = async () => {
    try {
      const allUsers = await authService.getAllUsers();

      const enrichedUsers = await Promise.all(
        allUsers.map(async (u) => {
          const volume = 0; // TODO: Calculate from tourist_payments
          const escrow = 0; // TODO: Calculate from tourist_payments

          const status = u.status || "unverified";
          let banDuration = "";
          if (status === "banned") {
            banDuration = u.banUntil 
              ? new Date(u.banUntil).toLocaleDateString()
              : t.banOptionForever;
          }

          return {
            ...u,
            status,
            volume,
            escrowAmount: Math.max(escrow, 0),
            banDuration,
          };
        }),
      );

      const nonAdminUsers = enrichedUsers.filter(
        (u) => u.role !== "admin",
      ) as EnrichedUser[];

      const activeAgents = nonAdminUsers.filter(
        (u) => u.role === "partner" && u.status !== "banned",
      );
      const activeRestaurants = nonAdminUsers.filter(
        (u) => u.role === "business" && u.status !== "banned",
      );
      const banned = nonAdminUsers.filter((u) => u.status === "banned");

      setAgents(activeAgents.sort((a, b) => b.volume - a.volume));
      setRestaurants(activeRestaurants.sort((a, b) => b.volume - a.volume));
      setBannedUsers(banned);

      const pendingReqs: PendingRequest[] = [];
      nonAdminUsers.forEach((u) => {
        const hasPendingRequest =
          localStorage.getItem(`verification_requested_${u.id}`) === "true";
        if (
          hasPendingRequest &&
          u.status !== "verified" &&
          u.status !== "banned"
        ) {
          pendingReqs.push({
            id: `req-${u.id}`,
            targetId: u.id,
            fullName: u.fullName || "Unnamed",
            email: u.email || "",
            role: u.role as "partner" | "business",
            dealsCount: parseInt(
              localStorage.getItem(`simulated_deals_${u.id}`) || "0",
            ),
          });
        }
      });
      setRequests(pendingReqs);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          const res = await fetch('/api/v1/admin/sessions', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await res.json();
          if (result.success && result.sessions) {
            setSessions(result.sessions);
          }
        }
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      }

      setAllUsersList(allUsers);

      // Load tickets from admin API
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          const res = await fetch('/api/v1/admin/support', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await res.json();
          if (result.tickets) {
            setTickets(result.tickets);
          }
        }
      } catch (err) {
        console.error("Failed to load tickets", err);
      }
    } catch (err) {
      console.error("Error loading platform data:", err);
    }
  };

  useEffect(() => {
    async function checkAdminAndLoad() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== "admin") {
          router.push("/login");
          return;
        }
        
        setUser(currentUser);
        // Force dark theme for admin console as per user preference
        document.documentElement.setAttribute("data-theme", "dark");
        // We can still set activeTheme for other stuff if needed, but the DOM gets dark theme
        
        await loadPlatformData();
        setLoading(false);
      } catch (err) {
        console.error("Error loading admin panel:", err);
        router.push("/login");
      }
    }
    checkAdminAndLoad();
  }, [router]);

  const handleToggleVerification = async (
    id: string,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === "verified" ? "unverified" : "verified";
    await authService.adminUpdateUserProfile(id, { status: newStatus });
    if (newStatus === "verified") {
      localStorage.removeItem(`verification_requested_${id}`);
    }

    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      currentUser.status = newStatus;
    }

    await loadPlatformData();
    showToast(t.successUpdate);
  };

  const handleVerifyFromRequests = async (reqId: string, targetId: string) => {
    await authService.adminUpdateUserProfile(targetId, { status: "verified" });
    localStorage.removeItem(`verification_requested_${targetId}`);

    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === targetId) {
      currentUser.status = "verified";
    }

    await loadPlatformData();
    showToast(t.successUpdate);
  };

  const handleFlagSession = async (sessionId: string, type: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      
      const res = await fetch('/api/v1/admin/audit/flag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: sessionId, type })
      });
      if (!res.ok) throw new Error("Failed to flag");
      
      await loadPlatformData();
      showToast(t.successUpdate);
    } catch (err) {
      console.error("Error flagging session:", err);
    }
  };

  const handleBlockPromoter = async (promoterId: string, block: boolean) => {
    try {
      await authService.blockUser(promoterId, block);
      await loadPlatformData();
      showToast(t.successUpdate);
    } catch (err) {
      console.error("Error blocking promoter:", err);
    }
  };

  const handleInitiateBan = (id: string, name: string) => {
    setSelectedBanUser({ id, name });
    setBanReason("");
    setBanUntil("");
  };

  const handleConfirmBan = async () => {
    if (!selectedBanUser) return;
    try {
      const { id } = selectedBanUser;
  
      await authService.adminUpdateUserProfile(id, {
        status: "banned",
        isBlocked: true,
        banReason: banReason || "Не указана",
        banUntil: banUntil ? new Date(banUntil).toISOString() : null,
      });
      localStorage.removeItem(`verification_requested_${id}`);
  
      const currentUser = await authService.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        currentUser.status = "banned";
        currentUser.banReason = banReason || "Не указана";
        if (banUntil) currentUser.banUntil = new Date(banUntil).toISOString();
      }
  
      setSelectedBanUser(null);
      await loadPlatformData();
      showToast(t.successUpdate);
    } catch (err: any) {
      console.error("Failed to ban user:", err);
      showToast("Ошибка: " + (err.message || "Не удалось заблокировать"));
    }
  };

  const handleUnbanUser = async (id: string) => {
    await authService.adminUpdateUserProfile(id, {
      status: "unverified",
      isBlocked: false,
    });
    localStorage.removeItem(`user_ban_dur_${id}`);

    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      currentUser.status = "unverified";
    }

    await loadPlatformData();
    showToast(t.successUpdate);
  };

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/login");
  };

  const totalVolume =
    agents.reduce((sum, a) => sum + a.volume, 0) +
    restaurants.reduce((sum, r) => sum + r.volume, 0);

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
              border: "3px solid rgba(0, 210, 255, 0.1)",
              borderTop: "3px solid var(--primary)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto",
            }}
          />
          <p
            style={{
              color: "var(--foreground)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "0.95rem",
              letterSpacing: "0.5px",
            }}
          >
            {t?.loading || "Loading Admin Console..."}
          </p>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `,
          }}
        />
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient light removed for performance */}

      {/* Container to restrict max width */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "var(--admin-padding)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <header
          className="glass-header"
          style={{
            display: "flex",
            flexDirection: "var(--header-flex-direction)" as any,
            justifyContent: "space-between",
            alignItems: "var(--header-align-items)" as any,
            marginBottom: "3rem",
            padding: "var(--header-padding)",
            marginLeft: "var(--header-margin-horizontal)",
            marginRight: "var(--header-margin-horizontal)",
            marginTop: "var(--header-margin-top)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            gap: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "var(--admin-title-size)",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                letterSpacing: "-0.8px",
              }}
            >
              {t.dashboardTitle}
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                opacity: 0.5,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                fontWeight: 700,
                color: "var(--primary)",
                marginTop: "6px",
                display: "block",
              }}
            >
              {t.admin}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(244, 63, 94, 0.06)",
              border: "1px solid rgba(244, 63, 94, 0.25)",
              color: "var(--error)",
              padding: "10px 22px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 700,
              transition: "all 0.2s ease",
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              alignSelf: "var(--header-align-self, center)" as any,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(244, 63, 94, 0.12)";
              e.currentTarget.style.borderColor = "var(--error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(244, 63, 94, 0.06)";
              e.currentTarget.style.borderColor = "rgba(244, 63, 94, 0.25)";
            }}
          >
            {t.exit}
          </button>
        </header>

        {/* Notifications toast */}
        {statusMsg && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              left: "24px",
              background: "var(--success)",
              color: "var(--foreground)",
              padding: "14px 28px",
              borderRadius: "14px",
              fontWeight: 700,
              boxShadow: "0 8px 30px rgba(16, 185, 129, 0.3)",
              zIndex: 10000,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {statusMsg}
          </div>
        )}

        {/* Ban Options Modal */}
        {selectedBanUser && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(5, 5, 8, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100000,
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div
              className="glass-panel"
              style={{
                padding: "3rem 2.5rem",
                maxWidth: "440px",
                width: "100%",
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)",
                borderRadius: "24px",
                animation: "scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <h3
                style={{
                  marginBottom: "0.5rem",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--foreground)",
                  letterSpacing: "-0.3px",
                }}
              >
                {t.banOptionsTitle}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.6,
                  marginBottom: "2rem",
                  fontWeight: 500,
                }}
              >
                Restricting access for user:{" "}
                <strong style={{ color: "var(--foreground)" }}>
                  {selectedBanUser.name}
                </strong>
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--foreground)",
                      opacity: 0.8,
                      fontWeight: 500,
                    }}
                  >
                    Дата разблокировки (оставьте пустым для пермабана)
                  </label>
                  <input
                    type="date"
                    value={banUntil}
                    onChange={(e) => setBanUntil(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--surface-border)",
                      color: "var(--foreground)",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      width: "100%",
                      outline: "none",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--foreground)",
                      opacity: 0.8,
                      fontWeight: 500,
                    }}
                  >
                    Причина блокировки
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Фрод с геопозицией"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--surface-border)",
                      color: "var(--foreground)",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      width: "100%",
                      outline: "none",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <button
                  onClick={handleConfirmBan}
                  style={{
                    background: "var(--error)",
                    border: "none",
                    color: "white",
                    padding: "14px 20px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    marginTop: "10px",
                    transition: "transform 0.1s ease, filter 0.1s ease",
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.96)";
                    e.currentTarget.style.filter = "brightness(0.9)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                >
                  Подтвердить бан
                </button>
              </div>

              <button
                onClick={() => setSelectedBanUser(null)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid var(--surface-border)",
                  color: "var(--foreground)",
                  padding: "14px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  transition: "background 0.2s",
                  outline: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {t.btnCancel}
              </button>
            </div>
          </div>
        )}

        {/* 3 Metric Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "3rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Card 1: Platform Volume */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--admin-metric-padding)",
              border: "1px solid var(--glass-border)",
              background: "var(--glass-bg)",
              boxShadow: "var(--card-shadow)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              borderRadius: "20px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.5,
                  display: "block",
                  marginBottom: "0.6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--primary)",
                }}
              >
                {t.totalVolume}
              </span>
              <h2
                style={{
                  fontSize: "var(--admin-metric-value-size)",
                  fontWeight: 800,
                  color: "var(--foreground)",
                  letterSpacing: "-0.5px",
                }}
              >
                {formatCurrency(totalVolume, "USD")}
              </h2>
            </div>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(34, 211, 238, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(34, 211, 238, 0.15)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>

          {/* Card 2: Agents Count */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--admin-metric-padding)",
              border: "1px solid var(--glass-border)",
              background: "var(--glass-bg)",
              boxShadow: "var(--card-shadow)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              borderRadius: "20px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.5,
                  display: "block",
                  marginBottom: "0.6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {t.totalAgents}
              </span>
              <h2
                style={{
                  fontSize: "var(--admin-metric-value-size)",
                  fontWeight: 800,
                  color: "var(--foreground)",
                  letterSpacing: "-0.5px",
                }}
              >
                {agents.length}
              </h2>
            </div>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--surface-border)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.75 }}
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>

          {/* Card 3: Businesses Count */}
          <div
            className="glass-panel"
            style={{
              padding: "var(--admin-metric-padding)",
              border: "1px solid var(--glass-border)",
              background: "var(--glass-bg)",
              boxShadow: "var(--card-shadow)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              borderRadius: "20px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.5,
                  display: "block",
                  marginBottom: "0.6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {t.totalBusinesses}
              </span>
              <h2
                style={{
                  fontSize: "var(--admin-metric-value-size)",
                  fontWeight: 800,
                  color: "var(--foreground)",
                  letterSpacing: "-0.5px",
                }}
              >
                {restaurants.length}
              </h2>
            </div>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--surface-border)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.75 }}
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs Navigation (Segmented Pill Design) */}
        <div
          className="mobile-scroll-x"
          style={{
            display: "var(--tabs-display)" as any,
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--surface-border)",
            borderRadius: "var(--tabs-border-radius)",
            padding: "var(--tabs-padding)",
            marginBottom: "var(--tabs-margin-bottom)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            position: "relative",
            zIndex: 2,
            overflowX: "auto",
          }}
        >
          <button
            onClick={() => setActiveTab("active")}
            style={{
              background:
                activeTab === "active"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "transparent",
              border: "none",
              color:
                activeTab === "active" ? "var(--primary)" : "var(--foreground)",
              padding: "12px 24px",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              transition: "all 0.25s ease",
              opacity: activeTab === "active" ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                activeTab === "active" ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
              outline: "none",
            }}
          >
            {t.tabActive}
          </button>

          <button
            onClick={() => setActiveTab("banned")}
            style={{
              background:
                activeTab === "banned"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "transparent",
              border: "none",
              color:
                activeTab === "banned" ? "var(--error)" : "var(--foreground)",
              padding: "12px 24px",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              transition: "all 0.25s ease",
              opacity: activeTab === "banned" ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                activeTab === "banned" ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
              outline: "none",
            }}
          >
            {t.tabBanned}
            <span
              style={{
                fontSize: "0.75rem",
                background: "rgba(244, 63, 94, 0.12)",
                padding: "2px 8px",
                borderRadius: "20px",
                marginLeft: "4px",
                fontWeight: 800,
              }}
            >
              {bannedUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            style={{
              background:
                activeTab === "requests"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "transparent",
              border: "none",
              color:
                activeTab === "requests"
                  ? "var(--success)"
                  : "var(--foreground)",
              padding: "12px 24px",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              transition: "all 0.25s ease",
              opacity: activeTab === "requests" ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                activeTab === "requests"
                  ? "0 4px 12px rgba(0,0,0,0.1)"
                  : "none",
              outline: "none",
            }}
          >
            {t.tabRequests}
            <span
              style={{
                fontSize: "0.75rem",
                background: "rgba(16, 185, 129, 0.12)",
                padding: "2px 8px",
                borderRadius: "20px",
                marginLeft: "4px",
                fontWeight: 800,
              }}
            >
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            style={{
              background:
                activeTab === "audit"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "transparent",
              border: "none",
              color:
                activeTab === "audit" ? "var(--warning)" : "var(--foreground)",
              padding: "12px 24px",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              transition: "all 0.25s ease",
              opacity: activeTab === "audit" ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                activeTab === "audit" ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
              outline: "none",
            }}
          >
            {t.tabAudit}
            <span
              style={{
                fontSize: "0.75rem",
                background: "rgba(250, 173, 20, 0.12)",
                padding: "2px 8px",
                borderRadius: "20px",
                marginLeft: "4px",
                fontWeight: 800,
              }}
            >
              {sessions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            style={{
              background:
                activeTab === "support"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "transparent",
              border: "none",
              color:
                activeTab === "support" ? "var(--primary)" : "var(--foreground)",
              padding: "12px 24px",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 700,
              transition: "all 0.25s ease",
              opacity: activeTab === "support" ? 1 : 0.6,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                activeTab === "support" ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
              outline: "none",
            }}
          >
            {t.tabSupport || "Support Tickets"}
            <span
              style={{
                fontSize: "0.75rem",
                background: "rgba(139, 92, 246, 0.12)",
                padding: "2px 8px",
                borderRadius: "20px",
                marginLeft: "4px",
                fontWeight: 800,
              }}
            >
              {tickets.filter(t => t.status === "open").length}
            </span>
          </button>
        </div>

        {/* Tab Panels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "3rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* TAB 1: MOST ACTIVE */}
          {activeTab === "active" && (
            <>
              {/* Top Promoters/Agents */}
              <div
                className="glass-panel"
                style={{
                  padding: "2rem 2.2rem",
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-bg)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "1.8rem",
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--foreground)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {t.promoters}
                </h3>
                <div className="table-wrapper">
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--surface-border)",
                          opacity: 0.45,
                          fontSize: "0.75rem",
                          color: "var(--foreground)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        <th style={{ padding: "12px 10px" }}>{t.status}</th>
                        <th>{t.agent}</th>
                        <th>{t.role}</th>
                        <th>{t.volume}</th>
                        <th
                          style={{ textAlign: "right", paddingRight: "20px" }}
                        >
                          {t.action}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.slice(0, 10).map((usr) => (
                        <tr
                          key={usr.id}
                          className="table-row-hover"
                          style={{
                            borderBottom: "1px solid var(--surface-border)",
                            fontSize: "0.9rem",
                            color: "var(--foreground)",
                          }}
                        >
                          <td style={{ padding: "16px 10px" }}>
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                color:
                                  (usr.status || "") === "verified"
                                    ? "var(--success)"
                                    : "var(--error)",
                                background:
                                  (usr.status || "") === "verified"
                                    ? "rgba(82, 196, 26, 0.08)"
                                    : "rgba(255, 77, 79, 0.08)",
                                border: `1px solid ${(usr.status || "") === "verified" ? "rgba(82, 196, 26, 0.3)" : "rgba(255, 77, 79, 0.3)"}`,
                                padding: "4px 10px",
                                borderRadius: "20px",
                                display: "inline-block",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {(usr.status || "") === "verified"
                                ? t.verified
                                : t.unverified}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                fontWeight: 650,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {usr.fullName}
                              {(usr.status || "") === "verified" && (
                                <VerificationBadge size={14} />
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                opacity: 0.45,
                                marginTop: "2px",
                              }}
                            >
                              {usr.email}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                background: "var(--surface)",
                                border: "1px solid var(--surface-border)",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {usr.role}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize: "0.95rem" }}>
                              {formatCurrency(usr.volume, "USD")}
                            </strong>
                          </td>
                          <td
                            style={{ textAlign: "right", paddingRight: "20px" }}
                          >
                            <div
                              style={{ display: "inline-flex", gap: "10px" }}
                            >
                              <button
                                onClick={() =>
                                  handleToggleVerification(
                                    usr.id,
                                    usr.status || "",
                                  )
                                }
                                title={
                                  (usr.status || "") === "verified"
                                    ? "Снять верификацию"
                                    : "Верифицировать"
                                }
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "transparent",
                                  border: "1px solid rgba(82, 196, 26, 0.35)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  filter:
                                    (usr.status || "") === "verified"
                                      ? "drop-shadow(0 0 6px #52c41a)"
                                      : "none",
                                  opacity:
                                    (usr.status || "") === "verified" ? 1 : 0.5,
                                  transition: "all 0.25s ease",
                                  outline: "none",
                                }}
                                className="verify-btn"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#52c41a"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>

                              <button
                                onClick={() =>
                                  handleInitiateBan(
                                    usr.id,
                                    usr.fullName || "Unnamed",
                                  )
                                }
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "transparent",
                                  border: "1px solid rgba(255, 77, 79, 0.35)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  opacity: 0.5,
                                  transition: "all 0.25s ease",
                                  outline: "none",
                                }}
                                className="ban-btn"
                                title="Ban User"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="var(--error)"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {agents.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              padding: "3rem",
                              textAlign: "center",
                              opacity: 0.5,
                            }}
                          >
                            {t.emptyActiveAgents}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Restaurants */}
              <div
                className="glass-panel"
                style={{
                  padding: "2rem 2.2rem",
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-bg)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "1.8rem",
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--foreground)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {t.merchants}
                </h3>
                <div className="table-wrapper">
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--surface-border)",
                          opacity: 0.45,
                          fontSize: "0.75rem",
                          color: "var(--foreground)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        <th style={{ padding: "12px 10px" }}>{t.status}</th>
                        <th>{t.venue}</th>
                        <th>{t.role}</th>
                        <th>{t.volume}</th>
                        <th>{t.escrow}</th>
                        <th
                          style={{ textAlign: "right", paddingRight: "20px" }}
                        >
                          {t.action}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.slice(0, 10).map((usr) => (
                        <tr
                          key={usr.id}
                          className="table-row-hover"
                          style={{
                            borderBottom: "1px solid var(--surface-border)",
                            fontSize: "0.9rem",
                            color: "var(--foreground)",
                          }}
                        >
                          <td style={{ padding: "16px 10px" }}>
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                color:
                                  (usr.status || "") === "verified"
                                    ? "var(--success)"
                                    : "var(--error)",
                                background:
                                  (usr.status || "") === "verified"
                                    ? "rgba(82, 196, 26, 0.08)"
                                    : "rgba(255, 77, 79, 0.08)",
                                border: `1px solid ${(usr.status || "") === "verified" ? "rgba(82, 196, 26, 0.3)" : "rgba(255, 77, 79, 0.3)"}`,
                                padding: "4px 10px",
                                borderRadius: "20px",
                                display: "inline-block",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {(usr.status || "") === "verified"
                                ? t.verified
                                : t.unverified}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                fontWeight: 650,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {usr.fullName}
                              {(usr.status || "") === "verified" && (
                                <VerificationBadge size={14} />
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                opacity: 0.45,
                                marginTop: "2px",
                              }}
                            >
                              {usr.email}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                background: "var(--surface)",
                                border: "1px solid var(--surface-border)",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {usr.role}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize: "0.95rem" }}>
                              {formatCurrency(usr.volume, "USD")}
                            </strong>
                          </td>
                          <td>
                            <span
                              style={{
                                color:
                                  usr.escrowAmount > 0
                                    ? "var(--accent)"
                                    : "inherit",
                                fontWeight: 650,
                              }}
                            >
                              {formatCurrency(usr.escrowAmount, "USD")}
                            </span>
                          </td>
                          <td
                            style={{ textAlign: "right", paddingRight: "20px" }}
                          >
                            <div
                              style={{ display: "inline-flex", gap: "10px" }}
                            >
                              <button
                                onClick={() =>
                                  handleToggleVerification(
                                    usr.id,
                                    usr.status || "",
                                  )
                                }
                                title={
                                  (usr.status || "") === "verified"
                                    ? "Снять верификацию"
                                    : "Верифицировать"
                                }
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "transparent",
                                  border: "1px solid rgba(82, 196, 26, 0.35)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  filter:
                                    (usr.status || "") === "verified"
                                      ? "drop-shadow(0 0 6px #52c41a)"
                                      : "none",
                                  opacity:
                                    (usr.status || "") === "verified" ? 1 : 0.5,
                                  transition: "all 0.25s ease",
                                  outline: "none",
                                }}
                                className="verify-btn"
                                title="Verify Business"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#52c41a"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>

                              <button
                                onClick={() =>
                                  handleInitiateBan(
                                    usr.id,
                                    usr.fullName || "Unnamed",
                                  )
                                }
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "transparent",
                                  border: "1px solid rgba(255, 77, 79, 0.35)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  opacity: 0.5,
                                  transition: "all 0.25s ease",
                                  outline: "none",
                                }}
                                className="ban-btn"
                                title="Ban Business"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="var(--error)"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {restaurants.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              padding: "3rem",
                              textAlign: "center",
                              opacity: 0.5,
                            }}
                          >
                            {t.emptyActiveVenues}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BANNED USERS LIST */}
          {activeTab === "banned" && (
            <div
              className="glass-panel"
              style={{
                padding: "2.5rem 2.2rem",
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  marginBottom: "1.8rem",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--error)",
                  letterSpacing: "-0.3px",
                }}
              >
                {t.tabBanned}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                        opacity: 0.45,
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      <th style={{ padding: "12px 10px" }}>{t.status}</th>
                      <th>User / Venue</th>
                      <th>{t.role}</th>
                      <th>{t.banDuration}</th>
                      <th style={{ textAlign: "right", paddingRight: "20px" }}>
                        {t.action}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedUsers.map((bUser) => (
                      <tr
                        key={bUser.id}
                        className="table-row-hover"
                        style={{
                          borderBottom: "1px solid var(--surface-border)",
                          fontSize: "0.9rem",
                          color: "var(--foreground)",
                        }}
                      >
                        <td style={{ padding: "16px 10px" }}>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              color: "var(--error)",
                              background: "rgba(255, 77, 79, 0.08)",
                              border: "1px solid rgba(255, 77, 79, 0.3)",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              display: "inline-block",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {t.banned}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 650 }}>
                            {bUser.fullName}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              opacity: 0.45,
                              marginTop: "2px",
                            }}
                          >
                            {bUser.email}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "var(--surface)",
                              border: "1px solid var(--surface-border)",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {bUser.role}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{ color: "var(--error)", fontWeight: 600 }}
                          >
                            {bUser.banDuration}
                          </span>
                        </td>
                        <td
                          style={{ textAlign: "right", paddingRight: "20px" }}
                        >
                          <button
                            onClick={() => handleUnbanUser(bUser.id)}
                            style={{
                              background: "rgba(82, 196, 26, 0.06)",
                              border: "1px solid rgba(82, 196, 26, 0.25)",
                              color: "var(--success)",
                              padding: "8px 16px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              transition: "all 0.2s ease",
                              outline: "none",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(82, 196, 26, 0.12)";
                              e.currentTarget.style.borderColor =
                                "var(--success)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(82, 196, 26, 0.06)";
                              e.currentTarget.style.borderColor =
                                "rgba(82, 196, 26, 0.25)";
                            }}
                          >
                            {t.unban}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bannedUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "3rem",
                            textAlign: "center",
                            opacity: 0.5,
                          }}
                        >
                          {t.emptyBanned}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFICATION REQUESTS */}
          {activeTab === "requests" && (
            <div
              className="glass-panel"
              style={{
                padding: "2.5rem 2.2rem",
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  marginBottom: "1.8rem",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--success)",
                  letterSpacing: "-0.3px",
                }}
              >
                {t.tabRequests}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                        opacity: 0.45,
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      <th style={{ padding: "12px 10px" }}>{t.status}</th>
                      <th>User / Venue</th>
                      <th>{t.role}</th>
                      <th>Completed Deals</th>
                      <th style={{ textAlign: "right", paddingRight: "20px" }}>
                        {t.action}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className="table-row-hover"
                        style={{
                          borderBottom: "1px solid var(--surface-border)",
                          fontSize: "0.9rem",
                          color: "var(--foreground)",
                        }}
                      >
                        <td style={{ padding: "16px 10px" }}>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              color: "var(--warning)",
                              background: "rgba(250, 173, 20, 0.08)",
                              border: "1px solid rgba(250, 173, 20, 0.3)",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              display: "inline-block",
                              letterSpacing: "0.5px",
                            }}
                          >
                            PENDING
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 650 }}>{req.fullName}</div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              opacity: 0.45,
                              marginTop: "2px",
                            }}
                          >
                            {req.email}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "var(--surface)",
                              border: "1px solid var(--surface-border)",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {req.role}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              color: "var(--success)",
                              fontWeight: 750,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.95rem",
                            }}
                          >
                            {req.dealsCount} deals
                          </span>
                        </td>
                        <td
                          style={{ textAlign: "right", paddingRight: "20px" }}
                        >
                          <div style={{ display: "inline-flex", gap: "10px" }}>
                            <button
                              onClick={() =>
                                handleVerifyFromRequests(req.id, req.targetId)
                              }
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "transparent",
                                border: "1px solid rgba(82, 196, 26, 0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                opacity: 0.7,
                                transition: "all 0.25s ease",
                                outline: "none",
                              }}
                              className="verify-btn"
                              title="Approve Request & Verify"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#52c41a"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>

                            <button
                              onClick={() =>
                                handleInitiateBan(req.targetId, req.fullName)
                              }
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "transparent",
                                border: "1px solid rgba(255, 77, 79, 0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                opacity: 0.7,
                                transition: "all 0.25s ease",
                                outline: "none",
                              }}
                              className="ban-btn"
                              title="Reject & Ban"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--error)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "3rem",
                            textAlign: "center",
                            opacity: 0.5,
                          }}
                        >
                          {t.emptyRequests}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT & FRAUD DASHBOARD */}
          {activeTab === "audit" && (
            <div
              className="glass-panel"
              style={{
                padding: "2.5rem 2.2rem",
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  marginBottom: "1.8rem",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--warning)",
                  letterSpacing: "-0.3px",
                }}
              >
                {t.tabAudit}
              </h3>

              {isScanning ? (
                <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                  <div style={{ marginBottom: "1rem" }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => setIsScanning(false)}
                      style={{ background: "var(--surface-border)", color: "var(--foreground)" }}
                    >
                      Отменить сканирование
                    </button>
                  </div>
                  <QRScanner 
                    onScanSuccess={(decodedText) => {
                      let id = decodedText;
                      if (decodedText.includes('/p/')) {
                        id = decodedText.split('/p/')[1]?.split('?')[0] || decodedText;
                      } else if (decodedText.includes('/pay/')) {
                        id = decodedText.split('/pay/')[1]?.split('?')[0] || decodedText;
                      }
                      setSearchSessionCode(id);
                      setIsScanning(false);
                      showToast("QR код распознан!");
                    }} 
                  />
                </div>
              ) : (
                <div style={{ marginBottom: "2rem" }}>
                   <button 
                    className="btn-primary" 
                    onClick={() => setIsScanning(true)}
                    style={{ width: "100%", padding: "16px", fontSize: "1.1rem" }}
                  >
                    📸 Сканировать QR-код Сделки
                  </button>
                </div>
              )}


              {/* Filters Row */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder={t.searchCode}
                  value={searchSessionCode}
                  onChange={(e) => setSearchSessionCode(e.target.value)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--foreground)",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    outline: "none",
                    fontSize: "0.9rem",
                    minWidth: "200px",
                    flex: 1,
                  }}
                />
                <input
                  type="text"
                  placeholder={t.searchPromoter}
                  value={searchPromoterId}
                  onChange={(e) => setSearchPromoterId(e.target.value)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--foreground)",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    outline: "none",
                    fontSize: "0.9rem",
                    minWidth: "200px",
                    flex: 1,
                  }}
                />
              </div>

              {/* Sessions Table */}
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                        opacity: 0.45,
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      <th style={{ padding: "12px 10px" }}>{t.status}</th>
                      <th>Type & Info</th>
                      <th>Promoter / Agent ID</th>
                      <th>Details</th>
                      <th>{t.created}</th>
                      <th style={{ textAlign: "right", paddingRight: "20px" }}>
                        {t.action}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions
                      .filter((s: any) => {
                        const searchLower = searchSessionCode.toLowerCase();
                        const matchCode =
                          !searchSessionCode ||
                          s.id.toLowerCase().includes(searchLower) ||
                          (s.businessId && s.businessId.toLowerCase().includes(searchLower));
                        const matchPromoter =
                          !searchPromoterId ||
                          s.agentId
                            .toLowerCase()
                            .includes(searchPromoterId.toLowerCase());
                        return matchCode && matchPromoter;
                      })
                      .map((session: any) => {
                        const promoter = allUsersList.find(
                          (u) => u.id === session.agentId,
                        );
                        const isPromoterBlocked = promoter?.isBlocked === true;

                        return (
                          <tr
                            key={session.id}
                            className="table-row-hover"
                            style={{
                              borderBottom: "1px solid var(--surface-border)",
                              fontSize: "0.9rem",
                              color: "var(--foreground)",
                            }}
                          >
                            <td style={{ padding: "16px 10px" }}>
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: 800,
                                  color:
                                    session.status === "success" || session.status === "active"
                                      ? "var(--success)"
                                      : session.status === "flagged"
                                        ? "var(--error)"
                                        : "var(--foreground)",
                                  background:
                                    session.status === "success" || session.status === "active"
                                      ? "rgba(82, 196, 26, 0.08)"
                                      : session.status === "flagged"
                                        ? "rgba(255, 77, 79, 0.08)"
                                        : "rgba(255, 255, 255, 0.05)",
                                  border: `1px solid ${
                                    session.status === "success" || session.status === "active"
                                      ? "rgba(82, 196, 26, 0.3)"
                                      : session.status === "flagged"
                                        ? "rgba(255, 77, 79, 0.3)"
                                        : "rgba(255, 255, 255, 0.15)"
                                  }`,
                                  padding: "4px 10px",
                                  borderRadius: "20px",
                                  display: "inline-block",
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {session.status}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: session.type === 'link' ? "var(--primary)" : "var(--success)",
                                }}
                              >
                                {session.type.toUpperCase()}
                              </div>
                              <div
                                style={{ 
                                  fontSize: "0.75rem", 
                                  opacity: 0.45, 
                                  maxWidth: "140px", 
                                  overflow: "hidden", 
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontFamily: "monospace"
                                }}
                                title={session.originalId}
                              >
                                {session.originalId}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {promoter?.fullName || "Unknown Promoter"}
                              </div>
                              <div
                                style={{ 
                                  fontSize: "0.75rem", 
                                  opacity: 0.45,
                                  maxWidth: "140px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontFamily: "monospace"
                                }}
                                title={session.agentId}
                              >
                                ID: {session.agentId}
                              </div>
                              {isPromoterBlocked && (
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "var(--error)",
                                    background: "rgba(255, 77, 79, 0.1)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    marginTop: "4px",
                                    display: "inline-block",
                                    fontWeight: 700,
                                  }}
                                >
                                  BLOCKED
                                </span>
                              )}
                            </td>
                            <td>
                              {session.type === 'payment' ? (
                                <div>
                                  <div style={{ fontWeight: 600, color: "var(--foreground)" }}>
                                    {formatCurrency(session.amount, 'IDR')}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      opacity: 0.5,
                                    }}
                                  >
                                    Agent: {formatCurrency(session.agentCommission, 'IDR')}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                    {session.isSingleUse ? 'Single-Use Link' : 'Reusable Link'}
                                  </div>
                                  <div style={{ 
                                    fontSize: "0.75rem", 
                                    opacity: 0.5,
                                    fontFamily: "monospace" 
                                  }}>
                                    Bus.ID: {session.businessId.substring(0, 8)}...
                                  </div>
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: "0.85rem" }}>
                                {new Date(
                                  session.createdAt,
                                ).toLocaleDateString()}
                              </div>
                              <div
                                style={{ fontSize: "0.75rem", opacity: 0.45 }}
                              >
                                {new Date(
                                  session.createdAt,
                                ).toLocaleTimeString()}
                              </div>
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                paddingRight: "20px",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-flex",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handleBlockPromoter(
                                      session.agentId,
                                      !isPromoterBlocked,
                                    )
                                  }
                                  style={{
                                    background: isPromoterBlocked
                                      ? "rgba(82, 196, 26, 0.1)"
                                      : "rgba(255, 77, 79, 0.1)",
                                    border: `1px solid ${isPromoterBlocked ? "rgba(82, 196, 26, 0.3)" : "rgba(255, 77, 79, 0.3)"}`,
                                    color: isPromoterBlocked
                                      ? "var(--success)"
                                      : "var(--error)",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      isPromoterBlocked
                                        ? "rgba(82, 196, 26, 0.2)"
                                        : "rgba(255, 77, 79, 0.2)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      isPromoterBlocked
                                        ? "rgba(82, 196, 26, 0.1)"
                                        : "rgba(255, 77, 79, 0.1)";
                                  }}
                                >
                                  {isPromoterBlocked
                                    ? t.btnUnblock
                                    : t.btnBlock}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {sessions.filter((s) => {
                      const matchCode =
                        !searchSessionCode ||
                        s.shortCode
                          .toLowerCase()
                          .includes(searchSessionCode.toLowerCase()) ||
                        s.id
                          .toLowerCase()
                          .includes(searchSessionCode.toLowerCase());
                      const matchPromoter =
                        !searchPromoterId ||
                        s.partnerId
                          .toLowerCase()
                          .includes(searchPromoterId.toLowerCase());
                      return matchCode && matchPromoter;
                    }).length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: "3rem",
                            textAlign: "center",
                            opacity: 0.5,
                          }}
                        >
                          {t.emptySessions}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT TICKETS */}
          {activeTab === "support" && (
            <div
              className="glass-panel"
              style={{
                padding: "2rem 2.2rem",
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
              }}
            >
              <h3
                style={{
                  marginBottom: "1.8rem",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "var(--foreground)",
                  letterSpacing: "-0.3px",
                }}
              >
                {t.tabSupport || "Support Tickets"}
              </h3>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th style={{ textAlign: "right", paddingRight: "20px" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length > 0 ? (
                      tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <div style={{ fontSize: "0.85rem", opacity: 0.7, wordBreak: "break-all", maxWidth: "150px" }}>
                              {ticket.userId}
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: "300px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                              {ticket.message}
                              {ticket.reply && (
                                <div style={{ marginTop: "8px", padding: "8px", background: "rgba(16, 185, 129, 0.1)", borderLeft: "2px solid var(--success)", borderRadius: "4px", fontSize: "0.85rem" }}>
                                  <strong>Ответ:</strong><br/>
                                  {ticket.reply}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                background: ticket.status === "open" ? "rgba(250, 173, 20, 0.1)" : "rgba(16, 185, 129, 0.1)",
                                color: ticket.status === "open" ? "var(--warning)" : "var(--success)",
                              }}
                            >
                              {ticket.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.85rem" }}>
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: "0.75rem", opacity: 0.45 }}>
                              {new Date(ticket.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td style={{ textAlign: "right", paddingRight: "20px" }}>
                            {ticket.status === "open" && (
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button
                                  onClick={async () => {
                                    const replyText = window.prompt("Введите ответ пользователю:");
                                    if (!replyText) return;
                                    try {
                                      const { data: sessionData } = await supabase.auth.getSession();
                                      const token = sessionData.session?.access_token;
                                      await fetch("/api/v1/admin/support", {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          "Authorization": `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ ticketId: ticket.id, reply: replyText })
                                      });
                                      await loadPlatformData();
                                      showToast(t.successUpdate || "Action completed successfully!");
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  style={{
                                    background: "rgba(66, 153, 225, 0.1)",
                                    border: "1px solid rgba(66, 153, 225, 0.3)",
                                    color: "#4299e1",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  Reply
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const { ticketRepository } = await import("@/lib/services");
                                      await ticketRepository.updateTicketStatus(ticket.id, "closed");
                                      await loadPlatformData();
                                      showToast(t.successUpdate || "Action completed successfully!");
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  style={{
                                    background: "rgba(16, 185, 129, 0.1)",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    color: "var(--success)",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  Mark Resolved
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "3rem",
                            textAlign: "center",
                            opacity: 0.5,
                          }}
                        >
                          No tickets found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .table-row-hover {
          transition: background-color 0.2s ease;
        }
        .table-row-hover:hover {
          background-color: rgba(255, 255, 255, 0.015) !important;
        }
        .verify-btn:hover {
          background: rgba(82, 196, 26, 0.08) !important;
          border-color: var(--success) !important;
          opacity: 1 !important;
          box-shadow: 0 0 10px rgba(82, 196, 26, 0.4);
          transform: scale(1.05);
        }
        .ban-btn:hover {
          background: rgba(255, 77, 79, 0.08) !important;
          border-color: var(--error) !important;
          opacity: 1 !important;
          box-shadow: 0 0 10px rgba(255, 77, 79, 0.4);
          transform: scale(1.05);
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `,
        }}
      />
    </div>
  );
}
