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
  const [lang, setLang] = useState<'ru' | 'en' | 'id'>('en');
  const [currency, setCurrency] = useState<'USD' | 'IDR' | 'EUR'>('USD');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  const t = translations[lang];

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <p style={{ color: 'var(--primary)' }}>Loading Onboarding...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.08) 0%, #0a0a0a 100%)',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
      }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
          <span style={{ color: step === 1 ? 'var(--primary)' : 'white', fontWeight: step === 1 ? 600 : 400 }}>{t.step1}</span>
          <span style={{ color: step === 2 ? 'var(--primary)' : 'white', fontWeight: step === 2 ? 600 : 400 }}>{t.step2}</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'var(--surface-border)', borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: 'linear-gradient(95deg, var(--primary), var(--accent))', transition: 'width 0.3s ease' }}></div>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>{t.title}</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '2rem', textAlign: 'center' }}>{t.subtitle}</p>

        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.langLabel}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['en', 'ru', 'id'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: lang === l ? 'var(--primary)' : 'var(--surface-border)',
                      background: lang === l ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {l === 'en' ? 'English' : l === 'ru' ? 'Русский' : 'Bahasa'}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.currLabel}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['USD', 'IDR', 'EUR'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: currency === c ? 'var(--primary)' : 'var(--surface-border)',
                      background: currency === c ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleNextStep} className="btn-primary" style={{ marginTop: '1rem' }}>
              {t.btnNext}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Card Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.cardLabel}</label>
              
              {/* Virtual Mock Card Visual */}
              <div className="glass-panel" style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.15) 0%, rgba(0, 210, 255, 0.15) 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '160px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1px' }}>AGENT CARD</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '2px', margin: '1.5rem 0' }}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8 }}>
                  <span>{user?.fullName || 'CARD HOLDER'}</span>
                  <span>{expiry || 'MM/YY'}</span>
                </div>
              </div>

              {/* Card Form Fields */}
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="0000 0000 0000 0000"
                required
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--surface-border)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: 'white',
                  fontSize: '1.1rem',
                  letterSpacing: '1px',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder={t.cardExpiry}
                  required
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    color: 'white',
                    outline: 'none',
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
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    color: 'white',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-primary" style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}>
                Back
              </button>
              <button type="submit" disabled={submitLoading} className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)' }}>
                {submitLoading ? 'Saving...' : t.btnSubmit}
              </button>
            </div>

            <span style={{ fontSize: '0.7rem', opacity: 0.4, textAlign: 'center', marginTop: '0.5rem' }}>
              🔒 {t.secured}
            </span>
          </form>
        )}
      </div>
    </div>
  );
}
