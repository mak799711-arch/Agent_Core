'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { Offer } from '@/lib/interfaces/offers';
import { ReferralSession } from '@/lib/interfaces/referrals';
import { formatCurrency } from '@/lib/utils/currency';

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
    offersTitle: 'Active Offers in Bali',
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
    }
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
    offersTitle: 'Активные офферы на Бали',
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
    }
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
    }
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [generatedSession, setGeneratedSession] = useState<ReferralSession | null>(null);
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
          if (!currentUser.cardBound) {
            router.push('/onboarding');
            return;
          }

          setUser(currentUser);
          
          const activeTheme = localStorage.getItem('theme') || currentUser.theme;
          document.documentElement.setAttribute('data-theme', activeTheme);

          // Считаем общую сумму заработанных денег (Total Earnings) вместо текущего кошелька
          const txs = await walletRepository.getTransactions(currentUser.id);
          const earned = txs
            .filter(tx => tx.type === 'reward' && tx.status === 'completed')
            .reduce((sum, tx) => sum + tx.amount, 0);
          
          // Для дефолтного аккаунта добавим стартовый заработок $25.00, если транзакций еще нет
          setTotalEarnings(earned || 25.00);

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
  }, []);

  const handleGetStarted = () => {
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
          // Дефолтные координаты Бали (Чангу), если гео недоступна
          setUserLocation({ lat: -8.6534, lng: 115.1305 });
          setLocationStatus(t.locError);
          setTimeout(() => {
            setLocationStatus(null);
            setIsStarted(true);
          }, 3000);
        }
      );
    } else {
      setUserLocation({ lat: -8.6534, lng: 115.1305 });
      setIsStarted(true);
    }
  };

  const handleCreateSession = async (offer: Offer) => {
    if (!user) return;
    try {
      const session = await referralRepository.createSession(user.id, offer.id, offer.businessId);
      setGeneratedSession(session);
      
      const sessions = await referralRepository.getActiveSessionsForPartner(user.id);
      setActiveSessions(sessions);
    } catch (err) {
      alert('Failed to generate referral session');
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/login');
  };

  // Фильтрация офферов по категории
  const filteredOffers = offers.filter(offer => 
    selectedCategory === 'all' || offer.category === selectedCategory
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <p style={{ color: 'var(--primary)' }}>{t?.loading || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, var(--background), #050505)',
      color: 'var(--foreground)',
      padding: '1.5rem',
      paddingBottom: '5rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--surface-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={user?.avatarUrl || ''}
            alt="Avatar"
            style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--primary)' }}
          />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{user?.fullName}</h4>
            <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>{t.promoter}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => router.push('/partner/settings')} style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}>
            {t.settings}
          </button>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'var(--error)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}>
            {t.exit}
          </button>
        </div>
      </header>

      {/* Total Earnings Widget */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(255, 0, 127, 0.05) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>{t.totalEarnedLabel}</span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: 0 }}>
          {user && formatCurrency(totalEarnings, user.currency)}
        </h2>
      </div>

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
                <div key={session.id} className="glass-panel" style={{
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Category Filter - Rounded Beautiful Badges */}
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'none'
          }}>
            {(['all', 'restaurant', 'nightlife', 'villa', 'activity'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '10px 18px',
                  borderRadius: '30px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--surface-border)',
                  background: selectedCategory === cat ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' : 'var(--surface)',
                  color: selectedCategory === cat ? 'black' : 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: selectedCategory === cat ? '0 4px 12px rgba(0, 210, 255, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.categories[cat]}
              </button>
            ))}
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
              .filter(loc => selectedCategory === 'all' || loc.category === selectedCategory)
              .map((loc, idx) => {
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginRight: '1.5rem' }}>
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
                setGeneratedSession(null);
                setSelectedOffer(null);
              }}
              style={{ width: '100%' }}
            >
              {t.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
