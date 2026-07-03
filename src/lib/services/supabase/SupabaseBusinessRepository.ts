import { Business, IBusinessRepository } from '../../interfaces/business';
import { supabase } from '../../supabase/client';

export class SupabaseBusinessRepository implements IBusinessRepository {
  async getBusinessByOwnerId(ownerId: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapToBusiness(data);
  }

  async createBusiness(data: Omit<Business, 'id' | 'createdAt' | 'reserveBalance' | 'isVerified'>): Promise<Business> {
    const dbData = {
      owner_id: data.ownerId,
      name: data.name,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    const { data: created, error } = await supabase
      .from('businesses')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;
    return this.mapToBusiness(created);
  }

  async updateBusiness(id: string, updates: Partial<Omit<Business, 'id' | 'ownerId' | 'createdAt'>>): Promise<Business> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
    if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;
    if (updates.reserveBalance !== undefined) dbUpdates.reserve_balance = updates.reserveBalance;
    if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;

    const { data, error } = await supabase
      .from('businesses')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToBusiness(data);
  }

  private mapToBusiness(data: any): Business {
    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      reserveBalance: Number(data.reserve_balance),
      isVerified: data.is_verified,
      createdAt: data.created_at,
    };
  }
}
