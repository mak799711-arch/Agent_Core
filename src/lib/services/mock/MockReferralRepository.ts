import { IReferralRepository, ReferralSession } from '../../interfaces/referrals';

export class MockReferralRepository implements IReferralRepository {
  private sessions: ReferralSession[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mock_sessions');
        if (stored) {
          this.sessions = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error loading mock sessions:', e);
      }
    }
  }

  private saveSessions() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mock_sessions', JSON.stringify(this.sessions));
      } catch (e) {
        console.error('Error saving mock sessions:', e);
      }
    }
  }

  async createSession(partnerId: string, offerId: string, businessId: string): Promise<ReferralSession> {
    const shortCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
    const newSession: ReferralSession = {
      id: `session-${Math.random().toString(36).substr(2, 9)}`,
      partnerId,
      offerId,
      businessId,
      shortCode,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    this.sessions.push(newSession);
    this.saveSessions();
    return newSession;
  }

  async getSessionByCode(shortCode: string): Promise<ReferralSession | null> {
    return this.sessions.find(s => s.shortCode === shortCode && s.status === 'pending') || null;
  }

  async getSessionById(id: string): Promise<ReferralSession | null> {
    return this.sessions.find(s => s.id === id) || null;
  }

  async getActiveSessionsForPartner(partnerId: string): Promise<ReferralSession[]> {
    return this.sessions.filter(s => s.partnerId === partnerId && s.status === 'pending');
  }

  async completeSession(id: string): Promise<ReferralSession> {
    const idx = this.sessions.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Session not found');
    this.sessions[idx].status = 'completed';
    this.saveSessions();
    return this.sessions[idx];
  }

  async expireSession(id: string): Promise<ReferralSession> {
    const idx = this.sessions.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Session not found');
    this.sessions[idx].status = 'expired';
    this.saveSessions();
    return this.sessions[idx];
  }
}
