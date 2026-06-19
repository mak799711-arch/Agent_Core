'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { Offer } from '@/lib/interfaces/offers';

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

  useEffect(() => {
    async function loadData() {
      try {
        let currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'business') {
          // Авто-вход демо-бизнеса для удобства разработки
          await authService.signIn('business@agent.core', 'password123');
          currentUser = await authService.getCurrentUser();
        }
        setUser(currentUser);

        if (currentUser) {
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
    // Автоматически отключаем офферы, на которые у бизнеса не хватает баланса
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
      // 1. Ищем сессию по коду
      const session = await referralRepository.getSessionByCode(shortCode);
      if (!session) {
        setStatusMessage({ text: 'Active referral code not found or expired', type: 'error' });
        return;
      }

      // 2. Получаем оффер для проверки цены
      const offer = await offerRepository.getOfferById(session.offerId);
      if (!offer) {
        setStatusMessage({ text: 'Offer not found', type: 'error' });
        return;
      }

      // 3. Проверка Reserve Protection Layer
      if (balance < offer.rewardAmount) {
        setStatusMessage({ text: 'Insufficient reserve balance to pay the reward', type: 'error' });
        return;
      }

      // 4. Завершаем сессию
      await referralRepository.completeSession(session.id);

      // 5. Проводим транзакции
      // Списание с баланса бизнеса
      await walletRepository.createTransaction({
        userId: user.id,
        amount: offer.rewardAmount,
        type: 'withdrawal',
        sessionId: session.id,
        status: 'completed'
      });

      // Начисление партнеру
      await walletRepository.createTransaction({
        userId: session.partnerId,
        amount: offer.rewardAmount,
        type: 'reward',
        sessionId: session.id,
        status: 'completed'
      });

      setStatusMessage({ text: `Referral confirmed! $${offer.rewardAmount} paid to promoter.`, type: 'success' });
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
      // Имитируем пополнение баланса резерва на $100
      await walletRepository.createTransaction({
        userId: user.id,
        amount: 100.00,
        type: 'deposit',
        sessionId: null,
        status: 'completed'
      });
      await refreshData(user.id);
      setStatusMessage({ text: '$100.00 successfully added to your reserve balance.', type: 'success' });
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
        <p style={{ color: 'var(--primary)' }}>Loading Business Portal...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0d0d0d, #050505)',
      color: 'white',
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
            <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Venue Manager</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: 'var(--error)',
          padding: '6px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.8rem'
        }}>
          Exit
        </button>
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
                <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>Active Reserve Balance</span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>${balance.toFixed(2)}</h2>
              </div>
              <button className="btn-primary" onClick={handleDepositReserve} style={{ background: 'var(--accent)' }}>
                Deposit $100
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
              🔒 <strong>Reserve Protection Active:</strong> Offers will automatically de-activate if reward amount exceeds your current reserve balance.
            </div>
          </div>

          {/* Confirm Referral Code Form */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Attribute Referral Code</h3>
            
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
                placeholder="Enter 6-digit code"
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
                Verify & Pay
              </button>
            </form>
          </div>

          {/* Offers List */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Your Active Offers</h3>
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
                    <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Reward: ${offer.rewardAmount}</span>
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
                      {offer.isActive ? 'ACTIVE' : 'PAUSED (Low Balance)'}
                    </span>
                  </div>
                </div>
              ))}
              {offers.length === 0 && (
                <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>No offers created yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Create Offer Form */}
        <div className="glass-panel" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Create New Offer</h3>
          <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Offer Title</label>
              <input
                type="text"
                value={newOfferTitle}
                onChange={(e) => setNewOfferTitle(e.target.value)}
                placeholder="e.g. Free Drink at Entrance"
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
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Promoter Reward Amount ($ USD)</label>
              <input
                type="number"
                value={newOfferReward}
                onChange={(e) => setNewOfferReward(e.target.value)}
                placeholder="e.g. 5.00"
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
              <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>Conditions / Description</label>
              <textarea
                value={newOfferConditions}
                onChange={(e) => setNewOfferConditions(e.target.value)}
                placeholder="Describe conversion terms (e.g. purchase of main dish is required)"
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
              Create Offer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
