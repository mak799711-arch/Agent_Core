'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';

const translations = {
  en: {
    title: 'Profile Settings',
    back: '← Back to Dashboard',
    themeLabel: 'Appearance Theme',
    langLabel: 'Language',
    currLabel: 'Currency',
    cardLabel: 'Payment Methods',
    cardBound: 'Active Card',
    cardUnbound: 'No card bound. Payouts are suspended.',
    btnUnbind: 'Unbind Card',
    btnBind: 'Bind New Card',
    btnSave: 'Save Changes',
    success: 'Settings updated successfully!',
    themes: { dark: 'Dark', light: 'Light', neon: 'Neon' }
  },
  ru: {
    title: 'Настройки профиля',
    back: '← Вернуться в панель',
    themeLabel: 'Тема оформления',
    langLabel: 'Язык',
    currLabel: 'Валюта выплат',
    cardLabel: 'Способы оплаты',
    cardBound: 'Активная карта',
    cardUnbound: 'Карта не привязана. Выплаты приостановлены.',
    btnUnbind: 'Отвязать карту',
    btnBind: 'Привязать новую карту',
    btnSave: 'Сохранить изменения',
    success: 'Настройки успешно обновлены!',
    themes: { dark: 'Тёмная', light: 'Светлая', neon: 'Неоновая' }
  },
  id: {
    title: 'Pengaturan Profil',
    back: '← Kembali ke Dasbor',
    themeLabel: 'Tema Tampilan',
    langLabel: 'Bahasa',
    currLabel: 'Mata Uang',
    cardLabel: 'Metode Pembayaran',
    cardBound: 'Kartu Aktif',
    cardUnbound: 'Tidak ada kartu terikat. Pembayaran ditangguhkan.',
    btnUnbind: 'Lepaskan Kartu',
    btnBind: 'Ikatkan Kartu Baru',
    btnSave: 'Simpan Perubahan',
    success: 'Pengaturan berhasil diperbarui!',
    themes: { dark: 'Gelap', light: 'Terang', neon: 'Neon' }
  }
};

export default function PartnerSettings() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<'ru' | 'en' | 'id'>('en');
  const [currency, setCurrency] = useState<'USD' | 'IDR' | 'EUR'>('USD');
  const [theme, setTheme] = useState<'dark' | 'neon' | 'light'>('neon');
  const [cardBound, setCardBound] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  
  const [newCardNumber, setNewCardNumber] = useState('');
  const [isBinding, setIsBinding] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const t = translations[lang];

  useEffect(() => {
    async function loadUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'partner') {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLang(currentUser.language);
        setCurrency(currentUser.currency);
        setCardBound(currentUser.cardBound);
        setCardNumber(currentUser.cardNumber || '');
        
        // Получаем тему
        const activeTheme = localStorage.getItem('theme') as any || currentUser.theme;
        setTheme(activeTheme);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'neon' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleUnbindCard = async () => {
    setCardBound(false);
    setCardNumber('');
  };

  const handleBindCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCard = newCardNumber.replace(/\D/g, '');
    if (cleanCard.length < 16) {
      alert(t.langLabel === 'Language' ? 'Invalid card number' : 'Некорректный номер карты');
      return;
    }
    const formattedCard = newCardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCardNumber(formattedCard);
    setCardBound(true);
    setNewCardNumber('');
    setIsBinding(false);
  };

  const handleSave = async () => {
    try {
      await authService.updateProfile({
        language: lang,
        currency,
        theme,
        cardBound,
        cardNumber: cardBound ? cardNumber : null
      });
      alert(t.success);
      // Если отвязали карту, перенаправляем на онбординг, так как без нее нельзя работать
      if (!cardBound) {
        router.push('/onboarding');
      } else {
        router.push('/partner');
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <p style={{ color: 'var(--primary)' }}>Loading Settings...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--foreground)',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Back Link */}
        <a href="/partner" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          {t.back}
        </a>

        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>{t.title}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Theme Switcher */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>{t.themeLabel}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['dark', 'neon', 'light'] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => handleThemeChange(th)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: theme === th ? 'var(--primary)' : 'var(--surface-border)',
                    background: theme === th ? 'var(--surface)' : 'rgba(255,255,255,0.02)',
                    color: 'var(--foreground)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t.themes[th]}
                </button>
              ))}
            </div>
          </div>

          {/* Language & Currency */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.langLabel}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--foreground)',
                  padding: '10px',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              >
                <option value="en" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>English</option>
                <option value="ru" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>Русский</option>
                <option value="id" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>Bahasa Indonesia</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.currLabel}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--foreground)',
                  padding: '10px',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              >
                <option value="USD" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>USD ($)</option>
                <option value="IDR" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>IDR (Rp)</option>
                <option value="EUR" style={{ background: 'var(--surface)', color: 'var(--foreground)' }}>EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Card Management */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>{t.cardLabel}</h3>
            
            {cardBound ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6, display: 'block' }}>{t.cardBound}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}>{cardNumber}</span>
                </div>
                <button
                  onClick={handleUnbindCard}
                  style={{
                    background: 'none',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  {t.btnUnbind}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: '1rem' }}>{t.cardUnbound}</p>
                
                {isBinding ? (
                  <form onSubmit={handleBindCard} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newCardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                        if (formatted.length <= 19) setNewCardNumber(formatted);
                      }}
                      placeholder="0000 0000 0000 0000"
                      required
                      style={{
                        flex: 1,
                        background: 'var(--surface)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: 'var(--foreground)',
                        outline: 'none'
                      }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                      Add
                    </button>
                    <button type="button" onClick={() => setIsBinding(false)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setIsBinding(true)} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                    {t.btnBind}
                  </button>
                )}
              </div>
            )}
          </div>

          <button onClick={handleSave} className="btn-primary" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)' }}>
            {t.btnSave}
          </button>
        </div>
      </div>
    </div>
  );
}
