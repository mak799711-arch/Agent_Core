'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { Offer } from '@/lib/interfaces/offers';
import { ReferralSession } from '@/lib/interfaces/referrals';
import { formatCurrency } from '@/lib/utils/currency';
import VerificationBadge from '@/app/components/VerificationBadge';

const translations = {
  en: {
    promoter: 'Local Promoter',
    exit: 'Exit',
    settings: 'Settings ⚙️',
    totalEarnedLabel: 'Total Earnings (All Time)',
    getStartedBtn: 'Get Started 🚀',
    locRequesting: 'Requesting your location...',
    locError: 'Location access denied or unavailable. Using default Bali center.',
    activeCodes: 'Active Referral Codes',
    waiting: 'Waiting for scan',
    offersTitle: 'Nearest Offers',
    mapHint: '📍 Live Bali Map (Canggu/Seminyak)',
    mapPending: 'Mapbox Integration Pending Token Setup',
    rewardLabel: 'Reward',
    generateBtn: 'Generate Referral Code',
    modalTitle: 'Referral Active',
    modalHint: 'Show this code or QR to the venue manager to confirm attribution.',
    shortCodeLabel: 'SHORT CODE',
    done: 'Done',
    loading: 'Loading Partner Portal...',
    categories: {
      all: 'All 🌍',
      restaurant: 'Eat 🍕',
      nightlife: 'Party 🍸',
      villa: 'Stay 🏡',
      activity: 'Surf 🏄'
    },
    searchPlaceholder: 'Search venue or reward...'
  },
  ru: {
    promoter: 'Локальный промоутер',
    exit: 'Выйти',
    settings: 'Настройки ⚙️',
    totalEarnedLabel: 'Всего заработано (за всё время)',
    getStartedBtn: 'Начать поиск 🚀',
    locRequesting: 'Запрос вашей геолокации...',
    locError: 'Доступ к геопозиции отклонен. Используем центр Бали по умолчанию.',
    activeCodes: 'Активные реферальные коды',
    waiting: 'Ожидает сканирования',
    offersTitle: 'Ближайшие предложения',
    mapHint: '📍 Карта Бали (Чангу/Семиньяк)',
    mapPending: 'Ожидает настройки токена Mapbox',
    rewardLabel: 'Награда',
    generateBtn: 'Создать реферальный код',
    modalTitle: 'Реферал активирован',
    modalHint: 'Покажите этот код или QR-код менеджеру заведения для подтверждения.',
    shortCodeLabel: 'КОРОТКИЙ КОД',
    done: 'Готово',
    loading: 'Загрузка портала партнера...',
    categories: {
      all: 'Все 🌍',
      restaurant: 'Еда 🍕',
      nightlife: 'Клубы 🍸',
      villa: 'Виллы 🏡',
      activity: 'Сёрфинг 🏄'
    },
    searchPlaceholder: 'Поиск заведений и наград...'
  },
  id: {
    promoter: 'Promotor Lokal',
    exit: 'Keluar',
    settings: 'Pengaturan ⚙️',
    totalEarnedLabel: 'Total Pendapatan (Semua Waktu)',
    getStartedBtn: 'Mulai Pencarian 🚀',
    locRequesting: 'Meminta lokasi Anda...',
    locError: 'Akses lokasi ditolak. Menggunakan pusat Bali default.',
    activeCodes: 'Kode Rujukan Aktif',
    waiting: 'Menunggu pemindaian',
    offersTitle: 'Penawaran Aktif di Bali',
    mapHint: '📍 Peta Bali Live (Canggu/Seminyak)',
    mapPending: 'Integrasi Mapbox Menunggu Pengaturan Token',
    rewardLabel: 'Hadiah',
    generateBtn: 'Buat Kode Rujukan',
    modalTitle: 'Rujukan Aktif',
    modalHint: 'Tunjukkan kode atau QR ini kepada manajer tempat untuk mengonfirmasi atribusi.',
    shortCodeLabel: 'KODE PENDEK',
    done: 'Selesai',
    loading: 'Memuat Portal Mitra...',
    categories: {
      all: 'Semua 🌍',
      restaurant: 'Makan 🍕',
      nightlife: 'Pesta 🍸',
      villa: 'Tinggal 🏡',
      activity: 'Selancar 🏄'
    },
    searchPlaceholder: 'Cari tempat atau hadiah...'
  },
  zh: {
    promoter: '本地推广员',
    exit: '退出',
    settings: '设置 ⚙️',
    totalEarnedLabel: '总收益 (累计)',
    getStartedBtn: '开始寻找 🚀',
    locRequesting: '正在获取定位...',
    locError: '无法获取定位，使用默认巴厘岛中心。',
    activeCodes: '活跃推荐码',
    waiting: '等待扫描',
    offersTitle: '巴厘岛活跃优惠',
    mapHint: '📍 巴厘岛实时地图',
    mapPending: '等待配置 Mapbox Token',
    rewardLabel: '奖励',
    generateBtn: '生成推荐码',
    modalTitle: '推荐已激活',
    modalHint: '向商户经理展示此条码或二维码以确认。',
    shortCodeLabel: '短码',
    done: '完成',
    loading: '正在加载推广员门户...',
    categories: {
      all: '全部 🌍',
      restaurant: '美食 🍕',
      nightlife: '派对 🍸',
      villa: '住宿 🏡',
      activity: '冲浪 🏄'
    },
    searchPlaceholder: '搜索商户或奖励...'
  },
  es: {
    promoter: 'Promotor Local',
    exit: 'Salir',
    settings: 'Ajustes ⚙️',
    totalEarnedLabel: 'Ganancias Totales',
    getStartedBtn: 'Comenzar 🚀',
    locRequesting: 'Buscando ubicación...',
    locError: 'Acceso a ubicación denegado. Usando Bali por defecto.',
    activeCodes: 'Códigos de Referidos Activos',
    waiting: 'Esperando escaneo',
    offersTitle: 'Ofertas Activas en Bali',
    mapHint: '📍 Mapa de Bali en Vivo',
    mapPending: 'Integración Mapbox Pendiente',
    rewardLabel: 'Recompensa',
    generateBtn: 'Generar Código',
    modalTitle: 'Referido Activo',
    modalHint: 'Muestre este código al gerente del lugar para confirmar.',
    shortCodeLabel: 'CÓDIGO CORTO',
    done: 'Hecho',
    loading: 'Cargando Portal de Socios...',
    categories: {
      all: 'Todo 🌍',
      restaurant: 'Comida 🍕',
      nightlife: 'Fiesta 🍸',
      villa: 'Villas 🏡',
      activity: 'Surf 🏄'
    },
    searchPlaceholder: 'Buscar lugar o recompensa...'
  },
  de: {
    promoter: 'Lokaler Promoter',
    exit: 'Beenden',
    settings: 'Einstellungen ⚙️',
    totalEarnedLabel: 'Gesamtverdienst',
    getStartedBtn: 'Starten 🚀',
    locRequesting: 'Standort wird abgefragt...',
    locError: 'Standortzugriff verweigert. Nutze Bali Standard.',
    activeCodes: 'Aktive Empfehlungscodes',
    waiting: 'Warten auf Scan',
    offersTitle: 'Aktive Angebote in Bali',
    mapHint: '📍 Live-Karte Bali',
    mapPending: 'Mapbox-Token ausstehend',
    rewardLabel: 'Belohnung',
    generateBtn: 'Empfehlungscode generieren',
    modalTitle: 'Empfehlung Aktiv',
    modalHint: 'Zeigen Sie dem Manager diesen Code, um zu bestätigen.',
    shortCodeLabel: 'KURZCODE',
    done: 'Fertig',
    loading: 'Partnerportal wird geladen...',
    categories: {
      all: 'Alle 🌍',
      restaurant: 'Essen 🍕',
      nightlife: 'Party 🍸',
      villa: 'Villen 🏡',
      activity: 'Surfen 🏄'
    },
    searchPlaceholder: 'Suche Ort oder Belohnung...'
  },
  fr: {
    promoter: 'Promoteur Local',
    exit: 'Quitter',
    settings: 'Paramètres ⚙️',
    totalEarnedLabel: 'Gains Totaux',
    getStartedBtn: 'Commencer 🚀',
    locRequesting: 'Recherche de localisation...',
    locError: 'Accès localisation refusé. Bali par défaut.',
    activeCodes: 'Codes de Parrainage Actifs',
    waiting: 'En attente de scan',
    offersTitle: 'Offres Actives à Bali',
    mapHint: '📍 Carte de Bali en Direct',
    mapPending: 'Intégration Mapbox en Attente',
    rewardLabel: 'Récompense',
    generateBtn: 'Générer un Code',
    modalTitle: 'Parrainage Actif',
    modalHint: 'Présentez ce code au responsable pour valider.',
    shortCodeLabel: 'CODE COURT',
    done: 'Terminé',
    loading: 'Chargement du Portail Partenaire...',
    categories: {
      all: 'Tout 🌍',
      restaurant: 'Manger 🍕',
      nightlife: 'Fête 🍸',
      villa: 'Villas 🏡',
      activity: 'Surf 🏄'
    },
    searchPlaceholder: 'Rechercher un lieu ou récompense...'
  }
};

// Захардкоженные координаты бизнесов на Бали для имитации маркеров
const MOCK_BUSINESS_LOCATIONS = [
  { id: 'offer-1', name: 'La Brisa Promo', lat: -8.6534, lng: 115.1305, category: 'restaurant' },
  { id: 'offer-2', name: 'Potato Head VIP Entry', lat: -8.6811, lng: 115.1508, category: 'nightlife' },
  { id: 'offer-3', name: 'Savaya Table Booking', lat: -8.8472, lng: 115.1583, category: 'nightlife' },
  { id: 'offer-4', name: 'Canggu Villa Booking', lat: -8.6500, lng: 115.1350, category: 'villa' },
  { id: 'offer-5', name: 'Surf Lessons Canggu', lat: -8.6590, lng: 115.1290, category: 'activity' }
];

export default function PartnerDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeSessions, setActiveSessions] = useState<ReferralSession[]>([]);
  
  // New States
  const [isStarted, setIsStarted] = useState(false);
  const [needsCityInput, setNeedsCityInput] = useState(false);
  const [cityName, setCityName] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [generatedSession, setGeneratedSession] = useState<ReferralSession | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const lang = user?.language || 'en';
  const t = translations[lang];

  useEffect(() => {
    async function loadData() {
      try {
        let currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'partner') {
          await authService.signIn('partner@agent.core', 'password123');
          currentUser = await authService.getCurrentUser();
        }

        if (currentUser) {
          setUser(currentUser);

          const activeTheme = localStorage.getItem('theme') || currentUser.theme;
          document.documentElement.setAttribute('data-theme', activeTheme);

          // Считаем общую сумму заработанных денег (Total Earnings) вместо текущего кошелька
          const txs = await walletRepository.getTransactions(currentUser.id);
          const earned = txs
            .filter(tx => tx.type === 'reward' && tx.status === 'completed')
            .reduce((sum, tx) => sum + tx.amount, 0);
          
          // Для нового аккаунта баланс начинается с 0
          setTotalEarnings(earned);

          const activeOffers = await offerRepository.getOffers({ onlyActive: true });
          setOffers(activeOffers);

          const sessions = await referralRepository.getActiveSessionsForPartner(currentUser.id);
          setActiveSessions(sessions);
        }
      } catch (err) {
        console.error('Error loading partner dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check if user already saw the intro screen
    const hasRequested = localStorage.getItem('hasRequestedLocation');
    if (hasRequested === 'true') {
      setIsStarted(true);
      // Silently request location for the map
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            const savedCity = localStorage.getItem('userCity');
            if (savedCity) setCityName(savedCity);
            else setNeedsCityInput(true);
          }
        );
      } else {
        const savedCity = localStorage.getItem('userCity');
        if (savedCity) setCityName(savedCity);
        else setNeedsCityInput(true);
      }
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('hasRequestedLocation', 'true');
    setLocationStatus(t.locRequesting);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus(null);
          setIsStarted(true);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setNeedsCityInput(true);
          setLocationStatus(null);
          setIsStarted(true);
        }
      );
    } else {
      setNeedsCityInput(true);
      setIsStarted(true);
    }
  };

  const handleCreateSession = async (offer: Offer) => {
    if (!user) return;
    try {
      const bizBalance = await walletRepository.getBalance(offer.businessId);
      if (bizBalance < offer.rewardAmount) {
        alert(lang === 'ru' ? 'У заведения недостаточно средств на балансе. Код не может быть создан.' : 'This venue has insufficient reserve funds. Cannot generate code.');
        return;
      }

      const session = await referralRepository.createSession(user.id, offer.id, offer.businessId);
      
      // Freeze the reward amount in escrow immediately
      await walletRepository.createTransaction({
        userId: offer.businessId,
        amount: offer.rewardAmount,
        type: 'escrow_hold',
        sessionId: session.id,
        status: 'completed'
      });

      setGeneratedSession(session);
      
      const sessions = await referralRepository.getActiveSessionsForPartner(user.id);
      setActiveSessions(sessions);
    } catch {
      alert('Failed to generate referral session');
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/login');
  };

  // Фильтрация офферов по категории и поисковому запросу
  const filteredOffers = offers.filter(offer => {
    const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
    const bizLocation = MOCK_BUSINESS_LOCATIONS.find(loc => loc.id === offer.id);
    const bizName = bizLocation ? bizLocation.name : '';
    
    const matchesQuery = 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.conditions || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      bizName.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesQuery;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', padding: 'var(--layout-padding)', paddingBottom: '6rem' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
          .skeleton { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; background: rgba(255,255,255,0.05); }
        `}} />
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', marginTop: 'var(--header-margin-top)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <div className="skeleton" style={{ width: '46px', height: '46px', borderRadius: '50%' }}></div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ width: '120px', height: '14px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '80px', height: '10px', borderRadius: '4px' }}></div>
             </div>
          </div>
          <div className="skeleton" style={{ width: '150px', height: '40px', borderRadius: '10px' }}></div>
        </div>
        
        {/* Map Skeleton */}
        <div className="skeleton" style={{ width: '100%', height: '280px', marginBottom: '1.5rem', borderRadius: '20px' }}></div>
        
        {/* Filters Skeleton */}
        <div style={{ display: 'flex', gap: '0.6rem', overflow: 'hidden', marginBottom: '2rem' }}>
           <div className="skeleton" style={{ width: '80px', height: '36px', borderRadius: '30px' }}></div>
           <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: '30px' }}></div>
           <div className="skeleton" style={{ width: '90px', height: '36px', borderRadius: '30px' }}></div>
        </div>
        
        {/* Offers Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <div className="skeleton" style={{ width: '100%', height: '90px', borderRadius: '16px' }}></div>
           <div className="skeleton" style={{ width: '100%', height: '90px', borderRadius: '16px' }}></div>
           <div className="skeleton" style={{ width: '100%', height: '90px', borderRadius: '16px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      color: 'var(--foreground)',
      padding: 'var(--layout-padding)',
      paddingBottom: '6rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background light */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'var(--ambient-glow)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        top: '0%',
        right: '10%',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header className="glass-header" style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        padding: 'var(--header-padding)',
        marginLeft: 'var(--header-margin-horizontal)',
        marginRight: 'var(--header-margin-horizontal)',
        marginTop: 'var(--header-margin-top)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '1rem',
        cursor: 'pointer'
      }} onClick={() => router.push('/partner/settings')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            alt="Avatar"
            style={{ width: '46px', height: '46px', borderRadius: '50%', border: '2.5px solid var(--primary)', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {user?.fullName}
              {user?.status === 'verified' && <VerificationBadge size={14} />}
            </h4>
            <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--primary)' }}>{t.promoter}</span>
          </div>
        </div>
        <div>
           {/* Кнопка перехода в настройки визуально, чтобы пользователь понимал */}
           <button style={{
             background: 'rgba(255, 255, 255, 0.05)',
             border: 'none',
             width: '36px', height: '36px',
             borderRadius: '50%',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             color: 'var(--foreground)'
           }}>⚙️</button>
        </div>
      </header>

      {/* Get Started Section or Interactive map */}
      {!isStarted ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          gap: '1.5rem'
        }} className="glass-panel">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Find Venue Offers Around You</h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.6, maxWidth: '400px' }}>
            We need your location permission to show you the closest bars, restaurants, and villas with active promoter rewards in Bali.
          </p>
          
          <button onClick={handleGetStarted} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>
            {t.getStartedBtn}
          </button>
          
          {locationStatus && (
            <p style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{locationStatus}</p>
          )}
        </div>
      ) : needsCityInput ? (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Enter Your City</h2>
          <p style={{ opacity: 0.7 }}>Since location access is unavailable, please enter your city manually to find relevant offers.</p>
          <input 
            type="text" 
            placeholder="e.g. Moscow, New York" 
            value={cityName} 
            onChange={(e) => setCityName(e.target.value)}
            style={{ width: '100%', maxWidth: '300px', padding: '12px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--foreground)', fontSize: '1rem', outline: 'none' }}
          />
          <button 
            className="btn-primary" 
            onClick={() => {
              if(cityName.trim().length > 1) {
                localStorage.setItem('userCity', cityName.trim());
                setNeedsCityInput(false);
              }
            }}
            style={{ padding: '12px 24px', fontSize: '1rem' }}
          >
            Confirm City
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Search Engine Input */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                paddingLeft: '44px',
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: '14px',
                color: 'var(--foreground)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="var(--foreground)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.4,
                pointerEvents: 'none'
              }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          {/* Category Filter - Dropdown list */}
          <div style={{ width: '100%' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: '14px',
                color: 'var(--foreground)',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              {(['all', 'restaurant', 'nightlife', 'villa', 'activity'] as const).map(cat => (
                <option key={cat} value={cat} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                  {t.categories[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Mock Map showing only selected category pins */}
          <div className="glass-panel" style={{
            height: '280px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'radial-gradient(var(--surface-border) 1px, transparent 0)',
            backgroundSize: '16px 16px',
            backgroundColor: 'rgba(0,0,0,0.2)'
          }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--primary)' }}>
              {t.mapHint}
            </div>

            {/* Render Mock Geolocation marker */}
            {userLocation && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                background: '#52c41a',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 0 12px #52c41a',
                zIndex: 10
              }}>
                <span style={{ fontSize: '0.55rem', color: 'white', position: 'absolute', top: '-15px', left: '-10px', background: 'rgba(0,0,0,0.8)', padding: '1px 4px', borderRadius: '2px' }}>YOU</span>
              </div>
            )}

            {/* Render Category Pins */}
            {MOCK_BUSINESS_LOCATIONS
              .filter(loc => filteredOffers.some(o => o.id === loc.id))
              .map((loc) => {
                // Вычисляем смещение от центра (50%) для визуального отображения вокруг "Тебя"
                const topOffset = 50 + (loc.lat - (-8.6534)) * 3000;
                const leftOffset = 50 + (loc.lng - (115.1305)) * 3000;
                
                const pinColor = loc.category === 'restaurant' ? '#ff9f43' : 
                                 loc.category === 'nightlife' ? 'var(--accent)' :
                                 loc.category === 'villa' ? 'var(--primary)' : '#10ac84';

                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      const foundOffer = offers.find(o => o.id === loc.id);
                      if (foundOffer) setSelectedOffer(foundOffer);
                    }}
                    style={{
                      position: 'absolute',
                      top: `${Math.min(Math.max(topOffset, 15), 85)}%`,
                      left: `${Math.min(Math.max(leftOffset, 15), 85)}%`,
                      background: pinColor,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '2px solid white',
                      boxShadow: `0 0 10px ${pinColor}`,
                      fontSize: '0.9rem',
                      zIndex: 5
                    }}
                    title={loc.name}
                  >
                    {loc.category === 'restaurant' ? '🍕' : 
                     loc.category === 'nightlife' ? '🍸' :
                     loc.category === 'villa' ? '🏡' : '🏄'}
                  </div>
                );
              })}

            <span style={{ opacity: 0.25, fontSize: '0.8rem', position: 'absolute', bottom: '10px' }}>{t.mapPending}</span>
          </div>

          {/* Selected Offer Card Display (Drawer-like) */}
          {selectedOffer ? (
            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--primary)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedOffer(null)} 
                style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: 'white', opacity: 0.5, cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginRight: '1.5rem', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>
                    {t.categories[selectedOffer.category]}
                  </span>
                  <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700 }}>{selectedOffer.title}</h4>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem' }}>{selectedOffer.conditions}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>{t.rewardLabel}</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {user && formatCurrency(selectedOffer.rewardAmount, user.currency)}
                  </span>
                </div>
              </div>
              
              <button
                className="btn-primary"
                onClick={() => handleCreateSession(selectedOffer)}
                style={{ width: '100%', padding: '12px' }}
              >
                {t.generateBtn}
              </button>
            </div>
          ) : (
            /* Selected Offers List (fallback / below map) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t.offersTitle}</h3>
              {filteredOffers.map(offer => (
                <div 
                  key={offer.id} 
                  className="glass-panel" 
                  style={{ padding: '1.25rem', cursor: 'pointer' }}
                  onClick={() => setSelectedOffer(offer)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)' }}>
                        {t.categories[offer.category]}
                      </span>
                      <h4 style={{ margin: '0.1rem 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 600 }}>{offer.title}</h4>
                      <p style={{ fontSize: '0.8rem', opacity: 0.5, margin: 0 }}>Click for details</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {user && formatCurrency(offer.rewardAmount, user.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOffers.length === 0 && (
                <p style={{ opacity: 0.4, fontSize: '0.85rem', textAlign: 'center' }}>No offers in this category</p>
              )}
            </div>
          )}
        </div>
      )}

      
{/* Active Sessions Queue */}
      {activeSessions.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', background: '#52c41a', borderRadius: '50%', display: 'inline-block' }}></span>
            {t.activeCodes}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeSessions.map(session => {
              const offer = offers.find(o => o.id === session.offerId);
              return (
                <div key={session.id} className="card-interactive" style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{offer?.title || 'Offer'}</h4>
                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Code: <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>{session.shortCode}</strong></span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--primary)'
                    }}>
                      {user && offer && formatCurrency(offer.rewardAmount, user.currency)}
                    </div>
                    <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>{t.waiting}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal/Popup for newly generated session */}
      {generatedSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '380px',
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--background)',
            border: '1px solid var(--primary)'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>{t.modalTitle}</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.5rem' }}>
              {t.modalHint}
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed var(--surface-border)',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              {/* QR Mock */}
              <div style={{
                width: '140px',
                height: '140px',
                background: 'white',
                margin: '0 auto 1rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'radial-gradient(black 30%, transparent 35%)',
                  backgroundSize: '8px 8px'
                }}></div>
              </div>
              <span style={{ fontSize: '0.75rem', opacity: 0.4, display: 'block', marginBottom: '0.25rem' }}>{t.shortCodeLabel}</span>
              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '4px',
                color: 'var(--primary)'
              }}>
                {generatedSession.shortCode}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => {
                const checkoutLink = window.location.origin + '/checkout?code=' + generatedSession.shortCode;
                navigator.clipboard.writeText(checkoutLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{ width: '100%', marginBottom: '0.75rem', background: '#22d3ee', color: '#000', border: 'none' }}
            >
              {copied ? 'Link Copied! ✓' : '🔗 Copy Checkout Link'}
            </button>

            <button
              className="btn-primary"
              onClick={() => {
                setGeneratedSession(null);
                setSelectedOffer(null);
                setCopied(false);
              }}
              style={{ width: '100%', background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--foreground)' }}
            >
              {t.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
