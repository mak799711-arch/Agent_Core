'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, offerRepository } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';
import { Offer } from '@/lib/interfaces/offers';
import AgentMap from '@/app/components/AgentMap';

export default function PartnerDashboardV4() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('map');
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'partner') {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        // V4: Get active venues/offers
        const activeOffers = await offerRepository.getOffers({ onlyActive: true });
        setOffers(activeOffers);

        setLoading(false);
      } catch (err) {
        console.error('Error loading partner dashboard:', err);
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleCopyLink = (businessId: string) => {
    if (!user) return;
    // V4: Direct Checkout Gateway Link
    // In production, this would point to the actual domain.
    const link = `https://agentcore.app/checkout?b=${businessId}&a=${user.id}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(businessId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Loading V4 Partner Portal...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'white', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>AgentCore V4: Partner</h2>
        <button 
          onClick={handleLogout} 
          style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </header>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
        <p style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Total Earnings</p>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: 0 }}>IDR 0</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('map')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'map' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: activeTab === 'map' ? '#000' : 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📍 Map View
        </button>
        <button 
          onClick={() => setActiveTab('list')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'list' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: activeTab === 'list' ? '#000' : 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          📋 List View
        </button>
      </div>

      <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        {activeTab === 'map' 
          ? "Explore active venues around you. Click a pin to copy your checkout link."
          : "Generate a direct checkout link and send it to the tourist. You will receive commission automatically when they pay."}
      </p>

      {activeTab === 'map' ? (
        <AgentMap 
          activeOffers={offers} 
          userCurrency={user?.currency || 'IDR'} 
          onCopyLink={handleCopyLink} 
          copiedId={copiedLink}
          theme={user?.theme === 'light' ? 'light' : 'dark'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {offers.map(offer => (
            <div key={offer.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>{offer.title}</h4>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Global Margin: 20% (You get {offer.rewardAmount} IDR)</p>
              </div>
              <button 
                onClick={() => handleCopyLink(offer.businessId)}
                className="btn-primary"
                style={{ background: copiedLink === offer.businessId ? 'var(--success)' : 'var(--primary)' }}
              >
                {copiedLink === offer.businessId ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
