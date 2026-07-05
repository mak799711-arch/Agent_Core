export interface UserProfile {
  id: string;
  role: 'partner' | 'business' | 'admin';
  fullName: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  createdAt: string;
  
  // Новые поля для Phase 1.1 Onboarding & Settings
  cardBound: boolean;
  cardNumber: string | null;
  currency: 'USD' | 'IDR' | 'EUR' | 'RUB' | 'CNY' | 'AUD' | 'SGD' | 'GBP' | 'JPY';
  language: 'ru' | 'en' | 'id' | 'zh' | 'es' | 'de' | 'fr';
  theme: 'dark' | 'neon' | 'light';
  status?: 'verified' | 'unverified' | 'banned' | string;
  email?: string;
  isBlocked?: boolean;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface IAuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  signUp(email: string, password: string, role: 'partner' | 'business', fullName?: string): Promise<UserProfile>;
  signIn(email: string, password: string): Promise<UserProfile>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(updates: Partial<UserProfile>): Promise<UserProfile>;
  adminUpdateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void>;
  getAllUsers(): Promise<UserProfile[]>;
  blockUser(id: string, isBlocked: boolean): Promise<void>;
}
