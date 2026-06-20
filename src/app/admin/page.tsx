'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, walletRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { formatCurrency } from '@/lib/utils/currency';
import VerificationBadge from '@/app/components/VerificationBadge';

const translations = {
  en: {
    admin: 'Platform Administrator',
    exit: 'Exit',
    dashboardTitle: 'Platform Command Center 🔑',
    loading: 'Loading Admin Console...',
    totalVolume: 'Platform Turnover',
    totalAgents: 'Agents Count',
    totalBusinesses: 'Businesses Count',
    tabActive: 'Most Active (Top-10)',
    tabBanned: 'Ban List',
    tabRequests: 'Verification Requests',
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
    merchants: 'Active Restaurants & Beach Clubs'
  },
  ru: {
    admin: 'Администратор платформы',
    exit: 'Выйти',
    dashboardTitle: 'Центр управления платформой 🔑',
    loading: 'Загрузка панели администратора...',
    totalVolume: 'Оборот платформы',
    totalAgents: 'Всего агентов',
    totalBusinesses: 'Всего бизнесов',
    tabActive: 'Самые активные (Топ-10)',
    tabBanned: 'Бан-лист',
    tabRequests: 'Заявки на верификацию',
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
    merchants: 'Активные Рестораны и Заведений'
  }
};

export default function AdminDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'banned' | 'requests'>('active');
  const [selectedBanUser, setSelectedBanUser] = useState<{ id: string; name: string } | null>(null);
  const router = useRouter();

  // Dynamic state populated from real authService database
  const [agents, setAgents] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  const lang = user?.language === 'ru' ? 'ru' : 'en';
  const t = translations[lang];

  const loadPlatformData = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      
      const enrichedUsers = await Promise.all(allUsers.map(async (u) => {
        // Fetch balance
        const balance = await walletRepository.getBalance(u.id);
        
        // Fetch transactions to compute turnover volume and escrow
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

        // Persistent status & ban duration overrides in localStorage
        const storedStatus = localStorage.getItem(`user_status_${u.id}`);
        const status = storedStatus || u.status || 'unverified';
        const banDuration = localStorage.getItem(`user_ban_dur_${u.id}`) || '';

        return {
          ...u,
          status,
          volume: volume || (u.role === 'partner' ? 3200 : 15400), // Default mock values if no transactions yet
          escrowAmount: Math.max(escrow, 0),
          banDuration
        };
      }));

      // Filter out admin themselves and segment by role and status
      const nonAdminUsers = enrichedUsers.filter(u => u.role !== 'admin');
      
      const activeAgents = nonAdminUsers.filter(u => u.role === 'partner' && u.status !== 'banned');
      const activeRestaurants = nonAdminUsers.filter(u => u.role === 'business' && u.status !== 'banned');
      const banned = nonAdminUsers.filter(u => u.status === 'banned');

      setAgents(activeAgents.sort((a, b) => b.volume - a.volume));
      setRestaurants(activeRestaurants.sort((a, b) => b.volume - a.volume));
      setBannedUsers(banned);

      // Load verification requests
      const pendingReqs: any[] = [];
      nonAdminUsers.forEach(u => {
        const hasPendingRequest = localStorage.getItem(`verification_requested_${u.id}`) === 'true';
        if (hasPendingRequest && u.status !== 'verified' && u.status !== 'banned') {
          pendingReqs.push({
            id: `req-${u.id}`,
            targetId: u.id,
            fullName: u.fullName || 'Unnamed',
            email: u.email || '',
            role: u.role,
            dealsCount: parseInt(localStorage.getItem(`simulated_deals_${u.id}`) || '105')
          });
        }
      });
      setRequests(pendingReqs);

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
      } catch (err) {
        console.error('Error loading admin panel:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndLoad();
  }, []);

  const handleVerifyUser = async (id: string) => {
    localStorage.setItem(`user_status_${id}`, 'verified');
    localStorage.removeItem(`verification_requested_${id}`);
    
    // Update local Mock service if it matches currently logged in session
    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      currentUser.status = 'verified';
    }
    
    await loadPlatformData();
    showToast(t.successUpdate);
  };

  const handleVerifyFromRequests = async (reqId: string, targetId: string) => {
    localStorage.setItem(`user_status_${targetId}`, 'verified');
    localStorage.removeItem(`verification_requested_${targetId}`);
    
    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id === targetId) {
      currentUser.status = 'verified';
    }
    
    await loadPlatformData();
    showToast(t.successUpdate);
  };

  const handleInitiateBan = (id: string, name: string) => {
    setSelectedBanUser({ id, name });
  };

  const handleConfirmBan = async (duration: string) => {
    if (!selectedBanUser) return;
    const { id } = selectedBanUser;
    
    localStorage.setItem(`user_status_${id}`, 'banned');
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
    localStorage.setItem(`user_status_${id}`, 'unverified');
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
        <p style={{ color: 'var(--primary)', fontFamily: 'Inter, sans-serif' }}>{t?.loading || 'Loading Admin Console...'}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--foreground)',
      padding: '2.5rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--surface-border)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            {t.dashboardTitle}
          </h2>
          <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--foreground)' }}>{t.admin}</span>
        </div>
        
        <button onClick={handleLogout} style={{
          background: 'rgba(255, 77, 79, 0.1)',
          border: '1px solid var(--error)',
          color: 'var(--error)',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {t.exit}
        </button>
      </header>

      {/* Notifications toast */}
      {statusMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--success)',
          color: 'black',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
          zIndex: 10000
        }}>
          {statusMsg}
        </div>
      )}

      {/* Ban Options Modal */}
      {selectedBanUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000
        }}>
          <div className="glass-panel" style={{
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid var(--surface-border)',
            background: 'var(--surface)'
          }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--foreground)' }}>
              {t.banOptionsTitle} ({selectedBanUser.name})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
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
                    background: 'rgba(255, 77, 79, 0.08)',
                    border: '1px solid var(--error)',
                    color: 'var(--foreground)',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.16)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.08)'}
                >
                  🚫 {
                    dur === '1d' ? t.banOption1d :
                    dur === '1w' ? t.banOption1w :
                    dur === '1m' ? t.banOption1m :
                    dur === '1y' ? t.banOption1y : t.banOptionForever
                  }
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedBanUser(null)}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                color: 'var(--foreground)',
                padding: '10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
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
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem', color: 'var(--foreground)' }}>{t.totalVolume}</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(totalVolume, 'USD')}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem', color: 'var(--foreground)' }}>{t.totalAgents}</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--foreground)' }}>{agents.length}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem', color: 'var(--foreground)' }}>{t.totalBusinesses}</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--foreground)' }}>{restaurants.length}</h2>
        </div>
      </div>

      {/* Custom Tabs Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--surface-border)',
        marginBottom: '2rem',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'active' ? 'var(--primary)' : 'var(--foreground)',
            padding: '12px 8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            opacity: activeTab === 'active' ? 1 : 0.6
          }}
        >
          📈 {t.tabActive}
        </button>

        <button
          onClick={() => setActiveTab('banned')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'banned' ? '2px solid var(--error)' : '2px solid transparent',
            color: activeTab === 'banned' ? 'var(--error)' : 'var(--foreground)',
            padding: '12px 8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            opacity: activeTab === 'banned' ? 1 : 0.6
          }}
        >
          🚫 {t.tabBanned} ({bannedUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '2px solid var(--success)' : '2px solid transparent',
            color: activeTab === 'requests' ? 'var(--success)' : 'var(--foreground)',
            padding: '12px 8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            opacity: activeTab === 'requests' ? 1 : 0.6
          }}
        >
          📥 {t.tabRequests} ({requests.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* TAB 1: MOST ACTIVE */}
        {activeTab === 'active' && (
          <>
            {/* Top Promoters/Agents */}
            <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>{t.promoters}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.6, fontSize: '0.8rem', color: 'var(--foreground)' }}>
                      <th style={{ padding: '12px 10px' }}>{t.status}</th>
                      <th>{t.agent}</th>
                      <th>{t.role}</th>
                      <th>{t.volume}</th>
                      <th style={{ textAlign: 'right', paddingRight: '20px' }}>{t.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.slice(0, 10).map((usr) => (
                      <tr key={usr.id} style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                        <td style={{ padding: '15px 10px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: usr.status === 'verified' ? 'var(--success)' : 'var(--error)',
                            border: `1px solid ${usr.status === 'verified' ? 'var(--success)' : 'var(--error)'}`,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {usr.status === 'verified' ? t.verified : t.unverified}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            {usr.fullName}
                            {usr.status === 'verified' && <VerificationBadge size={14} />}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{usr.email}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {usr.role}
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(usr.volume, 'USD')}</strong>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            {/* Verify neon tick button */}
                            <button
                              onClick={() => handleVerifyUser(usr.id)}
                              disabled={usr.status === 'verified'}
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid var(--success)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: usr.status === 'verified' ? 'default' : 'pointer',
                                filter: usr.status === 'verified' ? 'drop-shadow(0 0 4px #52c41a)' : 'none',
                                opacity: usr.status === 'verified' ? 1 : 0.6,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { if (usr.status !== 'verified') e.currentTarget.style.opacity = '1'; }}
                              onMouseLeave={(e) => { if (usr.status !== 'verified') e.currentTarget.style.opacity = '0.6'; }}
                              title="Verify User"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>

                            {/* Ban neon cross button */}
                            <button
                              onClick={() => handleInitiateBan(usr.id, usr.fullName)}
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid var(--error)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                opacity: 0.6,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
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
                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                          No active promoters registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Restaurants */}
            <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>{t.merchants}</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.6, fontSize: '0.8rem', color: 'var(--foreground)' }}>
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
                      <tr key={usr.id} style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                        <td style={{ padding: '15px 10px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: usr.status === 'verified' ? 'var(--success)' : 'var(--error)',
                            border: `1px solid ${usr.status === 'verified' ? 'var(--success)' : 'var(--error)'}`,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {usr.status === 'verified' ? t.verified : t.unverified}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            {usr.fullName}
                            {usr.status === 'verified' && <VerificationBadge size={14} />}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{usr.email}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {usr.role}
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(usr.volume, 'USD')}</strong>
                        </td>
                        <td>
                          <span style={{ color: usr.escrowAmount > 0 ? 'var(--accent)' : 'inherit', fontWeight: 600 }}>
                            {formatCurrency(usr.escrowAmount, 'USD')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            {/* Verify neon tick button */}
                            <button
                              onClick={() => handleVerifyUser(usr.id)}
                              disabled={usr.status === 'verified'}
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid var(--success)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: usr.status === 'verified' ? 'default' : 'pointer',
                                filter: usr.status === 'verified' ? 'drop-shadow(0 0 4px #52c41a)' : 'none',
                                opacity: usr.status === 'verified' ? 1 : 0.6,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { if (usr.status !== 'verified') e.currentTarget.style.opacity = '1'; }}
                              onMouseLeave={(e) => { if (usr.status !== 'verified') e.currentTarget.style.opacity = '0.6'; }}
                              title="Verify Business"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>

                            {/* Ban neon cross button */}
                            <button
                              onClick={() => handleInitiateBan(usr.id, usr.fullName)}
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: '1px solid var(--error)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                opacity: 0.6,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
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
                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                          No active businesses registered yet.
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
          <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--error)' }}>
              {t.tabBanned}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.6, fontSize: '0.8rem', color: 'var(--foreground)' }}>
                    <th style={{ padding: '12px 10px' }}>{t.status}</th>
                    <th>User / Venue</th>
                    <th>{t.role}</th>
                    <th>{t.banDuration}</th>
                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedUsers.map((bUser) => (
                    <tr key={bUser.id} style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                      <td style={{ padding: '15px 10px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--error)',
                          border: '1px solid var(--error)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {t.banned}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{bUser.fullName}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{bUser.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {bUser.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--error)', fontWeight: 600 }}>🚫 {bUser.banDuration}</span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <button
                          onClick={() => handleUnbanUser(bUser.id)}
                          style={{
                            background: 'rgba(82, 196, 26, 0.1)',
                            border: '1px solid var(--success)',
                            color: 'var(--success)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(82, 196, 26, 0.2)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(82, 196, 26, 0.1)'; }}
                        >
                          {t.unban}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bannedUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                        No banned users recorded.
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
          <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
              {t.tabRequests}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.6, fontSize: '0.8rem', color: 'var(--foreground)' }}>
                    <th style={{ padding: '12px 10px' }}>{t.status}</th>
                    <th>User / Venue</th>
                    <th>{t.role}</th>
                    <th>Completed Deals</th>
                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--surface-border)', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                      <td style={{ padding: '15px 10px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--warning)',
                          border: '1px solid var(--warning)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          PENDING
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.fullName}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{req.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          {req.role}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--success)' }}>🔥 {req.dealsCount} сделок</strong>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {/* Verify neon tick button */}
                          <button
                            onClick={() => handleVerifyFromRequests(req.id, req.targetId)}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'transparent',
                              border: '1px solid var(--success)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: 0.7,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                            title="Approve Request & Verify"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>

                          {/* Reject/Ban cross button */}
                          <button
                            onClick={() => handleInitiateBan(req.targetId, req.fullName)}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'transparent',
                              border: '1px solid var(--error)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: 0.7,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
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
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                        No pending verification requests.
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
  );
}
