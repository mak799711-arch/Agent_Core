'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';
import { ReferralSession } from '@/lib/interfaces/referrals';
import { Offer } from '@/lib/interfaces/offers';
import { UserProfile } from '@/lib/interfaces/auth';
import { formatCurrency } from '@/lib/utils/currency';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ReferralSession | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [business, setBusiness] = useState<UserProfile | null>(null);
  
  const [billAmount, setBillAmount] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Расчет сумм
  const billAmountNum = parseFloat(billAmount) || 0;
  const discountAmount = billAmountNum * 0.10; // 10% скидка клиенту
  const finalToPay = Math.max(0, billAmountNum - discountAmount);

  // Награда агенту
  let computedReward = 0;
  if (offer) {
    if (offer.rewardType === 'fixed') {
      computedReward = offer.rewardAmount;
    } else if (offer.rewardPercent) {
      computedReward = (billAmountNum * offer.rewardPercent) / 100;
    }
  }

  // Наша комиссия платформы (1%)
  const platformFee = billAmountNum * 0.01;

  useEffect(() => {
    let activeCode = code;

    if (!activeCode && typeof window !== 'undefined') {
      try {
        activeCode = localStorage.getItem('last_global_referral_code');
      } catch (e) {
        console.error('Failed to read from localStorage:', e);
      }
    }

    if (!activeCode) {
      setError('Referral code is missing. Please scan a valid QR code.');
      setLoading(false);
      return;
    }

    async function loadCheckoutData() {
      try {
        const activeSession = await referralRepository.getSessionByCode(activeCode as string);
        if (!activeSession) {
          setError('Invalid or expired referral session.');
          return;
        }
        setSession(activeSession);

        // Запоминаем валидный код
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('last_global_referral_code', activeCode as string);
          } catch (e) {
            console.error('Failed to save to localStorage:', e);
          }
        }

        const activeOffer = await offerRepository.getOfferById(activeSession.offerId);
        if (!activeOffer) {
          setError('Associated offer not found.');
          return;
        }
        setOffer(activeOffer);

        const allUsers = await authService.getAllUsers();
        const biz = allUsers.find(u => u.id === activeSession.businessId);
        if (!biz) {
          setError('Business profile not found.');
          return;
        }
        setBusiness(biz);
      } catch (err) {
        console.error('Error loading checkout:', err);
        setError('Failed to load checkout details.');
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [code]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !offer || !business || billAmountNum <= 0) return;

    // Проверяем, хватает ли баланса заведения для выплаты награды + комиссии платформы
    const businessBalance = await walletRepository.getBalance(business.id);
    const totalDeduction = computedReward + platformFee;
    
    if (businessBalance < totalDeduction) {
      alert(`Warning: Venue has insufficient reserve balance (${formatCurrency(businessBalance, business.currency)}) to process referral commission.`);
      return;
    }

    setProcessing(true);
    try {
      // 1. Завершаем сессию
      await referralRepository.completeSession(session.id);

      // 2. Начисляем награду промоутеру
      await walletRepository.createTransaction({
        userId: session.partnerId,
        amount: computedReward,
        type: 'reward',
        sessionId: session.id,
        status: 'completed'
      });

      // 3. Списываем награду с баланса бизнеса
      await walletRepository.createTransaction({
        userId: business.id,
        amount: computedReward,
        type: 'fee',
        sessionId: session.id,
        status: 'completed'
      });

      // 4. Списываем 1% комиссии платформы с баланса бизнеса
      if (platformFee > 0) {
        await walletRepository.createTransaction({
          userId: business.id,
          amount: platformFee,
          type: 'fee',
          sessionId: session.id,
          status: 'completed'
        });
      }

      // Удаляем сгоревший промокод из памяти устройства
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('last_global_referral_code');
        } catch (e) {
          console.error('Failed to remove from localStorage:', e);
        }
      }

      setPaymentSuccess(true);
    } catch (err) {
      console.error('Payment error:', err);
      alert('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid rgba(59, 130, 246, 0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>Loading Payment Gateway...</p>
          <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
        </div>
      </div>
    );
  }

  if (error || !session || !offer || !business) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem', border: '1px solid #ff4d4f' }}>
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h3 style={{ margin: '1rem 0 0.5rem 0', fontWeight: 700 }}>Payment Error</h3>
          <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error || 'Invalid session.'}</p>
          <button className="btn-primary" onClick={() => router.push('/login')} style={{ width: '100%' }}>
            Go to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--ambient-glow)', filter: 'blur(80px)', borderRadius: '50%', top: '20%', left: '10%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--ambient-glow)', filter: 'blur(80px)', borderRadius: '50%', bottom: '20%', right: '10%', pointerEvents: 'none' }} />

      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem', boxShadow: 'var(--card-shadow)', borderRadius: '24px', zIndex: 1, border: '1px solid var(--glass-border)' }}>
        
        {!paymentSuccess ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 211, 238, 0.08)', border: '1px solid var(--primary)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                <span>💳</span> Secure Split Payment
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #ffffff 40%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.25rem 0' }}>
                {business.fullName}
              </h2>
              <p style={{ opacity: 0.5, fontSize: '0.8rem', margin: 0 }}>Referral Code: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{session.shortCode}</span></p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--surface-border)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>Active Promotion</span>
              <h4 style={{ margin: '0.2rem 0 0.4rem 0', fontSize: '1rem', fontWeight: 700 }}>{offer.title}</h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>{offer.conditions || 'Get 10% discount on your bill.'}</p>
            </div>

            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Bill Amount ({business.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'var(--surface)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '12px',
                    color: 'var(--foreground)',
                    fontSize: '1.1rem',
                    outline: 'none',
                    fontWeight: 600
                  }}
                />
              </div>

              {billAmountNum > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)', borderRadius: '16px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                    <span>Original Bill:</span>
                    <span>{formatCurrency(billAmountNum, business.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#52c41a', fontWeight: 600 }}>
                    <span>Client Discount (10%):</span>
                    <span>-{formatCurrency(discountAmount, business.currency)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'var(--surface-border)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                    <span>Total to Pay:</span>
                    <span style={{ color: 'var(--primary)' }}>{formatCurrency(finalToPay, business.currency)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing || billAmountNum <= 0}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem' }}
              >
                {processing ? 'Processing Secure Split...' : 'Confirm & Pay'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '70px', height: '70px', background: 'rgba(82, 196, 26, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Payment Successful!</h2>
            <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '2rem' }}>
              Your bill has been settled. The promotion was applied and commissions were split automatically.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)', borderRadius: '16px', padding: '1.2rem', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                Split Receipt
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>Paid by Client:</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(finalToPay, business.currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>Promoter Reward:</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>+{formatCurrency(computedReward, business.currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>Platform Fee (1%):</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>+{formatCurrency(platformFee, business.currency)}</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => router.push('/login')}
              style={{ width: '100%', padding: '12px' }}
            >
              Back to Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid rgba(59, 130, 246, 0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>Loading checkout page...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
