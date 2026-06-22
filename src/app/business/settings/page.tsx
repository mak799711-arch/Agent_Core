'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import VerificationBadge from '@/app/components/VerificationBadge';

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
    themes: { dark: 'Dark', light: 'Light', neon: 'Neon' },
    verificationTitle: 'Verification Status',
    verificationLock: 'Verification is locked. Complete 100+ deals to apply.',
    verificationCurrent: 'Completed Deals Progress',
    btnSimulate: 'Simulate 105 Deals',
    btnApply: 'Request Verification ✅',
    statusPending: 'Verification request is pending review.',
    statusVerified: 'Your profile is officially verified!'
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
    themes: { dark: 'Тёмная', light: 'Светлая', neon: 'Неоновая' },
    verificationTitle: 'Статус верификации',
    verificationLock: 'Верификация закрыта. Требуется 100+ завершенных сделок.',
    verificationCurrent: 'Прогресс завершенных сделок',
    btnSimulate: 'Симулировать 105 сделок',
    btnApply: 'Подать заявку на верификацию ✅',
    statusPending: 'Ваша заявка находится на рассмотрении.',
    statusVerified: 'Ваш профиль официально верифицирован!'
  },
  id: {
    title: 'Pengaturan Profil',
    back: '← Kembali ke Dasbor',
    themeLabel: 'Tema Tampilan',
    langLabel: 'Bahasa',
    currLabel: 'Mata Uang',
    cardLabel: 'Metode Pembayaran',
    cardBound: 'Kartu Pengiriman',
    cardUnbound: 'Tidak ada kartu terikat. Pembayaran ditangguhkan.',
    btnUnbind: 'Lepaskan Kartu',
    btnBind: 'Ikatkan Kartu Baru',
    btnSave: 'Simpan Perubahan',
    success: 'Pengaturan berhasil diperbarui!',
    themes: { dark: 'Gelap', light: 'Terang', neon: 'Neon' },
    verificationTitle: 'Status Verifikasi',
    verificationLock: 'Verifikasi terkunci. Selesaikan 100+ transaksi untuk melamar.',
    verificationCurrent: 'Kemajuan Transaksi Selesai',
    btnSimulate: 'Simulasikan 105 Transaksi',
    btnApply: 'Kirim Permohonan Verifikasi ✅',
    statusPending: 'Permohonan verifikasi Anda sedang ditinjau.',
    statusVerified: 'Profil Anda telah resmi diverifikasi!'
  }
};

export default function BusinessSettings() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<'ru' | 'en' | 'id' | 'zh' | 'es' | 'de' | 'fr'>('en');
  const [currency, setCurrency] = useState<'USD' | 'IDR' | 'EUR' | 'RUB' | 'CNY' | 'AUD' | 'SGD' | 'GBP' | 'JPY'>('USD');
  const [theme, setTheme] = useState<'dark' | 'neon' | 'light'>('neon');
  const [cardBound, setCardBound] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  
  const [newCardNumber, setNewCardNumber] = useState('');
  const [isBinding, setIsBinding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verification states
  const [dealsCount, setDealsCount] = useState(85);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified'>('none');

  const router = useRouter();
  const t = (translations as any)[lang] || translations.en;

  useEffect(() => {
    async function loadUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'business') {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLang(currentUser.language);
        setCurrency(currentUser.currency);
        setCardBound(currentUser.cardBound);
        setCardNumber(currentUser.cardNumber || '');
        
        const activeTheme = (localStorage.getItem('theme') as 'dark' | 'neon' | 'light' | null) || currentUser.theme;
        setTheme(activeTheme);

        // Load verification status from mock and localStorage
        const isVerified = currentUser.status === 'verified';
        const hasPendingRequest = localStorage.getItem(`verification_requested_${currentUser.id}`) === 'true';
        const simulatedDeals = localStorage.getItem(`simulated_deals_${currentUser.id}`);
        
        if (simulatedDeals) {
          setDealsCount(parseInt(simulatedDeals));
        }

        if (isVerified) {
          setVerificationStatus('verified');
        } else if (hasPendingRequest) {
          setVerificationStatus('pending');
        } else {
          setVerificationStatus('none');
        }
      }
      setLoading(false);
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSimulateDeals = () => {
    if (!user) return;
    setDealsCount(105);
    localStorage.setItem(`simulated_deals_${user.id}`, '105');
  };

  const handleApplyVerification = () => {
    if (!user) return;
    localStorage.setItem(`verification_requested_${user.id}`, 'true');
    setVerificationStatus('pending');
    alert(lang === 'ru' ? 'Заявка на верификацию отправлена!' : 'Verification request submitted!');
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
      if (!cardBound) {
        router.push('/onboarding');
      } else {
        router.push('/business');
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid rgba(34, 211, 238, 0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>Loading Settings...</p>
          <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      color: 'var(--foreground)',
      padding: '3rem 2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background light */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'var(--ambient-glow)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        top: '10%',
        left: '15%',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Back Link */}
        <a href="/business" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 700 }}>
          {t.back}
        </a>

        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.8px' }}>
          {t.title}
          {verificationStatus === 'verified' && <VerificationBadge size={22} />}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Theme Switcher */}
          <div className="glass-panel" style={{ padding: '1.8rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.themeLabel}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['dark', 'neon', 'light'] as const).map((th) => (
                <button
                  key={th}
                  onClick={() => handleThemeChange(th)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: theme === th ? 'var(--primary)' : 'var(--surface-border)',
                    background: theme === th ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)',
                    color: 'var(--foreground)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {t.themes[th]}
                </button>
              ))}
            </div>
          </div>

          {/* Language & Currency */}
          <div className="glass-panel" style={{ padding: '1.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.langLabel}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                style={{
                  width: '100%'
                }}
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
                <option value="id">Bahasa Indonesia</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="es">Español (Spanish)</option>
                <option value="de">Deutsch (German)</option>
                <option value="fr">Français (French)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.currLabel}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                style={{
                  width: '100%'
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="IDR">IDR (Rp)</option>
                <option value="EUR">EUR (€)</option>
                <option value="RUB">RUB (₽)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="SGD">SGD (S$)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Verification Progress Box */}
          <div className="glass-panel" style={{ padding: '1.8rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.2rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.verificationTitle}</h3>
            
            {verificationStatus === 'verified' && (
              <div style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                <VerificationBadge size={20} /> {t.statusVerified}
              </div>
            )}

            {verificationStatus === 'pending' && (
              <div style={{ color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                ⏳ {t.statusPending}
              </div>
            )}

            {verificationStatus === 'none' && (
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.2rem', fontWeight: 500, lineHeight: 1.5 }}>
                  {dealsCount < 100 ? t.verificationLock : 'Congratulations! You qualify for verification.'}
                </p>

                {/* Progress bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px', fontWeight: 700 }}>
                    <span>{t.verificationCurrent}</span>
                    <span style={{ color: 'var(--primary)' }}>{dealsCount}/100</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((dealsCount / 100) * 100, 100)}%`, height: '100%', background: dealsCount >= 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {dealsCount < 100 ? (
                    <button
                      onClick={handleSimulateDeals}
                      className="btn-primary"
                      style={{
                        padding: '10px 18px',
                        fontSize: '0.85rem',
                        background: 'rgba(34, 211, 238, 0.08)',
                        border: '1px solid var(--primary)',
                        boxShadow: 'none'
                      }}
                    >
                      ⚡ {t.btnSimulate}
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyVerification}
                      className="btn-primary"
                      style={{
                        background: 'linear-gradient(135deg, var(--success) 0%, #10b981 100%)',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      {t.btnApply}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card Management */}
          <div className="glass-panel" style={{ padding: '1.8rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.2rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.cardLabel}</h3>
            
            {cardBound ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '1.2rem 1.5rem', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginBottom: '4px', fontWeight: 700 }}>{t.cardBound.toUpperCase()}</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace' }}>{cardNumber}</span>
                </div>
                <button
                  onClick={handleUnbindCard}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: 'var(--error)',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
                    e.currentTarget.style.borderColor = 'var(--error)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
                  }}
                >
                  {t.btnUnbind}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: '1.2rem', fontWeight: 500 }}>{t.cardUnbound}</p>
                
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
                        flex: 1
                      }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                      Add
                    </button>
                    <button type="button" onClick={() => setIsBinding(false)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--surface-border)', boxShadow: 'none' }}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setIsBinding(true)} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                    {t.btnBind}
                  </button>
                )}
              </div>
            )}
          </div>

          <button onClick={handleSave} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)', boxShadow: '0 4px 14px rgba(34, 211, 238, 0.15)' }}>
            {t.btnSave}
          </button>
        </div>
      </div>
    </div>
  );
}
