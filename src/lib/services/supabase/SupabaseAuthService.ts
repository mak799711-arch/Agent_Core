import { IAuthService, UserProfile } from '../../interfaces/auth';
import { supabase } from '../supabase/client';

export class SupabaseAuthService implements IAuthService {
  private async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      role: data.role as 'partner' | 'business' | 'admin',
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      cardBound: data.card_bound,
      cardNumber: data.card_number,
      currency: data.currency,
      language: data.language,
      theme: data.theme,
      status: data.status,
      phone: data.phone,
      isBlocked: data.is_blocked,
      createdAt: data.created_at,
    };
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }
    
    return this.getProfile(session.user.id);
  }

  async signUp(email: string, password: string, role: 'partner' | 'business', fullName?: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from signup');
    }

    // Insert profile data
    const profileData = {
      id: data.user.id,
      role,
      full_name: fullName || null,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName || data.user.id}`,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      throw profileError;
    }

    const profile = await this.getProfile(data.user.id);
    if (!profile) {
      throw new Error('Failed to load created profile');
    }

    return profile;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from signin');
    }

    const profile = await this.getProfile(data.user.id);
    if (!profile) {
      throw new Error('Failed to load profile for user');
    }

    return profile;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    // Map UserProfile updates to DB columns
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.cardBound !== undefined) dbUpdates.card_bound = updates.cardBound;
    if (updates.cardNumber !== undefined) dbUpdates.card_number = updates.cardNumber;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', currentUser.id);

    if (error) {
      throw error;
    }

    const updatedProfile = await this.getProfile(currentUser.id);
    if (!updatedProfile) {
      throw new Error('Failed to load updated profile');
    }

    return updatedProfile;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      throw error;
    }

    return data.map(p => ({
      id: p.id,
      role: p.role as 'partner' | 'business' | 'admin',
      fullName: p.full_name,
      avatarUrl: p.avatar_url,
      cardBound: p.card_bound,
      cardNumber: p.card_number,
      currency: p.currency,
      language: p.language,
      theme: p.theme,
      status: p.status,
      phone: p.phone,
      isBlocked: p.is_blocked,
      createdAt: p.created_at,
    }));
  }

  async blockUser(id: string, isBlocked: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: isBlocked })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
