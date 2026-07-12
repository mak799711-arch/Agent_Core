'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, businessRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import VerificationBadge from '@/app/components/VerificationBadge';

const translations = {
  en: {
    title: 'Profile Settings',
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
    themes: { dark: 'Dark', light: 'Light' },
    verificationTitle: 'Verification Status',
    verificationLock: 'Verification is locked. Complete 100+ deals to apply.',
    verificationCurrent: 'Completed Deals Progress',
    btnSimulate: 'Simulate 105 Deals',
    btnApply: 'Request Verification',
    statusPending: 'Verification request is pending review.',
    statusVerified: 'Your profile is officially verified!',
    posTitle: 'POS Integration (Loyverse)',
    posDesc: 'Connect your Loyverse POS system to automate promoter rewards. Download the connector helper extension, generate a Backoffice API token, and copy your webhook URL.',
    posBtnDownload: 'Download Connector (.zip)',
    posTokenLabel: 'Loyverse Backoffice API Token',
    posTokenPlaceholder: 'Enter your Backoffice API token',
    posWebhookLabel: 'Webhook Callback URL',
    posCopyWebhook: 'Copy Webhook',
    posWebhookCopied: 'Webhook URL copied!',
    posStatusConnected: 'Connected',
    posStatusDisconnected: 'Not Connected'
  },
  ru: {
    title: 'Настройки',
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
    themes: { dark: 'Тёмная', light: 'Светлая' },
    verificationTitle: 'Статус верификации',
    verificationLock: 'Верификация закрыта. Требуется 100+ завершенных сделок.',
    verificationCurrent: 'Прогресс завершенных сделок',
    btnSimulate: 'Симулировать 105 сделок',
    btnApply: 'Подать заявку на верификацию ✅',
    statusPending: 'Ваша заявка находится на рассмотрении.',
    statusVerified: 'Ваш профиль официально верифицирован!',
    posTitle: 'Интеграция с POS (Loyverse)',
    posDesc: 'Подключите Loyverse POS для автоматизации выплат промоутерам. Скачайте плагин-коннектор, вставьте API-токен Backoffice и скопируйте webhook-ссылку.',
    posBtnDownload: 'Скачать коннектор (.zip)',
    posTokenLabel: 'Токен Loyverse Backoffice API',
    posTokenPlaceholder: 'Введите токен Loyverse Backoffice API',
    posWebhookLabel: 'Webhook URL для обратного вызова',
    posCopyWebhook: 'Копировать Webhook',
    posWebhookCopied: 'Webhook скопирован!',
    posStatusConnected: 'Подключено',
    posStatusDisconnected: 'Не подключено'
  },
  id: {
    title: 'Pengaturan Profil',
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
    themes: { dark: 'Gelap', light: 'Terang' },
    verificationTitle: 'Status Verifikasi',
    verificationLock: 'Verifikasi terkunci. Selesaikan 100+ transaksi untuk melamar.',
    verificationCurrent: 'Kemajuan Transaksi Selesai',
    btnSimulate: 'Simulasikan 105 Transaksi',
    btnApply: 'Kirim Permohonan Verifikasi ✅',
    statusPending: 'Permohonan verifikasi Anda sedang ditinjau.',
    statusVerified: 'Profil Anda telah resmi diverifikasi!',
    posTitle: 'Integrasi POS (Loyverse)',
    posDesc: 'Hubungkan sistem Loyverse POS Anda untuk otomatisasi komisi promotor. Unduh ekstensi konektor, buat token API Backoffice, dan salin URL webhook Anda.',
    posBtnDownload: 'Unduh Konektor (.zip)',
    posTokenLabel: 'Token API Loyverse Backoffice',
    posTokenPlaceholder: 'Masukkan token API Backoffice Anda',
    posWebhookLabel: 'URL Callback Webhook',
    posCopyWebhook: 'Salin Webhook',
    posWebhookCopied: 'URL Webhook disalin!',
    posStatusConnected: 'Terhubung',
    posStatusDisconnected: 'Belum Terhubung'
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
  const [bio, setBio] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Venue specific
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // Verification states
  const [dealsCount, setDealsCount] = useState(85);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified'>('none');

  const router = useRouter();
  const t = (translations as any)[lang] || translations.en;

  // Load user data whenever sidebar is opened
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
        setBio(currentUser.bio || '');
        
        let activeTheme = (localStorage.getItem('theme') as 'dark' | 'light' | null) || currentUser.theme as 'dark' | 'light';
        if (activeTheme !== 'dark' && activeTheme !== 'light') activeTheme = 'dark';
        setTheme(activeTheme);

        const isVerified = currentUser.status === 'verified';
        const isPending = currentUser.status === 'pending';

        const bus = await businessRepository.getBusinessByOwnerId(currentUser.id);
        if (bus) {
          setBusinessId(bus.id);
          setLat(bus.latitude);
          setLng(bus.longitude);
          setAddress(bus.address);
        }
        
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

  // Prevent background scrolling when open
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
      alert(lang === 'ru' ? 'Заявка на верификацию отправлена!' : 'Verification request submitted!');
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
        bio,
        cardNumber: cardBound ? cardNumber : null
      });
      
      if (businessId) {
        await businessRepository.updateBusiness(businessId, { 
          latitude: lat, 
          longitude: lng, 
          address: address || '' 
        });
      }

      alert(t.success);
      onClose(); // Close sidebar on save
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

  return (
    <>
      {/* Sidebar Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-in-out'
        }}
      />

      {/* Sidebar Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '400px', // Wider sidebar for settings
        maxWidth: '100vw', 
        background: 'var(--background)',
        borderRight: '1px solid var(--surface-border)',
        zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
        overflowY: 'auto', // Scrollable content
        overflowX: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--background)', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t.title}
            {verificationStatus === 'verified' && <VerificationBadge size={18} />}
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '2rem' }}>
               <p style={{ opacity: 0.5 }}>Loading...</p>
             </div>
          ) : (
            <>
              {/* Profile Info (Avatar & Bio) */}
              <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.2rem' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                    <label style={{
                      position: 'absolute', bottom: -5, right: -5, background: 'var(--primary)', color: '#000',
                      width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', opacity: uploadingAvatar ? 0.5 : 1
                    }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                      <span style={{ fontSize: '12px' }}>{uploadingAvatar ? '⏳' : '📷'}</span>
                    </label>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>О себе (Bio) / Название</label>
                    <textarea 
                      className="input-field" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      placeholder={lang === 'ru' ? "Кратко о заведении..." : "Brief info about your venue..."}
                      style={{ width: '100%', minHeight: '70px', resize: 'vertical', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'var(--foreground)', padding: '10px', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Theme Switcher */}
              <div className="panel" style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.themeLabel}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['dark', 'light'] as const).map((th) => (
                    <button
                      key={th}
                      onClick={() => handleThemeChange(th)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: theme === th ? 'var(--primary)' : 'var(--surface-border)',
                        background: theme === th ? 'var(--primary-glow)' : 'rgba(255,255,255,0.01)',
                        color: 'var(--foreground)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {t.themes[th]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language & Currency */}
              <div className="panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.langLabel}</label>
                  <select
                    className="input-field"
                    value={lang}
                    onChange={(e) => setLang(e.target.value as any)}
                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="id">Indonesia</option>
                    <option value="zh">中文</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.currLabel}</label>
                  <select
                    className="input-field"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
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
              <div className="panel" style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.verificationTitle}</h3>
                
                {verificationStatus === 'verified' && (
                  <div style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <VerificationBadge size={18} /> {t.statusVerified}
                  </div>
                )}

                {verificationStatus === 'pending' && (
                  <div style={{ color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    ⏳ {t.statusPending}
                  </div>
                )}

                {verificationStatus === 'none' && (
                  <div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem', fontWeight: 500, lineHeight: 1.4 }}>
                      {dealsCount < 100 ? t.verificationLock : 'Congratulations! You qualify for verification.'}
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 700 }}>
                        <span>{t.verificationCurrent}</span>
                        <span style={{ color: 'var(--primary)' }}>{dealsCount}/100</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((dealsCount / 100) * 100, 100)}%`, height: '100%', background: dealsCount >= 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {dealsCount < 100 ? (
                        <button disabled className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--surface-border)', color: '#666', cursor: 'not-allowed', boxShadow: 'none' }}>
                          🔒 {t.btnApply}
                        </button>
                      ) : (
                        <button onClick={handleApplyVerification} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--success) 0%, #10b981 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)' }}>
                          {t.btnApply}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Management */}
              <div className="panel" style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>{t.cardLabel}</h3>
                
                {cardBound ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block', marginBottom: '4px', fontWeight: 700 }}>{t.cardBound.toUpperCase()}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1.5px', fontFamily: 'monospace' }}>{cardNumber}</span>
                    </div>
                    <button
                      onClick={handleUnbindCard}
                      style={{ background: 'none', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--error)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      {t.btnUnbind}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.85rem', opacity: 0.5, marginBottom: '1rem', fontWeight: 500 }}>{t.cardUnbound}</p>
                    
                    {isBinding ? (
                      <form onSubmit={handleBindCard} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          className="input-field"
                          type="text"
                          value={newCardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                            if (formatted.length <= 19) setNewCardNumber(formatted);
                          }}
                          placeholder="0000 0000 0000 0000"
                          required
                          style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Add</button>
                        <button type="button" onClick={() => setIsBinding(false)} className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', boxShadow: 'none' }}>Cancel</button>
                      </form>
                    ) : (
                      <button onClick={() => setIsBinding(true)} className="btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}>
                        {t.btnBind}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)', background: 'var(--background)', position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={handleSave} className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '0.9rem' }}>
            {t.btnSave}
          </button>

          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.15)', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
            🚪 Logout / Выйти
          </button>
        </div>
      </div>
    </>
  );
}
