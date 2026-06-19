import { IAuthService, UserProfile } from '../../interfaces/auth';

export class MockAuthService implements IAuthService {
  private currentUser: UserProfile | null = null;
  private users: Map<string, UserProfile & { email: string }> = new Map();

  constructor() {
    // Дефолтные тестовые аккаунты
    const partnerId = 'mock-partner-uuid';
    const businessId = 'mock-business-uuid';

    this.users.set('partner@agent.core', {
      id: partnerId,
      role: 'partner',
      fullName: 'John Bali Promoter',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      createdAt: new Date().toISOString(),
      email: 'partner@agent.core'
    });

    this.users.set('business@agent.core', {
      id: businessId,
      role: 'business',
      fullName: 'La Brisa Bali Manager',
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=LaBrisa',
      createdAt: new Date().toISOString(),
      email: 'business@agent.core'
    });
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return this.currentUser;
  }

  async signUp(email: string, password: string, role: 'partner' | 'business', fullName?: string): Promise<UserProfile> {
    const id = `mock-user-${Math.random().toString(36).substr(2, 9)}`;
    const user: UserProfile & { email: string } = {
      id,
      role,
      fullName: fullName || null,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName || id}`,
      createdAt: new Date().toISOString(),
      email
    };
    this.users.set(email, user);
    this.currentUser = user;
    return user;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    const user = this.users.get(email);
    if (!user) {
      throw new Error('User not found');
    }
    this.currentUser = user;
    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
  }
}
