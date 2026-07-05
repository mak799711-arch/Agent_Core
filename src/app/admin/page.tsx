'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, walletRepository, referralRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { ReferralSession } from '@/lib/interfaces/referrals';
import { formatCurrency } from '@/lib/utils/currency';
import VerificationBadge from '@/app/components/VerificationBadge';

const translations = {
  en: {
    admin: 'Platform Administrator',
    exit: 'Sign Out',
    dashboardTitle: 'Platform Command Center',
    loading: 'Loading Admin Console...',
    totalVolume: 'Platform Turnover',
    totalAgents: 'Agents Count',
    totalBusinesses: 'Businesses Count',
    tabActive: 'Most Active (Top-10)',
    tabBanned: 'Ban List',
    tabRequests: 'Verification Requests',
    tabAudit: 'Audit & Fraud',
    status: 'Status',
    role: 'Role',
    agent: 'Agent',
    venue: 'Venue',
    volume: 'Turnover',
    escrow: 'Active Escrow',
    action: 'Actions',
    verified: 'VERIFIED',
    unverified: 'UNVERIFIED',
    banned: 'BANNED',
    banDuration: 'Ban Duration',
    banOptionsTitle: 'Select Ban Duration',
    banOption1d: '1 Day',
    banOption1w: '1 Week',
    banOption1m: '1 Month',
    banOption1y: '1 Year',
    banOptionForever: 'Forever',
    btnCancel: 'Cancel',
    unban: 'Unban User',
    successUpdate: 'Action completed successfully!',
    promoters: 'Active Promoters & Agents',
    merchants: 'Active Restaurants & Beach Clubs',
    emptyActiveAgents: 'No active promoters registered yet.',
    emptyActiveVenues: 'No active businesses registered yet.',
    emptyBanned: 'All users are in good standing. Ban list is empty.',
    emptyRequests: 'Verification queue is empty.',
    emptySessions: 'No sessions match your search criteria.',
    searchCode: 'Search by Code',
    searchPromoter: 'Search by Promoter ID',
    btnFlag: 'Flag Fraud',
    btnBlock: 'Block Promoter',
    btnUnblock: 'Unblock',
    geoLocation: 'Location',
    sessionCode: 'Session Code',
    created: 'Created At'
  },
  ru: {
    admin: 'Администратор платформы',
    exit: 'Выйти',
    dashboardTitle: 'Центр управления платформой',
    loading: 'Загрузка панели администратора...',
    totalVolume: 'Оборот платформы',
    totalAgents: 'Всего агентов',
    totalBusinesses: 'Всего бизнесов',
    tabActive: 'Самые активные (Топ-10)',
    tabBanned: 'Бан-лист',
    tabRequests: 'Заявки на верификацию',
    tabAudit: 'Аудит и Фрод',
    status: 'Статус',
    role: 'Роль',
    agent: 'Агент',
    venue: 'Заведение',
    volume: 'Оборот',
    escrow: 'В Эскроу',
    action: 'Действия',
    verified: 'ВЕРИФИЦИРОВАН',
    unverified: 'НЕ ВЕРИФИЦИРОВАН',
    banned: 'ЗАБАНЕН',
    banDuration: 'Срок бана',
    banOptionsTitle: 'Выберите срок бана',
    banOption1d: '1 день',
    banOption1w: '1 неделя',
    banOption1m: '1 месяц',
    banOption1y: '1 год',
    banOptionForever: 'Навсегда',
    btnCancel: 'Отмена',
    unban: 'Разбанить',
    successUpdate: 'Действие успешно выполнено!',
    promoters: 'Активные Агенты и Промоутеры',
    merchants: 'Активные Рестораны и Заведения',
    emptyActiveAgents: 'Активные промоутеры на платформе отсутствуют.',
    emptyActiveVenues: 'Активные заведения на платформе отсутствуют.',
    emptyBanned: 'Нарушителей нет. Бан-лист пуст.',
    emptyRequests: 'Очередь заявок на верификацию пуста.',
    emptySessions: 'Сессии по заданным критериям не найдены.',
    searchCode: 'Поиск по коду',
    searchPromoter: 'Поиск по ID промоутера',
    btnFlag: 'Флаг Фрод',
    btnBlock: 'Блок Промоутера',
    btnUnblock: 'Разблочить',
    geoLocation: 'Геопозиция',
    sessionCode: 'Код сессии',
    created: 'Создано'
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
  role: 'partner' | 'business';
  dealsCount: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'banned' | 'requests' | 'audit'>('active');
  const [selectedBanUser, setSelectedBanUser] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

  const [agents, setAgents] = useState<EnrichedUser[]>([]);
  const [restaurants, setRestaurants] = useState<EnrichedUser[]>([]);
  const [bannedUsers, setBannedUsers] = useState<EnrichedUser[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [sessions, setSessions] = useState<ReferralSession[]>([]);
  const [allUsersList, setAllUsersList] = useState<UserProfile[]>([]);
  const [searchSessionCode, setSearchSessionCode] = useState('');
  const [searchPromoterId, setSearchPromoterId] = useState('');

  const lang = user?.language === 'ru' ? 'ru' : 'en';
  const t = translations[lang];

  const loadPlatformData = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      
      const enrichedUsers = await Promise.all(allUsers.map(async (u) => {
        const balance = await walletRepository.getBalance(u.id);
        const txs = await walletRepository.getTransactions(u.id);
        
        const volume = txs
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const escrow = txs
          .filter(t => t.type === 'escrow_hold' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0) - 
          txs
          .filter(t => t.type === 'escrow_release' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const status = u.status || 'unverified';
        const banDuration = localStorage.getItem(`user_ban_dur_${u.id}`) || '';

        return {
          ...u,
          status,
          volume,
          escrowAmount: Math.max(escrow, 0),
          banDuration
        };
      }));

      const nonAdminUsers = enrichedUsers.filter(u => u.role !== 'admin') as EnrichedUser[];
      
      const activeAgents = nonAdminUsers.filter(u => u.role === 'partner' && u.status !== 'banned');
      const activeRestaurants = nonAdminUsers.filter(u => u.role === 'business' && u.status !== 'banned');
      const banned = nonAdminUsers.filter(u => u.status === 'banned');

      setAgents(activeAgents.sort((a, b) => b.volume - a.volume));
      setRestaurants(activeRestaurants.sort((a, b) => b.volume - a.volume));
      setBannedUsers(banned);

      const pendingReqs: PendingRequest[] = [];
      nonAdminUsers.forEach(u => {
        const hasPendingRequest = localStorage.getItem(`verification_requested_${u.id}`) === 'true';
        if (hasPendingRequest && u.status !== 'verified' && u.status !== 'banned') {
          pendingReqs.push({
            id: `req-${u.id}`,
            targetId: u.id,
            fullName: u.fullName || 'Unnamed',
            email: u.email || '',
            role: u.role as 'partner' | 'business',
            dealsCount: parseInt(localStorage.getItem(`simulated_deals_${u.id}`) || '0')
          });
        }
      });
      setRequests(pendingReqs);

      const allSessions = await referralRepository.getAllSessions();
      setSessions(allSessions);
      setAllUsersList(allUsers);
    } catch (err) {
      console.error('Error loading platform data:', err);
    }
  };

  useEffect(() => {
    async function checkAdminAndLoad() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
          router.push('/login');
          return;
        }

        setUser(currentUser);
        const activeTheme = localStorage.getItem('theme') || currentUser.theme;
        document.documentElement.setAttribute('data-theme', activeTheme);

        await loadPlatformData();
        setLoading(false);
      } catch (err) {
        console.error('Error loading admin panel:', err);
        router.push('/login');
      }
    }
    checkAdminAndLoad();
  }, [router]);

  const handleVerifyUser = async (id: string) => {
    await authService.adminUpdateUserProfile(id, { status: 'verified' });
    localStorage.removeItem(`verification_requested_${id}`);
    
    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      currentUser.status = 'verified';
    }
    
    await loadPlatformData();
    showToast(t.successUpdate);
  };

  const handleVerifyFromRequests = async (reqId: string, targetId: string) => {
    await authService.adminUpdateUserProfile(targetId, { status: 'verified' });
    localStorage.removeItem(`verification_requested_${targetId}`);
    
    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === targetId) {
      currentUser.status = 'verified';
    }
    
    await loadPlatformData();
    showToast(t.successUpdate);
  };

  const handleFlagSession = async (sessionId: string) => {
    try {
      await referralRepository.flagSession(sessionId);
      await loadPlatformData();
      showToast(t.successUpdate);
    } catch (err) {
      console.error('Error flagging session:', err);
    }
  };

  const handleBlockPromoter = async (promoterId: string, block: boolean) => {
    try {
      await authService.blockUser(promoterId, block);
      await loadPlatformData();
      showToast(t.successUpdate);
    } catch (err) {
      console.error('Error blocking promoter:', err);
    }
  };

  const handleInitiateBan = (id: string, name: string) => {
    setSelectedBanUser({ id, name });
  };

  const handleConfirmBan = async (duration: string) => {
    if (!selectedBanUser) return;
    const { id } = selectedBanUser;
    
    await authService.adminUpdateUserProfile(id, { status: 'banned', isBlocked: true });
    localStorage.setItem(`user_ban_dur_${id}`, duration);
    localStorage.removeItem(`verification_requested_${id}`);
    
    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      currentUser.status = 'banned';
    }
    
    setSelectedBanUser(null);
    await loadPlatformData();
    showToast(t.successUpdate);
  };

  const handleUnbanUser = async (id: string) => {
    await authService.adminUpdateUserProfile(id, { status: 'unverified', isBlocked: false });
    localStorage.removeItem(`user_ban_dur_${id}`);
    
    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      currentUser.status = 'unverified';
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
    router.push('/login');
  };

  const totalVolume = agents.reduce((sum, a) => sum + a.volume, 0) + restaurants.reduce((sum, r) => sum + r.volume, 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid rgba(0, 210, 255, 0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--foreground)', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '0.95rem', letterSpacing: '0.5px' }}>{t?.loading || 'Loading Admin Console...'}</p>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      color: 'var(--foreground)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient light removed for performance */}

      {/* Container to restrict max width */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--admin-padding)', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <header className="glass-header" style={{
        display: 'flex',
        flexDirection: 'var(--header-flex-direction)' as any,
        justifyContent: 'space-between',
        alignItems: 'var(--header-align-items)' as any,
        marginBottom: '3rem',
        padding: 'var(--header-padding)',
        marginLeft: 'var(--header-margin-horizontal)',
        marginRight: 'var(--header-margin-horizontal)',
        marginTop: 'var(--header-margin-top)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: 'var(--admin-title-size)', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.8px' }}>
            {t.dashboardTitle}
          </h2>
          <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, color: 'var(--primary)', marginTop: '6px', display: 'block' }}>{t.admin}</span>
        </div>
        
        <button onClick={handleLogout} style={{
          background: 'rgba(244, 63, 94, 0.06)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          color: 'var(--error)',
          padding: '10px 22px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 700,
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          alignSelf: 'var(--header-align-self, center)' as any
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
          e.currentTarget.style.borderColor = 'var(--error)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(244, 63, 94, 0.06)';
          e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.25)';
        }}
        >
          {t.exit}
        </button>
      </header>

      {/* Notifications toast */}
      {statusMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          background: 'var(--success)',
          color: 'var(--foreground)',
          padding: '14px 28px',
          borderRadius: '14px',
          fontWeight: 700,
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)',
          zIndex: 10000,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {statusMsg}
        </div>
      )}

      {/* Ban Options Modal */}
      {selectedBanUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 8, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="glass-panel" style={{
            padding: '3rem 2.5rem',
            maxWidth: '440px',
            width: '100%',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
            borderRadius: '24px',
            animation: 'scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.3px' }}>
              {t.banOptionsTitle}
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '2rem', fontWeight: 500 }}>
              Restricting access for user: <strong style={{ color: 'var(--foreground)' }}>{selectedBanUser.name}</strong>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem' }}>
              {(['1d', '1w', '1m', '1y', 'forever'] as const).map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleConfirmBan(
                    dur === '1d' ? t.banOption1d :
                    dur === '1w' ? t.banOption1w :
                    dur === '1m' ? t.banOption1m :
                    dur === '1y' ? t.banOption1y : t.banOptionForever
                  )}
                  style={{
                    background: 'rgba(244, 63, 94, 0.03)',
                    border: '1px solid rgba(244, 63, 94, 0.15)',
                    color: 'var(--foreground)',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--error)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(244, 63, 94, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.15)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {
                      dur === '1d' ? t.banOption1d :
                      dur === '1w' ? t.banOption1w :
                      dur === '1m' ? t.banOption1m :
                      dur === '1y' ? t.banOption1y : t.banOptionForever
                    }
                  </span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>→</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedBanUser(null)}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid var(--surface-border)',
                color: 'var(--foreground)',
                padding: '14px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'background 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {t.btnCancel}
            </button>
          </div>
        </div>
      )}

      {/* 3 Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '3rem',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Card 1: Platform Volume */}
        <div className="glass-panel" style={{
          padding: 'var(--admin-metric-padding)',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginBottom: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>{t.totalVolume}</span>
            <h2 style={{ fontSize: 'var(--admin-metric-value-size)', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.5px' }}>{formatCurrency(totalVolume, 'USD')}</h2>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(34, 211, 238, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34, 211, 238, 0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>

        {/* Card 2: Agents Count */}
        <div className="glass-panel" style={{
          padding: 'var(--admin-metric-padding)',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginBottom: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{t.totalAgents}</span>
            <h2 style={{ fontSize: 'var(--admin-metric-value-size)', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.5px' }}>{agents.length}</h2>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--surface-border)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.75 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>

        {/* Card 3: Businesses Count */}
        <div className="glass-panel" style={{
          padding: 'var(--admin-metric-padding)',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginBottom: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{t.totalBusinesses}</span>
            <h2 style={{ fontSize: 'var(--admin-metric-value-size)', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.5px' }}>{restaurants.length}</h2>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--surface-border)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.75 }}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Segmented Pill Design) */}
      <div className="mobile-scroll-x" style={{
        display: 'var(--tabs-display)' as any,
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--tabs-border-radius)',
        padding: 'var(--tabs-padding)',
        marginBottom: 'var(--tabs-margin-bottom)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 2,
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            background: activeTab === 'active' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: 'none',
            color: activeTab === 'active' ? 'var(--primary)' : 'var(--foreground)',
            padding: '12px 24px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            transition: 'all 0.25s ease',
            opacity: activeTab === 'active' ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'active' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            outline: 'none'
          }}
        >
          {t.tabActive}
        </button>

        <button
          onClick={() => setActiveTab('banned')}
          style={{
            background: activeTab === 'banned' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: 'none',
            color: activeTab === 'banned' ? 'var(--error)' : 'var(--foreground)',
            padding: '12px 24px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            transition: 'all 0.25s ease',
            opacity: activeTab === 'banned' ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'banned' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            outline: 'none'
          }}
        >
          {t.tabBanned} 
          <span style={{ fontSize: '0.75rem', background: 'rgba(244, 63, 94, 0.12)', padding: '2px 8px', borderRadius: '20px', marginLeft: '4px', fontWeight: 800 }}>{bannedUsers.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            background: activeTab === 'requests' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: 'none',
            color: activeTab === 'requests' ? 'var(--success)' : 'var(--foreground)',
            padding: '12px 24px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            transition: 'all 0.25s ease',
            opacity: activeTab === 'requests' ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'requests' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            outline: 'none'
          }}
        >
          {t.tabRequests}
          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '20px', marginLeft: '4px', fontWeight: 800 }}>{requests.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            background: activeTab === 'audit' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            border: 'none',
            color: activeTab === 'audit' ? 'var(--warning)' : 'var(--foreground)',
            padding: '12px 24px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            transition: 'all 0.25s ease',
            opacity: activeTab === 'audit' ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'audit' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            outline: 'none'
          }}
        >
          {t.tabAudit}
          <span style={{ fontSize: '0.75rem', background: 'rgba(250, 173, 20, 0.12)', padding: '2px 8px', borderRadius: '20px', marginLeft: '4px', fontWeight: 800 }}>{sessions.length}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', zIndex: 2 }}>
        
        {/* TAB 1: MOST ACTIVE */}
        {activeTab === 'active' && (
          <>
            {/* Top Promoters/Agents */}
            <div className="glass-panel" style={{ padding: '2rem 2.2rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
              <h3 style={{ marginBottom: '1.8rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.3px' }}>{t.promoters}</h3>
              <div className="table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.45, fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <th style={{ padding: '12px 10px' }}>{t.status}</th>
                      <th>{t.agent}</th>
                      <th>{t.role}</th>
                      <th>{t.volume}</th>
                      <th style={{ textAlign: 'right', paddingRight: '20px' }}>{t.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.slice(0, 10).map((usr) => (
                      <tr key={usr.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                        <td style={{ padding: '16px 10px' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: usr.status === 'verified' ? 'var(--success)' : 'var(--error)',
                            background: usr.status === 'verified' ? 'rgba(82, 196, 26, 0.08)' : 'rgba(255, 77, 79, 0.08)',
                            border: `1px solid ${usr.status === 'verified' ? 'rgba(82, 196, 26, 0.3)' : 'rgba(255, 77, 79, 0.3)'}`,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'inline-block',
                            letterSpacing: '0.5px'
                          }}>
                            {usr.status === 'verified' ? t.verified : t.unverified}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 650, display: 'flex', alignItems: 'center' }}>
                            {usr.fullName}
                            {usr.status === 'verified' && <VerificationBadge size={14} />}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: '2px' }}>{usr.email}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {usr.role}
                          </span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.95rem' }}>{formatCurrency(usr.volume, 'USD')}</strong>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <div style={{ display: 'inline-flex', gap: '10px' }}>
                            <button
                              onClick={() => handleVerifyUser(usr.id)}
                              disabled={usr.status === 'verified'}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid rgba(82, 196, 26, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: usr.status === 'verified' ? 'default' : 'pointer',
                                filter: usr.status === 'verified' ? 'drop-shadow(0 0 6px #52c41a)' : 'none',
                                opacity: usr.status === 'verified' ? 1 : 0.5,
                                transition: 'all 0.25s ease',
                                outline: 'none'
                              }}
                              className="verify-btn"
                              title="Verify User"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>

                            <button
                              onClick={() => handleInitiateBan(usr.id, usr.fullName || 'Unnamed')}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid rgba(255, 77, 79, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                opacity: 0.5,
                                transition: 'all 0.25s ease',
                                outline: 'none'
                              }}
                              className="ban-btn"
                              title="Ban User"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                          {t.emptyActiveAgents}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Restaurants */}
            <div className="glass-panel" style={{ padding: '2rem 2.2rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
              <h3 style={{ marginBottom: '1.8rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.3px' }}>{t.merchants}</h3>
              <div className="table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.45, fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      <th style={{ padding: '12px 10px' }}>{t.status}</th>
                      <th>{t.venue}</th>
                      <th>{t.role}</th>
                      <th>{t.volume}</th>
                      <th>{t.escrow}</th>
                      <th style={{ textAlign: 'right', paddingRight: '20px' }}>{t.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.slice(0, 10).map((usr) => (
                      <tr key={usr.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                        <td style={{ padding: '16px 10px' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: usr.status === 'verified' ? 'var(--success)' : 'var(--error)',
                            background: usr.status === 'verified' ? 'rgba(82, 196, 26, 0.08)' : 'rgba(255, 77, 79, 0.08)',
                            border: `1px solid ${usr.status === 'verified' ? 'rgba(82, 196, 26, 0.3)' : 'rgba(255, 77, 79, 0.3)'}`,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'inline-block',
                            letterSpacing: '0.5px'
                          }}>
                            {usr.status === 'verified' ? t.verified : t.unverified}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 650, display: 'flex', alignItems: 'center' }}>
                            {usr.fullName}
                            {usr.status === 'verified' && <VerificationBadge size={14} />}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: '2px' }}>{usr.email}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {usr.role}
                          </span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.95rem' }}>{formatCurrency(usr.volume, 'USD')}</strong>
                        </td>
                        <td>
                          <span style={{ color: usr.escrowAmount > 0 ? 'var(--accent)' : 'inherit', fontWeight: 650 }}>
                            {formatCurrency(usr.escrowAmount, 'USD')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <div style={{ display: 'inline-flex', gap: '10px' }}>
                            <button
                              onClick={() => handleVerifyUser(usr.id)}
                              disabled={usr.status === 'verified'}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid rgba(82, 196, 26, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: usr.status === 'verified' ? 'default' : 'pointer',
                                filter: usr.status === 'verified' ? 'drop-shadow(0 0 6px #52c41a)' : 'none',
                                opacity: usr.status === 'verified' ? 1 : 0.5,
                                transition: 'all 0.25s ease',
                                outline: 'none'
                              }}
                              className="verify-btn"
                              title="Verify Business"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>

                            <button
                              onClick={() => handleInitiateBan(usr.id, usr.fullName || 'Unnamed')}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid rgba(255, 77, 79, 0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                opacity: 0.5,
                                transition: 'all 0.25s ease',
                                outline: 'none'
                              }}
                              className="ban-btn"
                              title="Ban Business"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
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
        {activeTab === 'banned' && (
          <div className="glass-panel" style={{ padding: '2.5rem 2.2rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.8rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--error)', letterSpacing: '-0.3px' }}>
              {t.tabBanned}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.45, fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '12px 10px' }}>{t.status}</th>
                    <th>User / Venue</th>
                    <th>{t.role}</th>
                    <th>{t.banDuration}</th>
                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedUsers.map((bUser) => (
                    <tr key={bUser.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                      <td style={{ padding: '16px 10px' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: 'var(--error)',
                          background: 'rgba(255, 77, 79, 0.08)',
                          border: '1px solid rgba(255, 77, 79, 0.3)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          display: 'inline-block',
                          letterSpacing: '0.5px'
                        }}>
                          {t.banned}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 650 }}>{bUser.fullName}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: '2px' }}>{bUser.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {bUser.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--error)', fontWeight: 600 }}>{bUser.banDuration}</span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <button
                          onClick={() => handleUnbanUser(bUser.id)}
                          style={{
                            background: 'rgba(82, 196, 26, 0.06)',
                            border: '1px solid rgba(82, 196, 26, 0.25)',
                            color: 'var(--success)',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            transition: 'all 0.2s ease',
                            outline: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(82, 196, 26, 0.12)';
                            e.currentTarget.style.borderColor = 'var(--success)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(82, 196, 26, 0.06)';
                            e.currentTarget.style.borderColor = 'rgba(82, 196, 26, 0.25)';
                          }}
                        >
                          {t.unban}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bannedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
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
        {activeTab === 'requests' && (
          <div className="glass-panel" style={{ padding: '2.5rem 2.2rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.8rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.3px' }}>
              {t.tabRequests}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.45, fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '12px 10px' }}>{t.status}</th>
                    <th>User / Venue</th>
                    <th>{t.role}</th>
                    <th>Completed Deals</th>
                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                      <td style={{ padding: '16px 10px' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: 'var(--warning)',
                          background: 'rgba(250, 173, 20, 0.08)',
                          border: '1px solid rgba(250, 173, 20, 0.3)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          display: 'inline-block',
                          letterSpacing: '0.5px'
                        }}>
                          PENDING
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 650 }}>{req.fullName}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: '2px' }}>{req.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {req.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem' }}>
                          {req.dealsCount} deals
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <div style={{ display: 'inline-flex', gap: '10px' }}>
                          <button
                            onClick={() => handleVerifyFromRequests(req.id, req.targetId)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'transparent',
                              border: '1px solid rgba(82, 196, 26, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: 0.7,
                              transition: 'all 0.25s ease',
                              outline: 'none'
                            }}
                            className="verify-btn"
                            title="Approve Request & Verify"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>

                          <button
                            onClick={() => handleInitiateBan(req.targetId, req.fullName)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'transparent',
                              border: '1px solid rgba(255, 77, 79, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: 0.7,
                              transition: 'all 0.25s ease',
                              outline: 'none'
                            }}
                            className="ban-btn"
                            title="Reject & Ban"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
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
        {activeTab === 'audit' && (
          <div className="glass-panel" style={{ padding: '2.5rem 2.2rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.8rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)', letterSpacing: '-0.3px' }}>
              {t.tabAudit}
            </h3>

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={t.searchCode}
                value={searchSessionCode}
                onChange={(e) => setSearchSessionCode(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--foreground)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '0.9rem',
                  minWidth: '200px',
                  flex: 1
                }}
              />
              <input
                type="text"
                placeholder={t.searchPromoter}
                value={searchPromoterId}
                onChange={(e) => setSearchPromoterId(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--foreground)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '0.9rem',
                  minWidth: '200px',
                  flex: 1
                }}
              />
            </div>

            {/* Sessions Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.45, fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '12px 10px' }}>{t.status}</th>
                    <th>{t.sessionCode}</th>
                    <th>Promoter / Agent ID</th>
                    <th>{t.geoLocation}</th>
                    <th>{t.created}</th>
                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions
                    .filter(s => {
                      const matchCode = !searchSessionCode || s.shortCode.toLowerCase().includes(searchSessionCode.toLowerCase()) || s.id.toLowerCase().includes(searchSessionCode.toLowerCase());
                      const matchPromoter = !searchPromoterId || s.partnerId.toLowerCase().includes(searchPromoterId.toLowerCase());
                      return matchCode && matchPromoter;
                    })
                    .map((session) => {
                      const promoter = allUsersList.find(u => u.id === session.partnerId);
                      const isPromoterBlocked = promoter?.isBlocked === true;

                      return (
                        <tr key={session.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                          <td style={{ padding: '16px 10px' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: session.status === 'completed' ? 'var(--success)' :
                                     session.status === 'flagged' ? 'var(--error)' :
                                     session.status === 'expired' ? 'var(--foreground)' : 'var(--warning)',
                              background: session.status === 'completed' ? 'rgba(82, 196, 26, 0.08)' :
                                          session.status === 'flagged' ? 'rgba(255, 77, 79, 0.08)' :
                                          session.status === 'expired' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(250, 173, 20, 0.08)',
                              border: `1px solid ${
                                session.status === 'completed' ? 'rgba(82, 196, 26, 0.3)' :
                                session.status === 'flagged' ? 'rgba(255, 77, 79, 0.3)' :
                                session.status === 'expired' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(250, 173, 20, 0.3)'
                              }`,
                              padding: '4px 10px',
                              borderRadius: '20px',
                              display: 'inline-block',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase'
                            }}>
                              {session.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{session.shortCode}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.45 }}>ID: {session.id}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{promoter?.fullName || 'Unknown Promoter'}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.45 }}>ID: {session.partnerId}</div>
                            {isPromoterBlocked && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--error)', background: 'rgba(255, 77, 79, 0.1)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block', fontWeight: 700 }}>
                                BLOCKED
                              </span>
                            )}
                          </td>
                          <td>
                            {session.geoLocation ? (
                              <div>
                                <div style={{ fontWeight: 600 }}>{session.geoLocation.city}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                  {session.geoLocation.lat.toFixed(4)}, {session.geoLocation.lng.toFixed(4)}
                                </div>
                              </div>
                            ) : (
                              <span style={{ opacity: 0.4 }}>N/A</span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>{new Date(session.createdAt).toLocaleDateString()}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.45 }}>{new Date(session.createdAt).toLocaleTimeString()}</div>
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                            <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                onClick={() => handleFlagSession(session.id)}
                                disabled={session.status === 'flagged'}
                                style={{
                                  background: session.status === 'flagged' ? 'rgba(255, 77, 79, 0.05)' : 'rgba(255, 77, 79, 0.1)',
                                  border: '1px solid rgba(255, 77, 79, 0.3)',
                                  color: 'var(--error)',
                                  padding: '8px 14px',
                                  borderRadius: '8px',
                                  cursor: session.status === 'flagged' ? 'default' : 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  transition: 'all 0.2s',
                                  opacity: session.status === 'flagged' ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (session.status !== 'flagged') {
                                    e.currentTarget.style.background = 'rgba(255, 77, 79, 0.2)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (session.status !== 'flagged') {
                                    e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)';
                                  }
                                }}
                              >
                                {t.btnFlag}
                              </button>

                              <button
                                onClick={() => handleBlockPromoter(session.partnerId, !isPromoterBlocked)}
                                style={{
                                  background: isPromoterBlocked ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                                  border: `1px solid ${isPromoterBlocked ? 'rgba(82, 196, 26, 0.3)' : 'rgba(255, 77, 79, 0.3)'}`,
                                  color: isPromoterBlocked ? 'var(--success)' : 'var(--error)',
                                  padding: '8px 14px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = isPromoterBlocked ? 'rgba(82, 196, 26, 0.2)' : 'rgba(255, 77, 79, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = isPromoterBlocked ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)';
                                }}
                              >
                                {isPromoterBlocked ? t.btnUnblock : t.btnBlock}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {sessions.filter(s => {
                    const matchCode = !searchSessionCode || s.shortCode.toLowerCase().includes(searchSessionCode.toLowerCase()) || s.id.toLowerCase().includes(searchSessionCode.toLowerCase());
                    const matchPromoter = !searchPromoterId || s.partnerId.toLowerCase().includes(searchPromoterId.toLowerCase());
                    return matchCode && matchPromoter;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                        {t.emptySessions}
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

      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
    </div>
  );
}
