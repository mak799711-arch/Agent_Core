import { IOfferRepository, Offer } from '../../interfaces/offers';
import { supabase } from '../../supabase/client';

export class SupabaseOfferRepository implements IOfferRepository {
  async getOffers(options?: { onlyActive?: boolean; businessId?: string }): Promise<Offer[]> {
    let query = supabase.from('offers').select('*');

    if (options?.onlyActive) {
      query = query.eq('is_active', true);
    }
    if (options?.businessId) {
      query = query.eq('business_id', options.businessId);
    }

    const { data: offersData, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!offersData || offersData.length === 0) return [];
    
    // Fetch businesses for these offers since there is no FK constraint
    const businessIds = [...new Set(offersData.map((o: any) => o.business_id))];
    const { data: bizData, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .in('id', businessIds);
      
    if (bizError) {
      console.error("Error fetching businesses for offers:", bizError);
    }
    
    // Optional: fetch avatarUrls from profiles if needed, but AgentMap uses theme avatar if null
    const bizMap = new Map();
    if (bizData) {
      bizData.forEach((b: any) => {
        bizMap.set(b.id, {
          id: b.id,
          name: b.name,
          fullName: b.name, // for backward compatibility in some components
          latitude: b.latitude,
          longitude: b.longitude,
          address: b.address,
        });
      });
    }

    return offersData.map((data: any) => {
      const offer = this.mapToOffer(data);
      // @ts-ignore - attaching business property dynamically
      offer.business = bizMap.get(data.business_id) || null;
      return offer;
    });
  }

  async getOfferById(id: string): Promise<Offer | null> {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapToOffer(data);
  }

  async createOffer(offer: Omit<Offer, 'id' | 'isActive' | 'createdAt'>): Promise<Offer> {
    const dbData = {
      business_id: offer.businessId,
      title: offer.title,
      global_margin_percent: offer.globalMarginPercent,
      average_bill: offer.averageBill,
      category: offer.category,
      conditions: offer.conditions,
      image_url: offer.imageUrl,
      image_urls: offer.imageUrls,
      // Legacy fields to satisfy database NOT NULL constraints
      reward_amount: 0,
      reward_percent: 0,
      reward_type: 'percent',
    };

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const response = await fetch('/api/v1/offers/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dbData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create offer via API');
    }
    
    const data = await response.json();
    return this.mapToOffer(data);
  }

  async updateOffer(id: string, updates: Partial<Omit<Offer, 'id' | 'businessId' | 'createdAt'>>): Promise<Offer> {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.globalMarginPercent !== undefined) dbUpdates.global_margin_percent = updates.globalMarginPercent;
    if (updates.averageBill !== undefined) dbUpdates.average_bill = updates.averageBill;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.conditions !== undefined) dbUpdates.conditions = updates.conditions;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.imageUrls !== undefined) dbUpdates.image_urls = updates.imageUrls;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const response = await fetch('/api/v1/offers/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ offerId: id, updates: dbUpdates })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update offer via API');
    }
    
    const data = await response.json();
    return this.mapToOffer(data);
  }

  private mapToOffer(data: any): Offer {
    return {
      id: data.id,
      businessId: data.business_id,
      title: data.title,
      globalMarginPercent: data.global_margin_percent ? Number(data.global_margin_percent) : 10.00,
      averageBill: data.average_bill ? Number(data.average_bill) : null,
      category: data.category as 'nightlife' | 'restaurant' | 'real_estate' | 'beauty' | 'fitness' | 'retail' | 'activity' | 'services',
      conditions: data.conditions,
      isActive: data.is_active,
      imageUrl: data.image_url || undefined,
      imageUrls: data.image_urls || undefined,
      createdAt: data.created_at,
    };
  }

  async deleteOffer(id: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const response = await fetch('/api/v1/offers/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ offerId: id })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete offer via API');
    }
  }
}
