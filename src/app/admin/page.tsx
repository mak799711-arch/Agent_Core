'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { Offer } from '@/lib/interfaces/offers';
import { ReferralSession } from '@/lib/interfaces/referrals';
import { Transaction } from '@/lib/interfaces/wallet';
import { formatCurrency } from '@/lib/utils/currency';

const translations = {
  en: {
    admin: 'Platform Administrator',
    exit: 'Exit',
    dashboardTitle: 'Admin Control Center 🔑',
    loading: 'Loading Admin Console...',
    totalVolume: 'Total Platform Volume',
    activeEscrow: 'Active Escrow Holds',
    totalUsers: 'Total Registered Users',
    activeOffers: 'Active Offers',
    merchants: 'Merchants & Reserves',
    promoters: 'Promoters & Earnings',
    escrowLedger: 'Live Escrow Ledger',
    topUp: 'Modify Balance',
    toggleStatus: 'Toggle Verification',
    save: 'Save',
    cancel: 'Cancel',
    status: 'Status',
    amount: 'Amount',
    action: 'Action',
    verified: 'VERIFIED',
    standard: 'STANDARD',
    active: 'ACTIVE',
    paused: 'PAUSED',
    payoutRate: 'Set Platform Fee (%)',
    systemAlert: 'System notifications',
    successUpdate: 'Platform data updated successfully!'
  },
  ru: {
    admin: 'Администратор платформы',
    exit: 'Выйти',
    dashboardTitle: 'Центр управления платформой 🔑',
    loading: 'Загрузка панели администратора...',
    totalVolume: 'Общий оборот платформы',
    activeEscrow: 'Заморожено в Эскроу',
    totalUsers: 'Всего пользователей',
    activeOffers: 'Активных предложений',
    merchants: 'Заведения и Резервы',
    promoters: 'Промоутеры и Доходы',
    escrowLedger: 'Живой реестр Эскроу',
    topUp: 'Изменить баланс',
    toggleStatus: 'Изменить статус',
    save: 'Сохранить',
    cancel: 'Отмена',
    status: 'Статус',
    amount: 'Сумма',
    action: 'Действие',
    verified: 'ПОДТВЕРЖДЕН',
    standard: 'ОБЫЧНЫЙ',
    active: 'АКТИВЕН',
    paused: 'ПАУЗА',
    payoutRate: 'Комиссия платформы (%)',
    systemAlert: 'Системные уведомления',
    successUpdate: 'Данные платформы успешно обновлены!'
  }
};

export default function AdminDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Platform Metrics
  const [usersList, setUsersList] = useState<any[]>([]);
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sessions, setSessions] = useState<ReferralSession[]>([]);
  
  // Custom Controls
  const [platformFee, setPlatformFee] = useState<number>(2.5);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newBalanceValue, setNewBalanceValue] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const router = useRouter();

  const lang = user?.language === 'ru' ? 'ru' : 'en';
  const t = translations[lang];

  useEffect(() => {
    async function checkAdminAndLoad() {
      try {
        let currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
          // Авто-логин под админом, если нет сессии (для демо)
          await authService.signIn('mak799711@gmail.com', 'MAKADMIN1551');
          currentUser = await authService.getCurrentUser();
        }

        if (currentUser) {
          setUser(currentUser);
          
          const activeTheme = localStorage.getItem('theme') || currentUser.theme;
          document.documentElement.setAttribute('data-theme', activeTheme);
          
          await loadPlatformData();
        }
      } catch (err) {
        console.error('Error initializing admin console:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndLoad();
  }, []);

  const loadPlatformData = async () => {
    // Вытаскиваем все офферы
    const allOffers = await offerRepository.getOffers({});
    setOffersList(allOffers);

    // Имитируем получение всех пользователей системы из MockAuthService
    // Так как у нас mock, мы берем дефолтных
    const defaultUsers = [
      { id: 'mock-partner-uuid', role: 'partner', fullName: 'John Bali Promoter', email: 'partner@agent.core', cardBound: true, status: 'verified' },
      { id: 'mock-business-uuid', role: 'business', fullName: 'La Brisa Bali Manager', email: 'business@agent.core', cardBound: true, status: 'verified' },
      { id: 'mock-admin-uuid', role: 'admin', fullName: 'Mak Admin', email: 'mak799711@gmail.com', cardBound: true, status: 'verified' }
    ];

    // Добавляем к ним их балансы
    const usersWithBalances = await Promise.all(defaultUsers.map(async (u) => {
      const bal = await walletRepository.getBalance(u.id);
      const txs = await walletRepository.getTransactions(u.id);
      const escrow = txs
        .filter(t => t.type === 'escrow_hold' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0) - 
        txs
        .filter(t => t.type === 'escrow_release' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...u,
        balance: bal,
        escrowAmount: Math.max(escrow, 0)
      };
    }));
    setUsersList(usersWithBalances);

    // Собираем транзакции со всей системы
    // В MockWalletRepository транзакции лежат внутри синглтона. Мы получим их через getTransactions
    const partnerTxs = await walletRepository.getTransactions('mock-partner-uuid');
    const businessTxs = await walletRepository.getTransactions('mock-business-uuid');
    const combinedTxs = [...partnerTxs, ...businessTxs].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setTransactions(combinedTxs);
  };

  const handleUpdateBalance = async (userId: string) => {
    const amt = parseFloat(newBalanceValue);
    if (isNaN(amt)) return;

    try {
      // Имитируем пополнение/списание через транзакцию deposit/withdrawal
      const current = usersList.find(u => u.id === userId)?.balance || 0;
      const difference = amt - current;

      if (difference !== 0) {
        await walletRepository.createTransaction({
          userId,
          amount: Math.abs(difference),
          type: difference > 0 ? 'deposit' : 'withdrawal',
          sessionId: null,
          status: 'completed'
        });
      }

      setEditingUserId(null);
      setNewBalanceValue('');
      await loadPlatformData();
      showToast(t.successUpdate);
    } catch (err) {
      alert('Failed to update balance');
    }
  };

  const handleToggleVerification = async (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'verified' ? 'standard' : 'verified';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
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

  // Вычисления для дашборда
  const totalVolume = transactions
    .filter(tx => tx.type === 'reward' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const activeEscrow = usersList
    .filter(u => u.role === 'business')
    .reduce((sum, u) => sum + u.escrowAmount, 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <p style={{ color: 'var(--primary)' }}>{t?.loading || 'Loading Admin Console...'}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, var(--background), #050505)',
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
          <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t.admin}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['dark', 'neon', 'light'] as const).map(th => (
              <button
                key={th}
                onClick={() => {
                  localStorage.setItem('theme', th);
                  document.documentElement.setAttribute('data-theme', th);
                }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                {th.toUpperCase()}
              </button>
            ))}
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
        </div>
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

      {/* 4 Cards Grid Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>{t.totalVolume}</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(totalVolume, 'USD')}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>{t.activeEscrow}</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(activeEscrow, 'USD')}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>{t.totalUsers}</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{usersList.length}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>{t.activeOffers}</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{offersList.filter(o => o.isActive).length}</h2>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* User Management Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>{t.merchants} & {t.promoters}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', opacity: 0.6, fontSize: '0.8rem' }}>
                  <th style={{ padding: '10px' }}>User</th>
                  <th>Role</th>
                  <th>Reserve / Balance</th>
                  <th>Escrow Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr key={usr.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '15px 10px' }}>
                      <div style={{ fontWeight: 600 }}>{usr.fullName}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{usr.email}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {usr.role}
                      </span>
                    </td>
                    <td>
                      {editingUserId === usr.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="number"
                            value={newBalanceValue}
                            onChange={(e) => setNewBalanceValue(e.target.value)}
                            style={{ width: '80px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--primary)', color: 'white', padding: '4px', borderRadius: '4px' }}
                          />
                          <button onClick={() => handleUpdateBalance(usr.id)} style={{ background: 'var(--primary)', border: 'none', color: 'black', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                            {t.save}
                          </button>
                          <button onClick={() => setEditingUserId(null)} style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'white', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                            {t.cancel}
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong>{formatCurrency(usr.balance, 'USD')}</strong>
                          {usr.role !== 'admin' && (
                            <button
                              onClick={() => {
                                setEditingUserId(usr.id);
                                setNewBalanceValue(usr.balance.toString());
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                            >
                              {t.topUp}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ color: usr.escrowAmount > 0 ? 'var(--accent)' : 'inherit' }}>
                        {formatCurrency(usr.escrowAmount, 'USD')}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: usr.status === 'verified' ? 'var(--success)' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${usr.status === 'verified' ? 'var(--success)' : 'rgba(255,255,255,0.2)'}`,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {usr.status === 'verified' ? t.verified : t.standard}
                      </span>
                    </td>
                    <td>
                      {usr.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleVerification(usr.id)}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--surface-border)',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          {t.toggleStatus}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform Escrow Ledger & Transactions */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>{t.escrowLedger}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--surface-border)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginRight: '10px',
                    background: tx.type === 'escrow_hold' ? 'rgba(255, 0, 127, 0.1)' :
                               tx.type === 'reward' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: tx.type === 'escrow_hold' ? 'var(--accent)' :
                           tx.type === 'reward' ? 'var(--success)' : 'white'
                  }}>
                    {tx.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>ID: {tx.id}</span>
                  <div style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '2px' }}>
                    Created: {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1.1rem', color: tx.type === 'escrow_hold' ? 'var(--accent)' : 'inherit' }}>
                    {tx.type === 'escrow_hold' ? '-' : tx.type === 'reward' ? '+' : ''}{formatCurrency(tx.amount, 'USD')}
                  </strong>
                  <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 600 }}>{tx.status.toUpperCase()}</div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p style={{ opacity: 0.4, fontSize: '0.85rem', textAlign: 'center' }}>No transactions recorded yet</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
