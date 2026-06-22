'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';

const translations = {
  en: {
    title: 'Welcome to Agent Core',
    subtitle: 'Let\'s set up your billing profile',
    langLabel: 'Preferred Language',
    currLabel: 'Preferred Currency',
    cardLabel: 'Credit / Debit Card (For Payouts & Reserves)',
    cardHolder: 'Card Number',
    cardExpiry: 'MM/YY',
    cardCvc: 'CVC',
    btnNext: 'Next Step',
    btnSubmit: 'Complete Registration',
    errorCard: 'Please enter a valid card number',
    success: 'Profile configured successfully!',
    step1: 'Step 1: Settings',
    step2: 'Step 2: Payment Card',
    secured: 'Secure 256-bit SSL encryption'
  },
  ru: {
    title: 'Добро пожаловать в Agent Core',
    subtitle: 'Давайте настроим ваш профиль выплат',
    langLabel: 'Предпочитаемый язык',
    currLabel: 'Основная валюта',
    cardLabel: 'Кредитная / Дебетовая карта (Для выплат и резервов)',
    cardHolder: 'Номер карты',
    cardExpiry: 'ММ/ГГ',
    cardCvc: 'CVC',
    btnNext: 'Следующий шаг',
    btnSubmit: 'Завершить регистрацию',
    errorCard: 'Пожалуйста, введите корректный номер карты',
    success: 'Профиль успешно настроен!',
    step1: 'Шаг 1: Настройки',
    step2: 'Шаг 2: Платежная карта',
    secured: 'Защищено 256-битным SSL шифрованием'
  },
  id: {
    title: 'Selamat datang di Agent Core',
    subtitle: 'Mari siapkan profil pembayaran Anda',
    langLabel: 'Bahasa Pilihan',
    currLabel: 'Mata Uang Pilihan',
    cardLabel: 'Kartu Kredit / Debit (Untuk Pembayaran & Cadangan)',
    cardHolder: 'Nomor Kartu',
    cardExpiry: 'MM/YY',
    cardCvc: 'CVC',
    btnNext: 'Langkah berikutnya',
    btnSubmit: 'Selesaikan Pendaftaran',
    errorCard: 'Silakan masukkan nomor kartu yang valid',
    success: 'Profil berhasil dikonfigurasi!',
    step1: 'Langkah 1: Pengaturan',
    step2: 'Langkah 2: Kartu Pembayaran',
    secured: 'Enkripsi SSL 256-bit yang aman'
  }
};

export default function OnboardingPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<'ru' | 'en' | 'id' | 'zh' | 'es' | 'de' | 'fr'>('en');
  const [currency, setCurrency] = useState<'USD' | 'IDR' | 'EUR' | 'RUB' | 'CNY' | 'AUD' | 'SGD' | 'GBP' | 'JPY'>('USD');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  const t = (translations as any)[lang] || translations.en;

  useEffect(() => {
    async function checkUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLang(currentUser.language);
        setCurrency(currentUser.currency);
        // Если карта уже привязана, перенаправляем сразу в дашборд
        if (currentUser.cardBound) {
          router.push(`/${currentUser.role}`);
        }
      }
      setLoading(false);
    }
    checkUser();
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    if (formattedValue.length <= 19) {
      setCardNumber(formattedValue);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = value;
    if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    if (formattedValue.length <= 5) {
      setExpiry(formattedValue);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvc(value);
    }
  };

  const handleNextStep = () => {
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert(t.errorCard);
      return;
    }

    setSubmitLoading(true);
    try {
      await authService.updateProfile({
        language: lang,
        currency,
        cardBound: true,
        cardNumber
      });
      alert(t.success);
      if (user) {
        router.push(`/${user.role}`);
      }
    } catch (err) {
      alert('Failed to save profile');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid rgba(34, 211, 238, 0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>Loading Onboarding...</p>
          <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.06) 0%, #090a0f 100%)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background light */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'rgba(34, 211, 238, 0.05)',
        filter: 'blur(90px)',
        borderRadius: '50%',
        top: '25%',
        left: '15%',
        pointerEvents: 'none'
      }} />

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '3rem 2.5rem',
        boxShadow: 'var(--card-shadow)',
        borderRadius: '24px',
        border: '1px solid var(--glass-border)',
        zIndex: 1
      }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem', opacity: 0.8, fontWeight: 700, letterSpacing: '0.5px' }}>
          <span style={{ color: step === 1 ? 'var(--primary)' : 'var(--foreground)', transition: 'color 0.2s' }}>{t.step1.toUpperCase()}</span>
          <span style={{ color: step === 2 ? 'var(--primary)' : 'var(--foreground)', transition: 'color 0.2s' }}>{t.step2.toUpperCase()}</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'var(--surface-border)', borderRadius: '10px', marginBottom: '2.5rem', overflow: 'hidden' }}>
          <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem', textAlign: 'center', letterSpacing: '-0.5px' }}>{t.title}</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '2.5rem', textAlign: 'center', fontWeight: 500 }}>{t.subtitle}</p>

        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>{t.langLabel}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                style={{
                  width: '100%'
                }}
              >
                <option value="en" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>English</option>
                <option value="ru" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>Русский</option>
                <option value="id" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>Bahasa Indonesia</option>
                <option value="zh" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>中文 (Chinese)</option>
                <option value="es" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>Español (Spanish)</option>
                <option value="de" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>Deutsch (German)</option>
                <option value="fr" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>Français (French)</option>
              </select>
            </div>

            {/* Currency Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>{t.currLabel}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                style={{
                  width: '100%'
                }}
              >
                <option value="USD" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>USD ($)</option>
                <option value="IDR" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>IDR (Rp)</option>
                <option value="EUR" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>EUR (€)</option>
                <option value="RUB" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>RUB (₽)</option>
                <option value="CNY" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>CNY (¥)</option>
                <option value="AUD" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>AUD (A$)</option>
                <option value="SGD" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>SGD (S$)</option>
                <option value="GBP" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>GBP (£)</option>
                <option value="JPY" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>JPY (¥)</option>
              </select>
            </div>

            <button onClick={handleNextStep} className="btn-primary" style={{ marginTop: '1rem', borderRadius: '12px', padding: '14px' }}>
              {t.btnNext}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {/* Card Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>{t.cardLabel}</label>
              
              {/* Virtual Mock Card Visual */}
              <div className="glass-panel" style={{
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)',
                padding: '1.8rem',
                borderRadius: '20px',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '180px',
                border: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '1.5px', opacity: 0.9 }}>AGENT CARD</span>
                  <div style={{ width: '36px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}></div>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '2.5px', margin: '1rem 0', fontFamily: 'monospace' }}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', opacity: 0.8 }}>
                  <span style={{ textTransform: 'uppercase' }}>{user?.fullName || 'CARD HOLDER'}</span>
                  <span>{expiry || 'MM/YY'}</span>
                </div>
              </div>

              {/* Card Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  required
                  style={{
                    fontSize: '1.1rem',
                    letterSpacing: '1px',
                    textAlign: 'center'
                  }}
                />

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder={t.cardExpiry}
                    required
                    style={{
                      flex: 1,
                      textAlign: 'center'
                    }}
                  />
                  <input
                    type="password"
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder={t.cardCvc}
                    required
                    style={{
                      flex: 1,
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-primary" style={{ flex: 1, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--surface-border)', boxShadow: 'none' }}>
                Back
              </button>
              <button type="submit" disabled={submitLoading} className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.2)' }}>
                {submitLoading ? 'Saving...' : t.btnSubmit}
              </button>
            </div>

            <span style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', marginTop: '0.5rem', display: 'block', fontWeight: 600 }}>
              🔒 {t.secured}
            </span>
          </form>
        )}
      </div>
    </div>
  );
}
