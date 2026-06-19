export interface Offer {
  id: string;
  businessId: string;
  title: string;
  rewardAmount: number;
  conditions: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface IOfferRepository {
  getOffers(options?: { onlyActive?: boolean; businessId?: string }): Promise<Offer[]>;
  getOfferById(id: string): Promise<Offer | null>;
  createOffer(offer: Omit<Offer, 'id' | 'isActive' | 'createdAt'>): Promise<Offer>;
  updateOffer(id: string, updates: Partial<Omit<Offer, 'id' | 'businessId' | 'createdAt'>>): Promise<Offer>;
}
