'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';

const translations = {
  en: {
    title: 'Quick Profile Setup',
    subtitle: 'Select settings to enter your dashboard',
    langLabel: 'Language',
    currLabel: 'Currency',
    btnSubmit: 'Enter Dashboard',
    btnSignOut: 'Sign Out'
  },
  ru: {
    title: 'Быстрая настройка',
    subtitle: 'Выберите параметры для входа в панель',
    langLabel: 'Язык',
    currLabel: 'Валюта',
    btnSubmit: 'Войти в панель',
    btnSignOut: 'Выйти из аккаунта'
  }
};

export default function OnboardingPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const [currency, setCurrency] = useState<'USD' | 'IDR' | 'EUR' | 'RUB'>('USD');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();

  const t = translations[lang] || translations.ru;

  useEffect(() => {
    async function checkUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLang(currentUser.language === 'ru' ? 'ru' : 'en');
        setCurrency(currentUser.currency as any);
        // If cardBound is true, skip onboarding
        if (currentUser.cardBound) {
          router.push(`/${currentUser.role}`);
        }
      }
      setLoading(false);
    }
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await authService.updateProfile({
        language: lang as any,
        currency,
        cardBound: true,
        cardNumber: '1111 2222 3333 4444' // Mock card to bypass validation
      });
      if (user) {
        router.push(`/${user.role}`);
      }
    } catch (err) {
      alert('Failed to save profile settings');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090a0f' }}>
        <p style={{ color: 'white', fontWeight: 600 }}>Loading Portal...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.04) 0%, #090a0f 100%)',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '3rem 2.2rem',
        borderRadius: '24px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--card-shadow)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem', color: '#ffffff' }}>
          {t.title}
        </h2>
        <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2.5rem', fontWeight: 500 }}>
          {t.subtitle}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>
              {t.langLabel}
            </label>
            <select value={lang} onChange={(e) => setLang(e.target.value as any)} style={{ width: '100%' }}>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>
              {t.currLabel}
            </label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} style={{ width: '100%' }}>
              <option value="USD">USD ($)</option>
              <option value="IDR">IDR (Rp)</option>
              <option value="EUR">EUR (€)</option>
              <option value="RUB">RUB (₽)</option>
            </select>
          </div>

          <button type="submit" disabled={submitLoading} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '1rem' }}>
            {submitLoading ? 'Saving...' : t.btnSubmit}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.8rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1.2rem' }}>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--foreground)',
              opacity: 0.5,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            {t.btnSignOut}
          </button>
        </div>
      </div>
    </div>
  );
}
