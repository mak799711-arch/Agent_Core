'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, offerRepository, referralRepository, walletRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { Offer } from '@/lib/interfaces/offers';
import { formatCurrency } from '@/lib/utils/currency';
import VerificationBadge from '@/app/components/VerificationBadge';
import { Transaction } from '@/lib/interfaces/wallet';

const translations = {
  en: {
    venue: 'Venue Manager',
    exit: 'Exit',
    settings: 'Settings ⚙️',
    balanceLabel: 'Active Reserve Balance',
    depositBtn: 'Deposit $100',
    reserveNote: '🔒 Reserve Protection Active: Offers will automatically de-activate if reward amount exceeds your current reserve balance.',
    attributeTitle: 'Attribute Referral Code',
    verifyBtn: 'Verify & Pay',
    offersTitle: 'Your Active Offers',
    rewardLabel: 'Reward',
    statusActive: 'ACTIVE',
    statusPaused: 'PAUSED (Low Balance)',
    noOffers: 'No offers created yet',
    createTitle: 'Create New Offer',
    offerTitleLabel: 'Offer Title',
    offerTitlePlaceholder: 'e.g. Special Promotion',
    categoryLabel: 'Category',
    rewardTypeLabel: 'Reward Type',
    fixedReward: 'Fixed Amount',
    percentageReward: 'Percentage of Bill',
    rewardAmountLabel: 'Promoter Reward Amount (in USD)',
    avgBillLabel: 'Average Bill (in USD)',
    percentLabel: 'Reward Percentage (%)',
    conditionsLabel: 'Conditions / Description',
    conditionsPlaceholder: 'Describe conversion terms (e.g. purchase of main dish is required)',
    createBtn: 'Create Offer',
    cancelBtn: 'Cancel',
    codeError: 'Active referral code not found or expired',
    offerError: 'Offer not found',
    balanceError: 'Insufficient reserve balance to pay the reward',
    balanceErrorCreate: 'Insufficient reserve balance to cover the reward. Please deposit funds first.',
    successPrefix: 'Referral confirmed!',
    depositSuccess: 'successfully added to your reserve balance.',
    loading: 'Loading Business Portal...'
  },
  ru: {
    venue: 'Менеджер заведения',
    exit: 'Выйти',
    settings: 'Настройки ⚙️',
    balanceLabel: 'Активный баланс резерва',
    depositBtn: 'Пополнить на $100',
    reserveNote: '🔒 Защита резервов активна: офферы автоматически отключаются, если сумма награды превышает текущий баланс резерва.',
    attributeTitle: 'Подтвердить реферальный код',
    verifyBtn: 'Проверить и выплатить',
    offersTitle: 'Ваши активные предложения',
    rewardLabel: 'Награда',
    statusActive: 'АКТИВЕН',
    statusPaused: 'ПАУЗА (Низкий баланс)',
    noOffers: 'Офферы еще не созданы',
    createTitle: 'Создать новое предложение',
    offerTitleLabel: 'Название предложения',
    offerTitlePlaceholder: 'например, Специальное предложение',
    categoryLabel: 'Категория',
    rewardTypeLabel: 'Тип вознаграждения',
    fixedReward: 'Фиксированная сумма',
    percentageReward: 'Процент от чека',
    rewardAmountLabel: 'Сумма награды промоутеру (в USD)',
    avgBillLabel: 'Средний чек (в USD)',
    percentLabel: 'Процент вознаграждения (%)',
    conditionsLabel: 'Условия / Описание',
    conditionsPlaceholder: 'Опишите условия конверсии (например, обязательна покупка горячего блюда)',
    createBtn: 'Создать предложение',
    cancelBtn: 'Отмена',
    codeError: 'Активный реферальный код не найден или истек',
    offerError: 'Предложение не найдено',
    balanceError: 'Недостаточно средств в резерве для выплаты награды',
    balanceErrorCreate: 'Недостаточно средств на балансе резерва для создания предложения. Пожалуйста, пополните баланс.',
    successPrefix: 'Реферал подтвержден!',
    depositSuccess: 'успешно добавлено к вашему балансу резерва.',
    loading: 'Загрузка портала бизнеса...'
  },
  id: {
    venue: 'Manajer Tempat',
    exit: 'Keluar',
    settings: 'Pengaturan ⚙️',
    balanceLabel: 'Saldo Cadangan Aktif',
    depositBtn: 'Setor $100',
    reserveNote: '🔒 Perlindungan Cadangan Aktif: Penawaran akan dinonaktifkan secara otomatis jika jumlah hadiah melebihi saldo cadangan Anda saat ini.',
    attributeTitle: 'Atribusikan Kode Rujukan',
    verifyBtn: 'Verifikasi & Bayar',
    offersTitle: 'Penawaran Aktif Anda',
    rewardLabel: 'Hadiah',
    statusActive: 'AKTIF',
    statusPaused: 'DITANGGUHKAN (Saldo Rendah)',
    noOffers: 'Belum ada penawaran yang dibuat',
    createTitle: 'Buat Penawaran Baru',
    offerTitleLabel: 'Judul Penawaran',
    offerTitlePlaceholder: 'mis. Promosi Spesial',
    categoryLabel: 'Kategori',
    rewardTypeLabel: 'Jenis Hadiah',
    fixedReward: 'Jumlah Tetap',
    percentageReward: 'Persentase Tagihan',
    rewardAmountLabel: 'Jumlah Hadiah Promotor (dalam USD)',
    avgBillLabel: 'Rata-rata Tagihan (dalam USD)',
    percentLabel: 'Persentase Hadiah (%)',
    conditionsLabel: 'Kondisi / Deskripsi',
    conditionsPlaceholder: 'Jelaskan persyaratan konversi (misalnya, pembelian hidangan utama diperlukan)',
    createBtn: 'Buat Penawaran',
    cancelBtn: 'Batal',
    codeError: 'Kode rujukan aktif tidak ditemukan atau kedaluwarsa',
    offerError: 'Penawaran tidak ditemukan',
    balanceError: 'Saldo cadangan tidak mencukupi untuk membayar hadiah',
    balanceErrorCreate: 'Saldo cadangan tidak mencukupi untuk membuat penawaran ini. Silakan setor dana terlebih dahulu.',
    successPrefix: 'Rujukan dikonfirmasi!',
    depositSuccess: 'berhasil ditambahkan ke saldo cadangan Anda.',
    loading: 'Memuat Panel Bisnis...'
  },
  zh: {
    venue: '商户经理',
    exit: '退出',
    settings: '设置 ⚙️',
    balanceLabel: '活跃准备金余额',
    depositBtn: '充值 $100',
    reserveNote: '🔒 准备金保护已激活：如果奖励金额超过当前准备金余额，优惠将自动停用。',
    attributeTitle: '验证推荐码',
    verifyBtn: '核销并支付',
    offersTitle: '您的活跃优惠',
    rewardLabel: '奖励',
    statusActive: '活跃',
    statusPaused: '已暂停 (余额不足)',
    noOffers: '暂无优惠活动',
    createTitle: '创建新优惠',
    offerTitleLabel: '优惠标题',
    offerTitlePlaceholder: '例如：特别促销',
    categoryLabel: '类别',
    rewardTypeLabel: '奖励类型',
    fixedReward: '固定金额',
    percentageReward: '账单百分比',
    rewardAmountLabel: '推广员奖励金额 (USD)',
    avgBillLabel: '平均账单金额 (USD)',
    percentLabel: '奖励百分比 (%)',
    conditionsLabel: '条款与描述',
    conditionsPlaceholder: '描述核销条件 (例如：必须点主菜)',
    createBtn: '创建优惠',
    cancelBtn: '取消',
    codeError: '未找到活跃推荐码或已过期',
    offerError: '优惠未找到',
    balanceError: '准备金余额不足，无法支付奖励',
    balanceErrorCreate: '准备金余额不足，无法创建优惠。请先充值。',
    successPrefix: '推荐核销成功！',
    depositSuccess: '已成功存入您的准备金余额。',
    loading: '正在加载商户门户...'
  },
  es: {
    venue: 'Gerente del Lugar',
    exit: 'Salir',
    settings: 'Ajustes ⚙️',
    balanceLabel: 'Saldo de Reserva Activo',
    depositBtn: 'Depositar $100',
    reserveNote: '🔒 Protección de Reserva Activa: Las ofertas se desactivarán automáticamente si la recompensa excede el saldo de reserva.',
    attributeTitle: 'Atribuir Código de Referido',
    verifyBtn: 'Verificar y Pagar',
    offersTitle: 'Sus Ofertas Activas',
    rewardLabel: 'Recompensa',
    statusActive: 'ACTIVO',
    statusPaused: 'PAUSADO (Saldo Bajo)',
    noOffers: 'Aún no hay ofertas creadas',
    createTitle: 'Crear Nueva Oferta',
    offerTitleLabel: 'Título de la Oferta',
    offerTitlePlaceholder: 'ej. Promoción Especial',
    categoryLabel: 'Categoría',
    rewardTypeLabel: 'Tipo de Recompensa',
    fixedReward: 'Monto Fijo',
    percentageReward: 'Porcentaje de la Cuenta',
    rewardAmountLabel: 'Monto de Recompensa al Promotor (en USD)',
    avgBillLabel: 'Cuenta Promedio (en USD)',
    percentLabel: 'Porcentaje de Recompensa (%)',
    conditionsLabel: 'Condiciones / Descripción',
    conditionsPlaceholder: 'Describa los términos (ej. se requiere plato principal)',
    createBtn: 'Crear Oferta',
    cancelBtn: 'Cancelar',
    codeError: 'Código de referido no encontrado o expirado',
    offerError: 'Oferta no encontrada',
    balanceError: 'Saldo de reserva insuficiente para pagar la recompensa',
    balanceErrorCreate: 'Saldo de reserva insuficiente para crear la oferta. Deposite fondos primero.',
    successPrefix: '¡Referido confirmado!',
    depositSuccess: 'añadido con éxito a su saldo de reserva.',
    loading: 'Cargando Portal de Negocios...'
  },
  de: {
    venue: 'Veranstaltungsort-Manager',
    exit: 'Beenden',
    settings: 'Einstellungen ⚙️',
    balanceLabel: 'Aktives Reserveguthaben',
    depositBtn: '100 $ einzahlen',
    reserveNote: '🔒 Reserveschutz aktiv: Angebote werden automatisch deaktiviert, wenn die Belohnung Ihr Guthaben übersteigt.',
    attributeTitle: 'Empfehlungscode zuordnen',
    verifyBtn: 'Verifizieren & Bezahlen',
    offersTitle: 'Ihre aktiven Angebote',
    rewardLabel: 'Belohnung',
    statusActive: 'AKTIV',
    statusPaused: 'PAUSIERT (Wenig Guthaben)',
    noOffers: 'Noch keine Angebote erstellt',
    createTitle: 'Neues Angebot erstellen',
    offerTitleLabel: 'Angebotstitel',
    offerTitlePlaceholder: 'z. B. Sonderaktion',
    categoryLabel: 'Kategorie',
    rewardTypeLabel: 'Belohnungstyp',
    fixedReward: 'Fester Betrag',
    percentageReward: 'Prozent der Rechnung',
    rewardAmountLabel: 'Promoter-Belohnungsbetrag (in USD)',
    avgBillLabel: 'Durchschnittliche Rechnung (in USD)',
    percentLabel: 'Belohnungsprozentsatz (%)',
    conditionsLabel: 'Bedingungen / Beschreibung',
    conditionsPlaceholder: 'Bedingungen beschreiben (z. B. Hauptgericht erforderlich)',
    createBtn: 'Angebot erstellen',
    cancelBtn: 'Abbrechen',
    codeError: 'Aktiver Empfehlungscode nicht gefunden oder abgelaufen',
    offerError: 'Angebot nicht gefunden',
    balanceError: 'Ungenügendes Reserveguthaben für die Belohnung',
    balanceErrorCreate: 'Ungenügendes Reserveguthaben für dieses Angebot. Bitte zuerst einzahlen.',
    successPrefix: 'Empfehlung bestätigt!',
    depositSuccess: 'erfolgreich Ihrem Reserveguthaben gutgeschrieben.',
    loading: 'Business-Portal wird geladen...'
  },
  fr: {
    venue: 'Gérant de l\'Établissement',
    exit: 'Quitter',
    settings: 'Paramètres ⚙️',
    balanceLabel: 'Solde de Réserve Actif',
    depositBtn: 'Déposer 100 $',
    reserveNote: '🔒 Protection de Réserve Active : Les offres seront désactivées si la récompense dépasse le solde.',
    attributeTitle: 'Attribuer Code de Parrainage',
    verifyBtn: 'Vérifier & Payer',
    offersTitle: 'Vos Offres Actives',
    rewardLabel: 'Récompense',
    statusActive: 'ACTIF',
    statusPaused: 'PAUSÉ (Solde Bas)',
    noOffers: 'Aucune offre créée',
    createTitle: 'Créer une Offre',
    offerTitleLabel: 'Titre de l\'Offre',
    offerTitlePlaceholder: 'ex. Promotion Spéciale',
    categoryLabel: 'Catégorie',
    rewardTypeLabel: 'Type de Récompense',
    fixedReward: 'Montant Fixe',
    percentageReward: 'Pourcentage de l\'Addition',
    rewardAmountLabel: 'Montant de Récompense (en USD)',
    avgBillLabel: 'Addition Moyenne (en USD)',
    percentLabel: 'Pourcentage de Récompensa (%)',
    conditionsLabel: 'Conditions / Description',
    conditionsPlaceholder: 'Décrivez les termes (ex. plat principal requis)',
    createBtn: 'Créer l\'Offre',
    cancelBtn: 'Annuler',
    codeError: 'Code de parrainage non trouvé ou expiré',
    offerError: 'Offre non trouvée',
    balanceError: 'Solde de réserve insuffisant pour payer la récompense',
    balanceErrorCreate: 'Solde de réserve insuffisant pour créer l\'offre. Veuillez déposer des fonds.',
    successPrefix: 'Parrainage confirmé !',
    depositSuccess: 'ajouté avec succès à votre solde de réserve.',
    loading: 'Chargement du Portail Entreprise...'
  }
};

export default function BusinessDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [shortCode, setShortCode] = useState('');
  const [history, setHistory] = useState<Transaction[]>([]);
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferCategory, setNewOfferCategory] = useState<'nightlife' | 'restaurant' | 'villa' | 'activity'>('restaurant');
  const [rewardType, setRewardType] = useState<'fixed' | 'percentage'>('fixed');
  const [newOfferReward, setNewOfferReward] = useState('');
  const [newOfferPercent, setNewOfferPercent] = useState('');
  const [newOfferAvgBill, setNewOfferAvgBill] = useState('');
  const [newOfferConditions, setNewOfferConditions] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const lang = user?.language || 'en';
  const t = translations[lang];

  const refreshData = async (userId: string) => {
    const bal = await walletRepository.getBalance(userId);
    setBalance(bal);

    const businessOffers = await offerRepository.getOffers({ businessId: userId });
    
    // Reserve Protection Layer Logic:
    const updatedOffers = await Promise.all(businessOffers.map(async (offer) => {
      const isBalanceSufficient = bal >= offer.rewardAmount;
      if (offer.isActive !== isBalanceSufficient) {
        return await offerRepository.updateOffer(offer.id, { isActive: isBalanceSufficient });
      }
      return offer;
    }));

    setOffers(updatedOffers);

    const txs = await walletRepository.getTransactions(userId);
    setHistory(txs.slice().reverse());
  };

  useEffect(() => {
    async function loadData() {
      try {
        let currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'business') {
          await authService.signIn('business@agent.core', 'password123');
          currentUser = await authService.getCurrentUser();
        }

        if (currentUser) {
          if (!currentUser.cardBound) {
            router.push('/onboarding');
            return;
          }

          setUser(currentUser);
          
          const activeTheme = localStorage.getItem('theme') || currentUser.theme;
          document.documentElement.setAttribute('data-theme', activeTheme);

          await refreshData(currentUser.id);
        }
      } catch (err) {
        console.error('Error loading business dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!user) return;

    try {
      const session = await referralRepository.getSessionByCode(shortCode);
      if (!session) {
        setStatusMessage({ text: t.codeError, type: 'error' });
        return;
      }

      const offer = await offerRepository.getOfferById(session.offerId);
      if (!offer) {
        setStatusMessage({ text: t.offerError, type: 'error' });
        return;
      }

      await referralRepository.completeSession(session.id);

      // Money is already held in escrow (escrow_hold). We now pay the promoter:
      await walletRepository.createTransaction({
        userId: session.partnerId,
        amount: offer.rewardAmount,
        type: 'reward',
        sessionId: session.id,
        status: 'completed'
      });

      // Deduct reward from business reserve balance:
      await walletRepository.createTransaction({
        userId: session.businessId,
        amount: offer.rewardAmount,
        type: 'fee',
        sessionId: session.id,
        status: 'completed'
      });

      setStatusMessage({ text: `${t.successPrefix} ${formatCurrency(offer.rewardAmount, user.currency)} paid to promoter.`, type: 'success' });
      setShortCode('');
      await refreshData(user.id);
    } catch (err) {
      const error = err as Error;
      setStatusMessage({ text: error.message || 'Error confirming referral', type: 'error' });
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let computedReward = 0;
    let percentVal: number | null = null;
    let avgBillVal: number | null = null;

    if (rewardType === 'fixed') {
      computedReward = parseFloat(newOfferReward);
    } else {
      const pct = parseFloat(newOfferPercent);
      const bill = parseFloat(newOfferAvgBill);
      if (isNaN(pct) || pct <= 0 || isNaN(bill) || bill <= 0) {
        alert('Invalid percentage or average bill value');
        return;
      }
      computedReward = (bill * pct) / 100;
      percentVal = pct;
      avgBillVal = bill;
    }

    if (isNaN(computedReward) || computedReward <= 0) {
      alert('Invalid reward calculation');
      return;
    }

    if (balance < computedReward) {
      alert(t.balanceErrorCreate);
      return;
    }

    try {
      await offerRepository.createOffer({
        businessId: user.id,
        title: newOfferTitle,
        rewardAmount: computedReward,
        rewardType,
        rewardPercent: percentVal,
        averageBill: avgBillVal,
        category: newOfferCategory,
        conditions: newOfferConditions || null
      });

      setNewOfferTitle('');
      setNewOfferReward('');
      setNewOfferPercent('');
      setNewOfferAvgBill('');
      setNewOfferConditions('');
      setNewOfferCategory('restaurant');
      setShowCreateModal(false);
      await refreshData(user.id);
    } catch (err) {
      alert('Failed to create offer');
    }
  };

  const handleDepositReserve = async () => {
    if (!user) return;
    try {
      await walletRepository.createTransaction({
        userId: user.id,
        amount: 100.00,
        type: 'deposit',
        sessionId: null,
        status: 'completed'
      });
      await refreshData(user.id);
      setStatusMessage({ text: `${formatCurrency(100.00, user.currency)} ${t.depositSuccess}`, type: 'success' });
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '3px solid rgba(34, 211, 238, 0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 600 }}>{t?.loading || 'Loading...'}</p>
          <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.04) 0%, #090a0f 100%)',
      color: 'var(--foreground)',
      padding: '2rem 1.5rem',
      paddingBottom: '6rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background light */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'rgba(34, 211, 238, 0.03)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        top: '0%',
        right: '15%',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        paddingBottom: '1.2rem',
        borderBottom: '1px solid var(--surface-border)',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={user?.avatarUrl || ''}
            alt="Avatar"
            style={{ width: '46px', height: '46px', borderRadius: '50%', border: '2.5px solid var(--primary)', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {user?.fullName}
              {user?.status === 'verified' && <VerificationBadge size={14} />}
            </h4>
            <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--primary)' }}>{t.venue}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Language Selector */}
          <select 
            value={lang} 
            onChange={async (e) => {
              const newLang = e.target.value as any;
              try {
                const updated = await authService.updateProfile({ language: newLang });
                setUser(updated);
              } catch (err) {
                console.error("Failed to update language:", err);
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--surface-border)',
              color: 'var(--foreground)',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="en" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>🇬🇧 EN</option>
            <option value="ru" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>🇷🇺 RU</option>
            <option value="id" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>🇮🇩 ID</option>
            <option value="zh" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>🇨🇳 ZH</option>
            <option value="es" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>🇪🇸 ES</option>
            <option value="de" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>🇩🇪 DE</option>
            <option value="fr" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>🇫🇷 FR</option>
          </select>

          {/* Currency Selector */}
          <select 
            value={user?.currency || 'USD'} 
            onChange={async (e) => {
              const newCurr = e.target.value as any;
              try {
                const updated = await authService.updateProfile({ currency: newCurr });
                setUser(updated);
              } catch (err) {
                console.error("Failed to update currency:", err);
              }
            }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--surface-border)',
              color: 'var(--foreground)',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="USD" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>$ USD</option>
            <option value="IDR" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>Rp IDR</option>
            <option value="EUR" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>€ EUR</option>
            <option value="RUB" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>₽ RUB</option>
            <option value="CNY" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>¥ CNY</option>
            <option value="AUD" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>A$ AUD</option>
            <option value="SGD" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>S$ SGD</option>
            <option value="GBP" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>£ GBP</option>
            <option value="JPY" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>¥ JPY</option>
          </select>

          <button onClick={() => router.push('/business/settings')} style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--surface-border)',
            color: 'var(--foreground)',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
          >
            {t.settings}
          </button>
          <button onClick={handleLogout} style={{
            background: 'rgba(244, 63, 94, 0.06)',
            border: '1px solid rgba(244, 63, 94, 0.15)',
            color: 'var(--error)',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.06)'}
          >
            {t.exit}
          </button>
        </div>
      </header>

      {/* Centered Single Column Layout */}
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative', zIndex: 2 }}>
        
        {/* Reserve Protection Widget */}
        <div className="glass-panel" style={{
          padding: '2rem 1.8rem',
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(244, 63, 94, 0.03) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(34, 211, 238, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>{t.balanceLabel}</span>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px' }}>
                {user && formatCurrency(balance, user.currency)}
              </h2>
            </div>
            <button className="btn-primary" onClick={handleDepositReserve} style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #b91c1c 100%)',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.2)'
            }}>
              {user && t.depositBtn.replace('$100', formatCurrency(100.00, user.currency))}
            </button>
          </div>
          <div style={{
            background: 'rgba(5, 5, 8, 0.25)',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid var(--surface-border)',
            fontSize: '0.8rem',
            opacity: 0.8,
            fontWeight: 500,
            lineHeight: 1.5
          }}>
            {t.reserveNote}
          </div>
        </div>

        {/* Confirm Referral Code Form */}
        <div className="glass-panel" style={{ padding: '2rem 1.8rem', borderRadius: '20px' }}>
          <h3 style={{ marginBottom: '1.2rem', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.2px' }}>{t.attributeTitle}</h3>
          
          {statusMessage && (
            <div style={{
              background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: `1px solid ${statusMessage.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
              color: statusMessage.type === 'success' ? 'var(--success)' : 'var(--error)',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              marginBottom: '1.2rem',
              fontWeight: 600
            }}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleConfirmReferral} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="000000"
              required
              maxLength={6}
              style={{
                flex: 1,
                fontSize: '1.2rem',
                letterSpacing: '4px',
                textAlign: 'center',
                fontWeight: 700
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 28px', borderRadius: '10px' }}>
              {t.verifyBtn}
            </button>
          </form>
        </div>


        {/* Offers List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{t.offersTitle}</h3>
            {/* Small Plus Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(255, 0, 127, 0.3)',
                transition: 'transform 0.1s ease'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              +
            </button>
          </div>
          
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
                  <span style={{ fontSize: '0.75rem', opacity: 0.5, display: 'block', marginTop: '4px' }}>
                    {t.rewardLabel}: <strong>{user && formatCurrency(offer.rewardAmount, user.currency)}</strong>
                    {offer.rewardType === 'percentage' && user && ` (${offer.rewardPercent}% of ${formatCurrency(offer.averageBill || 0, user.currency)} check)`}
                  </span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.4, display: 'block', marginTop: '2px' }}>
                    Category: <strong style={{ textTransform: 'uppercase' }}>{offer.category}</strong>
                  </span>
                  {offer.conditions && (
                    <span style={{ fontSize: '0.75rem', opacity: 0.4, display: 'block', marginTop: '2px' }}>
                      {offer.conditions}
                    </span>
                  )}
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
                    {offer.isActive ? t.statusActive : t.statusPaused}
                  </span>
                </div>
              </div>
            ))}
            {offers.length === 0 && (
              <p style={{ opacity: 0.4, fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>{t.noOffers}</p>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.2rem', fontSize: '1.15rem', fontWeight: 700 }}>Recent Transactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.slice(0, 10).map((tx) => (
              <div key={tx.id} style={{
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--surface-border)',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {tx.type === 'deposit' ? '💳 Reserve Deposit' :
                     tx.type === 'fee' ? '💸 Commission Deducted' :
                     tx.type === 'reward' ? '🎁 Promoter Reward' : '🔄 Wallet Transaction'}
                  </div>
                  <span style={{ fontSize: '0.7rem', opacity: 0.4, display: 'block', marginTop: '2px' }}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    fontWeight: 700, 
                    color: tx.type === 'deposit' ? '#52c41a' : '#ff4d4f' 
                  }}>
                    {tx.type === 'deposit' ? '+' : '-'}{user && formatCurrency(tx.amount, user.currency)}
                  </span>
                  <span style={{ 
                    display: 'block', 
                    fontSize: '0.65rem', 
                    opacity: 0.5, 
                    textTransform: 'uppercase',
                    marginTop: '2px'
                  }}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p style={{ opacity: 0.4, fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No transactions recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal dialog for creating new offer */}
      {showCreateModal && (
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
            maxWidth: '480px',
            padding: '2rem',
            background: 'var(--background)',
            border: '1px solid var(--accent)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 700 }}>{t.createTitle}</h3>
            
            <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.offerTitleLabel}</label>
                <input
                  type="text"
                  value={newOfferTitle}
                  onChange={(e) => setNewOfferTitle(e.target.value)}
                  placeholder={t.offerTitlePlaceholder}
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

              {/* Category Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.categoryLabel}</label>
                <select
                  value={newOfferCategory}
                  onChange={(e) => setNewOfferCategory(e.target.value as 'restaurant' | 'nightlife' | 'villa' | 'activity')}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--surface-border)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                >
                  <option value="restaurant" style={{ background: 'var(--background)' }}>Restaurant 🍕</option>
                  <option value="nightlife" style={{ background: 'var(--background)' }}>Nightlife 🍸</option>
                  <option value="villa" style={{ background: 'var(--background)' }}>Villa 🏡</option>
                  <option value="activity" style={{ background: 'var(--background)' }}>Activity 🏄</option>
                </select>
              </div>

              {/* Reward Type Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.rewardTypeLabel}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setRewardType('fixed')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: rewardType === 'fixed' ? 'var(--accent)' : 'var(--surface-border)',
                      background: rewardType === 'fixed' ? 'rgba(255, 0, 127, 0.1)' : 'transparent',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {t.fixedReward}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRewardType('percentage')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: rewardType === 'percentage' ? 'var(--accent)' : 'var(--surface-border)',
                      background: rewardType === 'percentage' ? 'rgba(255, 0, 127, 0.1)' : 'transparent',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {t.percentageReward}
                  </button>
                </div>
              </div>

              {rewardType === 'fixed' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.rewardAmountLabel}</label>
                  <input
                    type="number"
                    value={newOfferReward}
                    onChange={(e) => setNewOfferReward(e.target.value)}
                    placeholder="5.00"
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
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.avgBillLabel}</label>
                    <input
                      type="number"
                      value={newOfferAvgBill}
                      onChange={(e) => setNewOfferAvgBill(e.target.value)}
                      placeholder="100.00"
                      required
                      min="1"
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
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.percentLabel}</label>
                    <input
                      type="number"
                      value={newOfferPercent}
                      onChange={(e) => setNewOfferPercent(e.target.value)}
                      placeholder="10"
                      required
                      min="0.1"
                      max="100"
                      step="0.1"
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
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.conditionsLabel}</label>
                <textarea
                  value={newOfferConditions}
                  onChange={(e) => setNewOfferConditions(e.target.value)}
                  placeholder={t.conditionsPlaceholder}
                  rows={3}
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

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-primary"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}
                >
                  {t.cancelBtn}
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, background: 'var(--accent)' }}>
                  {t.createBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
