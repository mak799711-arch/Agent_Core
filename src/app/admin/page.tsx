'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';
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
    promoters: 'Top 10 Promoters & Agents',
    merchants: 'Top 10 Restaurants & Beach Clubs'
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
    promoters: 'ТОП-10 Агентов и Промоутеров',
    merchants: 'ТОП-10 Ресторанов и Заведений'
  }
};

export default function AdminDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'banned' | 'requests'>('active');
  const [selectedBanUser, setSelectedBanUser] = useState<{ id: string; name: string; list: 'agents' | 'restaurants' } | null>(null);
  const router = useRouter();

  // Top 10 Agents state
  const [agents, setAgents] = useState([
    { id: 'agent-1', fullName: 'Wayan Bali Guide', email: 'wayan@bali.guide', role: 'partner', status: 'verified', volume: 5400, banDuration: '' },
    { id: 'agent-2', fullName: 'Made Indrawan', email: 'made.indra@gmail.com', role: 'partner', status: 'verified', volume: 4800, banDuration: '' },
    { id: 'agent-3', fullName: 'Ketut Sudarsana', email: 'ketut.sud@outlook.com', role: 'partner', status: 'verified', volume: 4200, banDuration: '' },
    { id: 'agent-4', fullName: 'Nyoman Ari', email: 'nyoman.ari@yahoo.com', role: 'partner', status: 'unverified', volume: 3900, banDuration: '' },
    { id: 'agent-5', fullName: 'Gede Pratama', email: 'gede.prat@bali.id', role: 'partner', status: 'verified', volume: 3500, banDuration: '' },
    { id: 'agent-6', fullName: 'John Bali Promoter', email: 'partner@agent.core', role: 'partner', status: 'verified', volume: 3200, banDuration: '' },
    { id: 'agent-7', fullName: 'Sarah Wanderlust', email: 'sarah.explore@gmail.com', role: 'partner', status: 'verified', volume: 2900, banDuration: '' },
    { id: 'agent-8', fullName: 'Alex Nomadic', email: 'alex.nomad@outlook.com', role: 'partner', status: 'verified', volume: 2600, banDuration: '' },
    { id: 'agent-9', fullName: 'Elena Sunset', email: 'elena.sun@gmail.com', role: 'partner', status: 'verified', volume: 2300, banDuration: '' },
    { id: 'agent-10', fullName: 'Dmitry Bali Life', email: 'dmitry.life@mail.ru', role: 'partner', status: 'verified', volume: 2100, banDuration: '' }
  ]);

  // Top 10 Businesses state
  const [restaurants, setRestaurants] = useState([
    { id: 'res-1', fullName: 'La Brisa Bali', email: 'business@agent.core', role: 'business', status: 'verified', volume: 15400, escrowAmount: 1200, banDuration: '' },
    { id: 'res-2', fullName: 'Potato Head Beach Club', email: 'manager@potatohead.co', role: 'business', status: 'verified', volume: 14200, escrowAmount: 900, banDuration: '' },
    { id: 'res-3', fullName: 'Finns VIP Beach Club', email: 'vip@finnsbeachclub.com', role: 'business', status: 'verified', volume: 12800, escrowAmount: 1500, banDuration: '' },
    { id: 'res-4', fullName: 'Naughty Nuri\'s Seminyak', email: 'info@naughtynuris.com', role: 'business', status: 'verified', volume: 9800, escrowAmount: 400, banDuration: '' },
    { id: 'res-5', fullName: 'Mason Canggu', email: 'bookings@masonbali.com', role: 'business', status: 'verified', volume: 8900, escrowAmount: 600, banDuration: '' },
    { id: 'res-6', fullName: 'Milk & Madu', email: 'canggu@milkandmadu.com', role: 'business', status: 'verified', volume: 7600, escrowAmount: 300, banDuration: '' },
    { id: 'res-7', fullName: 'Shady Shack', email: 'hello@shadyshack.com', role: 'business', status: 'verified', volume: 6400, escrowAmount: 200, banDuration: '' },
    { id: 'res-8', fullName: 'Sisterfields Cafe', email: 'manager@sisterfields.com', role: 'business', status: 'verified', volume: 5900, escrowAmount: 150, banDuration: '' },
    { id: 'res-9', fullName: 'Motel Mexicola', email: 'fiesta@motelmexicola.info', role: 'business', status: 'verified', volume: 5200, escrowAmount: 800, banDuration: '' },
    { id: 'res-10', fullName: 'Barbacoa Bali', email: 'info@barbacoabali.com', role: 'business', status: 'verified', volume: 4800, escrowAmount: 500, banDuration: '' }
  ]);

  // Combined Ban list state
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);

  // Verification requests state (loaded from local storage + default mock)
  const [requests, setRequests] = useState<any[]>([]);

  const lang = user?.language === 'ru' ? 'ru' : 'en';
  const t = translations[lang];

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

        // Load verification requests from mock local storage
        const defaultRequests = [
          { id: 'req-1', targetId: 'agent-4', fullName: 'Nyoman Ari', email: 'nyoman.ari@yahoo.com', role: 'partner', dealsCount: 105 },
          { id: 'req-2', targetId: 'agent-12', fullName: 'Kadek Wirawan', email: 'kadek.w@yahoo.com', role: 'partner', dealsCount: 102 }
        ];

        // Scan local storage for user created verification requests
        const keys = Object.keys(localStorage);
        const dynamicRequests: any[] = [];
        keys.forEach(key => {
          if (key.startsWith('verification_requested_')) {
            const userId = key.replace('verification_requested_', '');
            // Prevent duplicate
            if (userId === 'mock-partner-uuid' && !dynamicRequests.some(r => r.targetId === userId)) {
              dynamicRequests.push({
                id: `req-dyn-${userId}`,
                targetId: userId,
                fullName: 'John Bali Promoter',
                email: 'partner@agent.core',
                role: 'partner',
                dealsCount: 105
              });
            } else if (userId === 'mock-business-uuid' && !dynamicRequests.some(r => r.targetId === userId)) {
              dynamicRequests.push({
                id: `req-dyn-${userId}`,
                targetId: userId,
                fullName: 'La Brisa Bali Manager',
                email: 'business@agent.core',
                role: 'business',
                dealsCount: 105
              });
            }
          }
        });

        setRequests([...defaultRequests, ...dynamicRequests]);

      } catch (err) {
        console.error('Error loading admin panel:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndLoad();
  }, []);

  const handleVerifyUser = (id: string, list: 'agents' | 'restaurants') => {
    if (list === 'agents') {
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'verified' } : a));
      // Update requests list if present
      const userObj = agents.find(a => a.id === id);
      if (userObj) {
        setRequests(prev => prev.filter(r => r.fullName !== userObj.fullName));
        localStorage.removeItem(`verification_requested_${id}`);
        // If it's a demo account, update status in Mock Service
        if (userObj.fullName === 'John Bali Promoter') {
          authService.getCurrentUser().then(curr => {
            if (curr && curr.id === 'mock-partner-uuid') curr.status = 'verified';
          });
        }
      }
    } else {
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status: 'verified' } : r));
      const userObj = restaurants.find(r => r.id === id);
      if (userObj) {
        setRequests(prev => prev.filter(r => r.fullName !== userObj.fullName));
        localStorage.removeItem(`verification_requested_${id}`);
        // If it's a demo account, update status in Mock Service
        if (userObj.fullName === 'La Brisa Bali Manager') {
          authService.getCurrentUser().then(curr => {
            if (curr && curr.id === 'mock-business-uuid') curr.status = 'verified';
          });
        }
      }
    }
    showToast(t.successUpdate);
  };

  const handleVerifyFromRequests = (reqId: string, fullName: string, role: string) => {
    // Verify in correct main lists
    if (role === 'partner') {
      setAgents(prev => prev.map(a => a.fullName === fullName ? { ...a, status: 'verified' } : a));
    } else {
      setRestaurants(prev => prev.map(r => r.fullName === fullName ? { ...r, status: 'verified' } : r));
    }
    // Remove request
    setRequests(prev => prev.filter(r => r.id !== reqId));
    // Clear local storage flag
    const reqObj = requests.find(r => r.id === reqId);
    if (reqObj) {
      localStorage.removeItem(`verification_requested_${reqObj.targetId}`);
      if (reqObj.targetId === 'mock-partner-uuid' || reqObj.targetId === 'mock-business-uuid') {
        authService.getCurrentUser().then(curr => {
          if (curr) curr.status = 'verified';
        });
      }
    }
    showToast(t.successUpdate);
  };

  const handleInitiateBan = (id: string, name: string, list: 'agents' | 'restaurants') => {
    setSelectedBanUser({ id, name, list });
  };

  const handleConfirmBan = (duration: string) => {
    if (!selectedBanUser) return;
    const { id, name, list } = selectedBanUser;
    
    let bannedUserObj: any = null;

    if (list === 'agents') {
      const userObj = agents.find(a => a.id === id);
      if (userObj) {
        bannedUserObj = { ...userObj, status: 'banned', banDuration: duration };
        setAgents(prev => prev.filter(a => a.id !== id));
      }
    } else {
      const userObj = restaurants.find(r => r.id === id);
      if (userObj) {
        bannedUserObj = { ...userObj, status: 'banned', banDuration: duration };
        setRestaurants(prev => prev.filter(r => r.id !== id));
      }
    }

    if (bannedUserObj) {
      setBannedUsers(prev => [...prev, bannedUserObj]);
      // Remove from pending verification requests if any
      setRequests(prev => prev.filter(r => r.fullName !== name));
      localStorage.removeItem(`verification_requested_${bannedUserObj.id}`);
    }

    setSelectedBanUser(null);
    showToast(t.successUpdate);
  };

  const handleUnbanUser = (id: string) => {
    const userObj = bannedUsers.find(u => u.id === id);
    if (!userObj) return;

    // Restore to their correct list with unverified status
    const restoredObj = { ...userObj, status: 'unverified', banDuration: '' };
    if (userObj.role === 'partner') {
      setAgents(prev => [...prev, restoredObj].sort((a, b) => b.volume - a.volume));
    } else {
      setRestaurants(prev => [...prev, restoredObj].sort((a, b) => b.volume - a.volume));
    }

    setBannedUsers(prev => prev.filter(u => u.id !== id));
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

  // Stats Card Calculations
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
            {/* Top 10 Promoters/Agents */}
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
                            color: usr.status === 'verified' ? 'var(--success)' : 'rgba(255,255,255,0.4)',
                            border: `1px solid ${usr.status === 'verified' ? 'var(--success)' : 'var(--surface-border)'}`,
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
                              onClick={() => handleVerifyUser(usr.id, 'agents')}
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
                              onClick={() => handleInitiateBan(usr.id, usr.fullName, 'agents')}
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
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 10 Restaurants */}
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
                            color: usr.status === 'verified' ? 'var(--success)' : 'rgba(255,255,255,0.4)',
                            border: `1px solid ${usr.status === 'verified' ? 'var(--success)' : 'var(--surface-border)'}`,
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
                              onClick={() => handleVerifyUser(usr.id, 'restaurants')}
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
                              onClick={() => handleInitiateBan(usr.id, usr.fullName, 'restaurants')}
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
                            onClick={() => handleVerifyFromRequests(req.id, req.fullName, req.role)}
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
                            onClick={() => handleInitiateBan(req.targetId, req.fullName, req.role === 'partner' ? 'agents' : 'restaurants')}
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
