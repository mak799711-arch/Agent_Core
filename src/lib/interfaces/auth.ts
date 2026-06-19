export interface UserProfile {
  id: string;
  role: 'partner' | 'business' | 'admin';
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface IAuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  signUp(email: string, password: string, role: 'partner' | 'business', fullName?: string): Promise<UserProfile>;
  signIn(email: string, password: string): Promise<UserProfile>;
  signOut(): Promise<void>;
}
