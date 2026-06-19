'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { Offer } from '@/lib/interfaces/offers';
import { ReferralSession } from '@/lib/interfaces/referrals';

export default function PartnerDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeSessions, setActiveSessions] = useState<ReferralSession[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [generatedSession, setGeneratedSession] = useState<ReferralSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        // Проверяем авторизацию
        let currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'partner') {
          // Если не вошли, автоматически авторизуем демо-партнера для удобства разработки
          await authService.signIn('partner@agent.core', 'password123');
          currentUser = await authService.getCurrentUser();
        }
        setUser(currentUser);

        if (currentUser) {
          const bal = await walletRepository.getBalance(currentUser.id);
          setBalance(bal);

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

  const handleCreateSession = async (offer: Offer) => {
    if (!user) return;
    try {
      const session = await referralRepository.createSession(user.id, offer.id, offer.businessId);
      setGeneratedSession(session);
      
      // Обновляем список активных сессий
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <p style={{ color: 'var(--primary)' }}>Loading Partner Portal...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0d0d0d, #050505)',
      color: 'white',
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
            <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Local Promoter</span>
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

      {/* Wallet Widget */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(255, 0, 127, 0.05) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block', marginBottom: '0.25rem' }}>Wallet Balance</span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', margin: 0 }}>
          ${balance.toFixed(2)}
        </h2>
        <button className="btn-primary" style={{
          position: 'absolute',
          right: '1.5rem',
          bottom: '1.5rem',
          padding: '8px 16px',
          fontSize: '0.85rem'
        }} onClick={() => alert('Payout processing will be available in Phase 2')}>
          Withdraw
        </button>
      </div>

      {/* Active Sessions Queue (Passive Attributions) */}
      {activeSessions.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', background: '#52c41a', borderRadius: '50%', display: 'inline-block' }}></span>
            Active Referral Codes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeSessions.map(session => (
              <div key={session.id} className="glass-panel" style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: '4px solid var(--primary)'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{offers.find(o => o.id === session.offerId)?.title || 'Offer'}</h4>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Code: <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>{session.shortCode}</strong></span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--primary)'
                  }}>${offers.find(o => o.id === session.offerId)?.rewardAmount.toFixed(2)}</div>
                  <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>Waiting for scan</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Map/List Offers */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Offers in Bali</h3>
        
        {/* Mock Map View */}
        <div className="glass-panel" style={{
          height: '200px',
          marginBottom: '2rem',
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
            📍 Canggu & Seminyak Map (Mock)
          </div>
          <span style={{ opacity: 0.4, fontSize: '0.85rem' }}>Mapbox Integration Pending Token Setup</span>
          {/* Mock Marker */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '35%',
            background: 'var(--accent)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            boxShadow: '0 0 10px var(--accent)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '60%',
            left: '65%',
            background: 'var(--primary)',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            boxShadow: '0 0 10px var(--primary)'
          }}></div>
        </div>

        {/* Offers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {offers.map(offer => (
            <div key={offer.id} className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>{offer.title}</h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.75rem', lineHeight: '1.4' }}>{offer.conditions}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>Reward</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>${offer.rewardAmount.toFixed(2)}</span>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleCreateSession(offer)}
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem', marginTop: '0.5rem' }}
              >
                Generate Referral Code
              </button>
            </div>
          ))}
        </div>
      </div>

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
            background: '#0d0d0d',
            border: '1px solid var(--primary)'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Referral Active</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.5rem' }}>
              Show this code or QR to the venue manager to confirm attribution.
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
              <span style={{ fontSize: '0.75rem', opacity: 0.4, display: 'block', marginBottom: '0.25rem' }}>SHORT CODE</span>
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
              onClick={() => setGeneratedSession(null)}
              style={{ width: '100%' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
