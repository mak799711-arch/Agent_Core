export interface Offer {
  id: string;
  businessId: string;
  title: string;
  rewardAmount: number;
  rewardType: 'fixed' | 'percentage';
  rewardPercent?: number | null; // % если 'percentage'
  customerDiscountPercent?: number | null; // Скидка для туриста
  platformFeePercent?: number | null; // Комиссия платформы
  averageBill?: number | null;
  category: 'restaurant' | 'nightlife' | 'real_estate' | 'beauty' | 'fitness' | 'retail' | 'activity' | 'services';
  conditions: string | null;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface IOfferRepository {
  getOffers(options?: { onlyActive?: boolean; businessId?: string }): Promise<Offer[]>;
  getOfferById(id: string): Promise<Offer | null>;
  createOffer(offer: Omit<Offer, 'id' | 'isActive' | 'createdAt'>): Promise<Offer>;
  updateOffer(id: string, updates: Partial<Omit<Offer, 'id' | 'businessId' | 'createdAt'>>): Promise<Offer>;
}
