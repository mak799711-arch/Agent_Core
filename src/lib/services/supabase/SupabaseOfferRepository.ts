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
      .from('users')
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
      reward_amount: offer.rewardAmount,
      reward_type: offer.rewardType,
      reward_percent: offer.rewardPercent,
      customer_discount_percent: offer.customerDiscountPercent,
      platform_fee_percent: offer.platformFeePercent,
      average_bill: offer.averageBill,
      category: offer.category,
      conditions: offer.conditions,
      image_url: offer.imageUrl,
      image_urls: offer.imageUrls,
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
    if (updates.rewardAmount !== undefined) dbUpdates.reward_amount = updates.rewardAmount;
    if (updates.rewardType !== undefined) dbUpdates.reward_type = updates.rewardType;
    if (updates.rewardPercent !== undefined) dbUpdates.reward_percent = updates.rewardPercent;
    if (updates.customerDiscountPercent !== undefined) dbUpdates.customer_discount_percent = updates.customerDiscountPercent;
    if (updates.platformFeePercent !== undefined) dbUpdates.platform_fee_percent = updates.platformFeePercent;
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
      rewardAmount: Number(data.reward_amount),
      rewardType: data.reward_type as 'fixed' | 'percentage',
      rewardPercent: data.reward_percent ? Number(data.reward_percent) : null,
      customerDiscountPercent: data.customer_discount_percent ? Number(data.customer_discount_percent) : 0,
      platformFeePercent: data.platform_fee_percent ? Number(data.platform_fee_percent) : 1,
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
