import { IOfferRepository, Offer } from '../../interfaces/offers';

export class MockOfferRepository implements IOfferRepository {
  private offers: Offer[] = [
    {
      id: 'offer-1',
      businessId: 'mock-business-uuid',
      title: 'La Brisa Promo',
      rewardAmount: 5.00,
      rewardType: 'fixed',
      rewardPercent: null,
      averageBill: null,
      category: 'restaurant',
      conditions: 'Reward is $5 per customer.',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'offer-2',
      businessId: 'mock-business-uuid',
      title: 'Potato Head VIP Entry',
      rewardAmount: 12.50,
      rewardType: 'fixed',
      rewardPercent: null,
      averageBill: null,
      category: 'nightlife',
      conditions: 'Reward is $12.5 per referral group.',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'offer-3',
      businessId: 'mock-business-uuid',
      title: 'Savaya Table Booking',
      rewardAmount: 50.00,
      rewardType: 'percentage',
      rewardPercent: 10,
      averageBill: 500.00,
      category: 'nightlife',
      conditions: '10% of total table spend. Estimated reward: $50.',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'offer-4',
      businessId: 'mock-business-uuid',
      title: 'Canggu Villa Booking',
      rewardAmount: 100.00,
      rewardType: 'fixed',
      rewardPercent: null,
      averageBill: null,
      category: 'villa',
      conditions: 'Reward is $100 for verified 3+ nights stay.',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'offer-5',
      businessId: 'mock-business-uuid',
      title: 'Surf Lessons Canggu',
      rewardAmount: 8.00,
      rewardType: 'fixed',
      rewardPercent: null,
      averageBill: null,
      category: 'activity',
      conditions: 'Reward is $8 per referral booking.',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  async getOffers(options?: { onlyActive?: boolean; businessId?: string }): Promise<Offer[]> {
    let result = [...this.offers];
    if (options?.onlyActive) {
      result = result.filter(o => o.isActive);
    }
    if (options?.businessId) {
      result = result.filter(o => o.businessId === options.businessId);
    }
    return result;
  }

  async getOfferById(id: string): Promise<Offer | null> {
    return this.offers.find(o => o.id === id) || null;
  }

  async createOffer(offer: Omit<Offer, 'id' | 'isActive' | 'createdAt'>): Promise<Offer> {
    const newOffer: Offer = {
      ...offer,
      id: `offer-${Math.random().toString(36).substr(2, 9)}`,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.offers.push(newOffer);
    return newOffer;
  }

  async updateOffer(id: string, updates: Partial<Omit<Offer, 'id' | 'businessId' | 'createdAt'>>): Promise<Offer> {
    const idx = this.offers.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Offer not found');
    this.offers[idx] = { ...this.offers[idx], ...updates };
    return this.offers[idx];
  }
}
