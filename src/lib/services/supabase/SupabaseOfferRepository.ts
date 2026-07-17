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
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', businessIds);
      
    if (usersError) {
      console.error("Error fetching businesses for offers:", usersError);
    }
    
    const usersMap = new Map();
    if (usersData) {
      usersData.forEach((u: any) => {
        usersMap.set(u.id, {
          id: u.id,
          role: u.role,
          fullName: u.full_name,
          avatarUrl: u.avatar_url,
          photos: u.photos,
          bio: u.bio,
          latitude: u.latitude,
          longitude: u.longitude,
        });
      });
    }

    return offersData.map((data: any) => {
      const offer = this.mapToOffer(data);
      // @ts-ignore - attaching business property dynamically
      offer.business = usersMap.get(data.business_id) || null;
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

    const { data, error } = await supabase
      .from('offers')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;
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

    const { data, error } = await supabase
      .from('offers')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
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
}
