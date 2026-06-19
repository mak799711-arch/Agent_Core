export interface ReferralSession {
  id: string;
  partnerId: string;
  offerId: string;
  businessId: string;
  shortCode: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface IReferralRepository {
  createSession(partnerId: string, offerId: string, businessId: string): Promise<ReferralSession>;
  getSessionByCode(shortCode: string): Promise<ReferralSession | null>;
  getSessionById(id: string): Promise<ReferralSession | null>;
  getActiveSessionsForPartner(partnerId: string): Promise<ReferralSession[]>;
  completeSession(id: string): Promise<ReferralSession>;
  expireSession(id: string): Promise<ReferralSession>;
}
