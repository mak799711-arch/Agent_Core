'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { Offer } from '@/lib/interfaces/offers';
import { formatCurrency } from '@/lib/utils/currency';

const translations = {
  en: {
    venue: 'Venue Manager',
    exit: 'Exit',
    settings: 'Settings ⚙️',
    balanceLabel: 'Active Reserve Balance',
    depositBtn: 'Deposit $100',
    reserveNote: '🔒 Reserve Protection Active: Offers will automatically de-activate if reward amount exceeds your current reserve balance.',
    attributeTitle: 'Attribute Referral Code',
    verifyBtn: 'Verify & Pay',
    offersTitle: 'Your Active Offers',
    rewardLabel: 'Reward',
    statusActive: 'ACTIVE',
    statusPaused: 'PAUSED (Low Balance)',
    noOffers: 'No offers created yet',
    createTitle: 'Create New Offer',
    offerTitleLabel: 'Offer Title',
    offerTitlePlaceholder: 'e.g. Free Drink at Entrance',
    rewardAmountLabel: 'Promoter Reward Amount (in USD equivalent)',
    conditionsLabel: 'Conditions / Description',
    conditionsPlaceholder: 'Describe conversion terms (e.g. purchase of main dish is required)',
    createBtn: 'Create Offer',
    codeError: 'Active referral code not found or expired',
    offerError: 'Offer not found',
    balanceError: 'Insufficient reserve balance to pay the reward',
    successPrefix: 'Referral confirmed!',
    depositSuccess: 'successfully added to your reserve balance.',
    loading: 'Loading Business Portal...'
  },
  ru: {
    venue: 'Менеджер заведения',
    exit: 'Выйти',
    settings: 'Настройки ⚙️',
    balanceLabel: 'Активный баланс резерва',
    depositBtn: 'Пополнить на $100',
    reserveNote: '🔒 Защита резервов активна: офферы автоматически отключаются, если сумма награды превышает текущий баланс резерва.',
    attributeTitle: 'Подтвердить реферальный код',
    verifyBtn: 'Проверить и выплатить',
    offersTitle: 'Ваши активные предложения',
    rewardLabel: 'Награда',
    statusActive: 'АКТИВЕН',
    statusPaused: 'ПАУЗА (Низкий баланс)',
    noOffers: 'Офферы еще не созданы',
    createTitle: 'Создать новое предложение',
    offerTitleLabel: 'Название предложения',
    offerTitlePlaceholder: 'например, Бесплатный коктейль на входе',
    rewardAmountLabel: 'Сумма награды промоутеру (в эквиваленте USD)',
    conditionsLabel: 'Условия / Описание',
    conditionsPlaceholder: 'Опишите условия конверсии (например, обязательна покупка горячего блюда)',
    createBtn: 'Создать предложение',
    codeError: 'Активный реферальный код не найден или истек',
    offerError: 'Предложение не найдено',
    balanceError: 'Недостаточно средств в резерве для выплаты награды',
    successPrefix: 'Реферал подтвержден!',
    depositSuccess: 'успешно добавлено к вашему балансу резерва.',
    loading: 'Загрузка портала бизнеса...'
  },
  id: {
    venue: 'Manajer Tempat',
    exit: 'Keluar',
    settings: 'Pengaturan ⚙️',
    balanceLabel: 'Saldo Cadangan Aktif',
    depositBtn: 'Setor $100',
    reserveNote: '🔒 Perlindungan Cadangan Aktif: Penawaran akan dinonaktifkan secara otomatis jika jumlah hadiah melebihi saldo cadangan Anda saat ini.',
    attributeTitle: 'Atribusikan Kode Rujukan',
    verifyBtn: 'Verifikasi & Bayar',
    offersTitle: 'Penawaran Aktif Anda',
    rewardLabel: 'Hadiah',
    statusActive: 'AKTIF',
    statusPaused: 'DITANGGUHKAN (Saldo Rendah)',
    noOffers: 'Belum ada penawaran yang dibuat',
    createTitle: 'Buat Penawaran Baru',
    offerTitleLabel: 'Judul Penawaran',
    offerTitlePlaceholder: 'mis. Minuman Gratis di Pintu Masuk',
    rewardAmountLabel: 'Jumlah Hadiah Promotor (dalam ekivalen USD)',
    conditionsLabel: 'Kondisi / Deskripsi',
    conditionsPlaceholder: 'Jelaskan persyaratan konversi (misalnya, pembelian hidangan utama diperlukan)',
    createBtn: 'Buat Penawaran',
    codeError: 'Kode rujukan aktif tidak ditemukan atau kedaluwarsa',
    offerError: 'Penawaran tidak ditemukan',
    balanceError: 'Saldo cadangan tidak mencukupi untuk membayar hadiah',
    successPrefix: 'Rujukan dikonfirmasi!',
    depositSuccess: 'berhasil ditambahkan ke saldo cadangan Anda.',
    loading: 'Memuat Panel Bisnis...'
  }
};

export default function BusinessDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shortCode, setShortCode] = useState('');
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferReward, setNewOfferReward] = useState('');
  const [newOfferConditions, setNewOfferConditions] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const lang = user?.language || 'en';
  const t = translations[lang];

  useEffect(() => {
    async function loadData() {
      try {
        let currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'business') {
          await authService.signIn('business@agent.core', 'password123');
          currentUser = await authService.getCurrentUser();
        }

        if (currentUser) {
          // Защита роута: если карта не привязана, перенаправляем на onboarding
          if (!currentUser.cardBound) {
            router.push('/onboarding');
            return;
          }

          setUser(currentUser);
          
          // Применяем тему
          const activeTheme = localStorage.getItem('theme') || currentUser.theme;
          document.documentElement.setAttribute('data-theme', activeTheme);

          await refreshData(currentUser.id);
        }
      } catch (err) {
        console.error('Error loading business dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const refreshData = async (userId: string) => {
    const bal = await walletRepository.getBalance(userId);
    setBalance(bal);

    const businessOffers = await offerRepository.getOffers({ businessId: userId });
    
    // Reserve Protection Layer Logic:
    const updatedOffers = await Promise.all(businessOffers.map(async (offer) => {
      const isBalanceSufficient = bal >= offer.rewardAmount;
      if (offer.isActive !== isBalanceSufficient) {
        return await offerRepository.updateOffer(offer.id, { isActive: isBalanceSufficient });
      }
      return offer;
    }));

    setOffers(updatedOffers);
  };

  const handleConfirmReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!user) return;

    try {
      const session = await referralRepository.getSessionByCode(shortCode);
      if (!session) {
        setStatusMessage({ text: t.codeError, type: 'error' });
        return;
      }

      const offer = await offerRepository.getOfferById(session.offerId);
      if (!offer) {
        setStatusMessage({ text: t.offerError, type: 'error' });
        return;
      }

      if (balance < offer.rewardAmount) {
        setStatusMessage({ text: t.balanceError, type: 'error' });
        return;
      }

      await referralRepository.completeSession(session.id);

      await walletRepository.createTransaction({
        userId: user.id,
        amount: offer.rewardAmount,
        type: 'withdrawal',
        sessionId: session.id,
        status: 'completed'
      });

      await walletRepository.createTransaction({
        userId: session.partnerId,
        amount: offer.rewardAmount,
        type: 'reward',
        sessionId: session.id,
        status: 'completed'
      });

      setStatusMessage({ text: `${t.successPrefix} ${formatCurrency(offer.rewardAmount, user.currency)} paid to promoter.`, type: 'success' });
      setShortCode('');
      await refreshData(user.id);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error confirming referral', type: 'error' });
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const reward = parseFloat(newOfferReward);
    if (isNaN(reward) || reward <= 0) {
      alert('Invalid reward amount');
      return;
    }

    try {
      await offerRepository.createOffer({
        businessId: user.id,
        title: newOfferTitle,
        rewardAmount: reward,
        conditions: newOfferConditions || null
      });

      setNewOfferTitle('');
      setNewOfferReward('');
      setNewOfferConditions('');
      await refreshData(user.id);
    } catch (err) {
      alert('Failed to create offer');
    }
  };

  const handleDepositReserve = async () => {
    if (!user) return;
    try {
      await walletRepository.createTransaction({
        userId: user.id,
        amount: 100.00, // Пополняем на $100 USD эквивалент
        type: 'deposit',
        sessionId: null,
        status: 'completed'
      });
      await refreshData(user.id);
      setStatusMessage({ text: `${formatCurrency(100.00, user.currency)} ${t.depositSuccess}`, type: 'success' });
    } catch (err) {
      alert('Deposit failed');
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/login');
  };

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
      padding: '2rem',
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
            style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--accent)' }}
          />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{user?.fullName}</h4>
            <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>{t.venue}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => router.push('/business/settings')} style={{
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

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Reserve Protection Widget */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.1) 0%, rgba(0, 210, 255, 0.05) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>{t.balanceLabel}</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                  {user && formatCurrency(balance, user.currency)}
                </h2>
              </div>
              <button className="btn-primary" onClick={handleDepositReserve} style={{ background: 'var(--accent)' }}>
                {user && t.depositBtn.replace('$100', formatCurrency(100.00, user.currency))}
              </button>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--surface-border)',
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              {t.reserveNote}
            </div>
          </div>

          {/* Confirm Referral Code Form */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{t.attributeTitle}</h3>
            
            {statusMessage && (
              <div style={{
                background: statusMessage.type === 'success' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                border: `1px solid ${statusMessage.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                color: statusMessage.type === 'success' ? 'var(--success)' : 'var(--error)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.2rem'
              }}>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleConfirmReferral} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="000000"
                required
                maxLength={6}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: 'white',
                  fontSize: '1.1rem',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
                {t.verifyBtn}
              </button>
            </form>
          </div>

          {/* Offers List */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{t.offersTitle}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {offers.map(offer => (
                <div key={offer.id} style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{offer.title}</h4>
                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                      {t.rewardLabel}: {user && formatCurrency(offer.rewardAmount, user.currency)}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: offer.isActive ? 'rgba(82,196,26,0.1)' : 'rgba(255,77,79,0.1)',
                      color: offer.isActive ? 'var(--success)' : 'var(--error)'
                    }}>
                      {offer.isActive ? t.statusActive : t.statusPaused}
                    </span>
                  </div>
                </div>
              ))}
              {offers.length === 0 && (
                <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>{t.noOffers}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Create Offer Form */}
        <div className="glass-panel" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{t.createTitle}</h3>
          <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.offerTitleLabel}</label>
              <input
                type="text"
                value={newOfferTitle}
                onChange={(e) => setNewOfferTitle(e.target.value)}
                placeholder={t.offerTitlePlaceholder}
                required
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.rewardAmountLabel}</label>
              <input
                type="number"
                value={newOfferReward}
                onChange={(e) => setNewOfferReward(e.target.value)}
                placeholder="5.00"
                required
                min="0.01"
                step="0.01"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.conditionsLabel}</label>
              <textarea
                value={newOfferConditions}
                onChange={(e) => setNewOfferConditions(e.target.value)}
                placeholder={t.conditionsPlaceholder}
                rows={4}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'white',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              {t.createBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
