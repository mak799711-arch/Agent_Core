import { IAuthService, UserProfile } from '../../interfaces/auth';
import { supabase } from '../../supabase/client';

import { sanitizeName } from '../../utils/format';

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
      bio: data.bio,
      cardBound: data.card_bound,
      cardNumber: data.card_number,
      currency: data.currency,
      language: data.language,
      theme: data.theme,
      status: data.status,
      phone: data.phone,
      isBlocked: data.is_blocked,
      banUntil: data.ban_until,
      banReason: data.ban_reason,
      createdAt: data.created_at,
    };
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }
    
    let profile = await this.getProfile(session.user.id);
    
    if (!profile) {
      // Lazy creation for OAuth users
      const pendingRole = (typeof window !== 'undefined' ? localStorage.getItem('agent_core_pending_role') : 'partner') as 'partner' | 'business';
      const role = pendingRole || 'partner';
      
      const safeFullName = sanitizeName(session.user.user_metadata?.full_name);
      
      const profileData = {
        id: session.user.id,
        role,
        full_name: safeFullName || null,
        avatar_url: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
      };

      await supabase.from('profiles').insert(profileData);

      if (role === 'business') {
        await supabase.from('businesses').insert({
          owner_id: session.user.id,
          name: `${safeFullName || 'My Business'} Venue`,
        });
      }
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('agent_core_pending_role');
      }
      
      profile = await this.getProfile(session.user.id);
    }

    return profile;
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

    const safeFullName = sanitizeName(fullName);

    // Insert profile data
    const profileData = {
      id: data.user.id,
      role,
      full_name: safeFullName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeFullName || data.user.id}`,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      throw profileError;
    }

    if (role === 'business') {
      const businessData = {
        owner_id: data.user.id,
        name: `${safeFullName || 'My Business'} Venue`,
      };
      
      const { error: businessError } = await supabase
        .from('businesses')
        .insert(businessData);
        
      if (businessError) {
        console.error('Failed to create business record:', businessError);
      }
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

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      throw error;
    }
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
    if (updates.fullName !== undefined) dbUpdates.full_name = sanitizeName(updates.fullName);
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
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

  async adminUpdateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admins can update other profiles');
    }
    
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;
    if (updates.banUntil !== undefined) dbUpdates.ban_until = updates.banUntil;
    if (updates.banReason !== undefined) dbUpdates.ban_reason = updates.banReason;
    
    // Get session token for authentication
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      throw new Error('No valid session found');
    }

    const response = await fetch('/api/v1/admin/users/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        targetUserId: userId,
        updates: dbUpdates
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update user profile via admin API');
    }
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
      banUntil: p.ban_until,
      banReason: p.ban_reason,
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

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
