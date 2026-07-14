import { IReferralRepository, ReferralSession } from '../../interfaces/referrals';
import { supabase } from '../../supabase/client';

export class SupabaseReferralRepository implements IReferralRepository {
  
  private mapSession(data: any): ReferralSession {
    return {
      id: data.id,
      partnerId: data.partner_id,
      offerId: data.offer_id,
      businessId: data.business_id,
      shortCode: data.short_code,
      status: data.status,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    };
  }

  async createSession(partnerId: string, offerId: string, businessId: string): Promise<ReferralSession> {
    const shortCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
    
    const { data, error } = await supabase
      .from('referral_sessions')
      .insert({
        partner_id: partnerId,
        offer_id: offerId,
        business_id: businessId,
        short_code: shortCode,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) throw error;
    return this.mapSession(data);
  }

  async getSessionByCode(shortCode: string): Promise<ReferralSession | null> {
    const { data, error } = await supabase
      .from('referral_sessions')
      .select('*')
      .eq('short_code', shortCode)
      .eq('status', 'pending')
      .single();
      
    if (error || !data) return null;
    return this.mapSession(data);
  }

  async getSessionById(id: string): Promise<ReferralSession | null> {
    const { data, error } = await supabase
      .from('referral_sessions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return null;
    return this.mapSession(data);
  }

  async getActiveSessionsForPartner(partnerId: string): Promise<ReferralSession[]> {
    const { data, error } = await supabase
      .from('referral_sessions')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('status', 'pending');
      
    if (error) throw error;
    return data.map(this.mapSession);
  }

  async completeSession(id: string): Promise<ReferralSession> {
    const { data, error } = await supabase
      .from('referral_sessions')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return this.mapSession(data);
  }

  async expireSession(id: string): Promise<ReferralSession> {
    const { data, error } = await supabase
      .from('referral_sessions')
      .update({ status: 'expired' })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return this.mapSession(data);
  }

  async getAllSessions(): Promise<ReferralSession[]> {
    const { data, error } = await supabase
      .from('referral_sessions')
      .select('*');
      
    if (error) throw error;
    return data.map(this.mapSession.bind(this));
  }

  async adminGetAllSessions(): Promise<ReferralSession[]> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) throw new Error('No valid session found');

    const response = await fetch('/api/v1/admin/sessions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch sessions via admin API');
    }

    const result = await response.json();
    return result.sessions.map(this.mapSession.bind(this));
  }

  async flagSession(id: string): Promise<ReferralSession> {
    const { data, error } = await supabase
      .from('referral_sessions')
      .update({ status: 'failed' }) // we use 'failed' as flagged in db for now based on schema
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return this.mapSession(data);
  }
}
