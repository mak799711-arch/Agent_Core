'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, businessRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import VerificationBadge from '@/app/components/VerificationBadge';

const translations = {
  en: {
    title: 'Settings',
    themeLabel: 'Theme',
    langLabel: 'Language',
    currLabel: 'Currency',
    cardLabel: 'Payment',
    cardUnbound: 'No card',
    btnUnbind: 'Unbind',
    btnBind: 'Add',
    btnSave: 'Save',
    success: 'Settings updated!',
    verificationTitle: 'Verification',
    verificationLock: 'Locked',
    btnApply: 'Request ✅',
    statusPending: 'Pending',
    statusVerified: 'Verified'
  },
  ru: {
    title: 'Настройки',
    themeLabel: 'Тема',
    langLabel: 'Язык',
    currLabel: 'Валюта',
    cardLabel: 'Оплата',
    cardUnbound: 'Нет карты',
    btnUnbind: 'Отвязать',
    btnBind: 'Добавить',
    btnSave: 'Сохранить',
    success: 'Сохранено!',
    verificationTitle: 'Верификация',
    verificationLock: 'Нужно 100+ сделок',
    btnApply: 'Заявка ✅',
    statusPending: 'На рассмотрении',
    statusVerified: 'Верифицирован'
  },
  id: {
    title: 'Pengaturan',
    themeLabel: 'Tema',
    langLabel: 'Bahasa',
    currLabel: 'Mata Uang',
    cardLabel: 'Pembayaran',
    cardUnbound: 'Tidak ada',
    btnUnbind: 'Lepaskan',
    btnBind: 'Tambah',
    btnSave: 'Simpan',
    success: 'Disimpan!',
    verificationTitle: 'Verifikasi',
    verificationLock: 'Butuh 100+ transaksi',
    btnApply: 'Minta ✅',
    statusPending: 'Tertunda',
    statusVerified: 'Terverifikasi'
  }
};

interface BusinessSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessSidebar({ isOpen, onClose }: BusinessSidebarProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<'ru' | 'en' | 'id' | 'zh' | 'es' | 'de' | 'fr'>('en');
  const [currency, setCurrency] = useState<'USD' | 'IDR' | 'EUR' | 'RUB' | 'CNY' | 'AUD' | 'SGD' | 'GBP' | 'JPY'>('USD');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [cardBound, setCardBound] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  
  const [newCardNumber, setNewCardNumber] = useState('');
  const [isBinding, setIsBinding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile specific
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Verification states
  const [dealsCount, setDealsCount] = useState(85);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified'>('none');

  const router = useRouter();
  const t = (translations as any)[lang] || translations.en;

  useEffect(() => {
    if (!isOpen) return;

    async function loadUser() {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'business') {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLang(currentUser.language);
        setCurrency(currentUser.currency);
        setCardBound(currentUser.cardBound);
        setCardNumber(currentUser.cardNumber || '');
        setAvatarUrl(currentUser.avatarUrl || '');
        
        let activeTheme = (localStorage.getItem('theme') as 'dark' | 'light' | null) || currentUser.theme as 'dark' | 'light';
        if (activeTheme !== 'dark' && activeTheme !== 'light') activeTheme = 'dark';
        setTheme(activeTheme);

        const isVerified = currentUser.status === 'verified';
        const isPending = currentUser.status === 'pending';
        
        const simulatedDeals = localStorage.getItem(`simulated_deals_${currentUser.id}`);
        if (simulatedDeals) {
          setDealsCount(parseInt(simulatedDeals));
        }

        if (isVerified) {
          setVerificationStatus('verified');
        } else if (isPending) {
          setVerificationStatus('pending');
        } else {
          setVerificationStatus('none');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [isOpen, router]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    setUploadingAvatar(true);
    try {
      const newAvatarUrl = await authService.uploadAvatar(user.id, file);
      setAvatarUrl(newAvatarUrl);
      await authService.updateProfile({ avatarUrl: newAvatarUrl });
    } catch (err) {
      alert('Error uploading avatar');
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
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

  const handleApplyVerification = async () => {
    if (!user) return;
    try {
      await authService.updateProfile({ status: 'pending' });
      setVerificationStatus('pending');
      alert(lang === 'ru' ? 'Заявка отправлена!' : 'Request submitted!');
    } catch (e) {
      alert('Error submitting request');
    }
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
      onClose();
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleLogout = async () => {
    const confirmMessage = lang === 'ru' ? "Вы точно хотите выйти из аккаунта?" : "Are you sure you want to log out?";
    if (!window.confirm(confirmMessage)) return;
    try {
      await authService.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Error logging out', err);
    }
  };

  // UI Styles for compact rows
  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--surface-border)'
  };

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)',
          zIndex: 999, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-in-out'
        }}
      />

      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: '320px', maxWidth: '85vw', 
        background: 'var(--background)',
        borderRight: '1px solid var(--surface-border)',
        zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
        overflowY: 'auto', overflowX: 'hidden'
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--background)', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{t.title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Loading...</div>
          ) : (
            <>
              {/* Profile Icon Only */}
              <div style={{ ...rowStyle, justifyContent: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <img src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Avatar" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
                  <label style={{
                    position: 'absolute', bottom: -2, right: -2, background: 'var(--primary)', color: '#000',
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', opacity: uploadingAvatar ? 0.5 : 1
                  }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    <span style={{ fontSize: '16px' }}>{uploadingAvatar ? '⏳' : '📷'}</span>
                  </label>
                </div>
              </div>

              {/* Theme Toggle */}
              <div style={rowStyle}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.themeLabel}</span>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: '48px', height: '26px', background: theme === 'dark' ? 'var(--primary)' : 'rgba(128,128,128,0.3)', borderRadius: '13px', transition: 'background 0.3s' }}>
                    <div style={{ position: 'absolute', top: '2px', left: theme === 'dark' ? '24px' : '2px', width: '22px', height: '22px', background: '#fff', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                  </div>
                  <input type="checkbox" style={{ display: 'none' }} checked={theme === 'dark'} onChange={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')} />
                </label>
              </div>

              {/* Language */}
              <div style={rowStyle}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.langLabel}</span>
                <select className="input-field" value={lang} onChange={(e) => setLang(e.target.value as any)} style={{ padding: '6px 8px', fontSize: '0.85rem', width: 'auto', minWidth: '120px', background: 'transparent', border: 'none', textAlign: 'right', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', outline: 'none', appearance: 'none' }}>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="id">Indonesia</option>
                </select>
              </div>

              {/* Currency */}
              <div style={rowStyle}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.currLabel}</span>
                <select className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value as any)} style={{ padding: '6px 8px', fontSize: '0.85rem', width: 'auto', minWidth: '120px', background: 'transparent', border: 'none', textAlign: 'right', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', outline: 'none', appearance: 'none' }}>
                  <option value="USD">USD ($)</option>
                  <option value="IDR">IDR (Rp)</option>
                  <option value="RUB">RUB (₽)</option>
                </select>
              </div>

              {/* Verification (Circle Icon) */}
              <div style={{ ...rowStyle, justifyContent: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  background: verificationStatus === 'verified' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 170, 0, 0.15)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                  border: `2px solid ${verificationStatus === 'verified' ? 'var(--success)' : 'var(--warning)'}`
                }}>
                  {verificationStatus === 'verified' ? '✅' : '⏳'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.verificationTitle}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '2px' }}>
                    {verificationStatus === 'verified' ? t.statusVerified : verificationStatus === 'pending' ? t.statusPending : `${dealsCount}/100 deals`}
                  </div>
                </div>
                {verificationStatus === 'none' && dealsCount >= 100 && (
                  <button onClick={handleApplyVerification} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{t.btnApply}</button>
                )}
              </div>

              {/* Payment Card */}
              <div style={{ ...rowStyle, justifyContent: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '2rem', width: '44px', textAlign: 'center' }}>💳</div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.cardLabel}</div>
                  {cardBound ? (
                    <div style={{ fontSize: '0.95rem', fontFamily: 'monospace', letterSpacing: '1px', marginTop: '2px' }}>{cardNumber}</div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '2px' }}>{t.cardUnbound}</div>
                  )}
                </div>
                {cardBound ? (
                  <button onClick={handleUnbindCard} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>{t.btnUnbind}</button>
                ) : (
                  <button onClick={() => setIsBinding(!isBinding)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>{t.btnBind}</button>
                )}
                
                {isBinding && !cardBound && (
                  <div style={{ width: '100%', display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input className="input-field" type="text" value={newCardNumber} onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewCardNumber(val.replace(/(\d{4})(?=\d)/g, '$1 ').trim());
                    }} placeholder="0000 0000 0000 0000" style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }} />
                    <button onClick={handleBindCard} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>OK</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '1rem', background: 'var(--background)' }}>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700 }}>
            {t.btnSave}
          </button>

          <button onClick={handleLogout} style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--error)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            🚪
          </button>
        </div>
      </div>
    </>
  );
}
