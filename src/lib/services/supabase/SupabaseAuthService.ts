import { IAuthService, UserProfile } from '../../interfaces/auth';
import { supabase } from '@/utils/supabase/client';

export class SupabaseAuthService implements IAuthService {
  
  // Вспомогательный метод для маппинга БД-профиля в наш интерфейс
  private mapProfile(user: any, profile: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      role: profile?.role || 'partner',
      fullName: profile?.full_name || null,
      avatarUrl: profile?.avatar_url || null,
      createdAt: profile?.created_at || new Date().toISOString(),
      
      // Заглушки для полей, которых пока нет в нашей SQL-схеме, но требует интерфейс
      cardBound: false,
      cardNumber: null,
      currency: 'USD',
      language: 'ru',
      theme: 'dark',
      status: 'verified',
      isBlocked: false,
    };
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return null;
    }

    const user = session.user;

    // Пытаемся получить профиль из таблицы profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', profileError);
    }

    return this.mapProfile(user, profile);
  }

  async signUp(email: string, password: string, role: 'partner' | 'business', fullName?: string): Promise<UserProfile> {
    // 1. Регистрация в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('User creation failed');

    const user = authData.user;

    // 2. Создание записи в таблице profiles
    const profileData = {
      id: user.id,
      role: role,
      full_name: fullName || null,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Даже если профиль не создался (например, из-за RLS или ошибки), возвращаем базовый юзер
      // В продакшене тут нужен откат регистрации или триггер в БД
    }

    return this.mapProfile(user, profileData);
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Login failed');

    return (await this.getCurrentUser()) as UserProfile;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Маппинг наших полей в snake_case для БД
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    
    // Остальные поля игнорируем, так как их нет в БД пока что

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);
        
      if (error) throw new Error(error.message);
    }

    return (await this.getCurrentUser()) as UserProfile;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    // В реальном приложении обычный пользователь не должен мочь скачивать всех юзеров (RLS это заблокирует)
    // Но для интерфейса заглушим:
    return [];
  }

  async blockUser(id: string, isBlocked: boolean): Promise<void> {
    throw new Error('Not implemented for client side');
  }
}
