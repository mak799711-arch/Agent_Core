export interface ReferralSession {
  id: string;
  partnerId: string;
  offerId: string;
  businessId: string;
  shortCode: string;
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'flagged';
  createdAt: string;
  expiresAt: string;
  geoLocation?: {
    lat: number;
    lng: number;
    city: string;
  };
}

export interface IReferralRepository {
  createSession(partnerId: string, offerId: string, businessId: string): Promise<ReferralSession>;
  getSessionByCode(shortCode: string): Promise<ReferralSession | null>;
  getSessionById(id: string): Promise<ReferralSession | null>;
  getActiveSessionsForPartner(partnerId: string): Promise<ReferralSession[]>;
  completeSession(id: string): Promise<ReferralSession>;
  expireSession(id: string): Promise<ReferralSession>;
  getAllSessions(): Promise<ReferralSession[]>;
  adminGetAllSessions(): Promise<ReferralSession[]>;
  flagSession(id: string): Promise<ReferralSession>;
}
