import { IAuthService, UserProfile } from '../../interfaces/auth';

export class MockAuthService implements IAuthService {
  private currentUser: UserProfile | null = null;
  private users: Map<string, UserProfile & { email: string }> = new Map();

  constructor() {
    // Дефолтные тестовые аккаунты (уже завершили onboarding для удобства тестов)
    const partnerId = 'mock-partner-uuid';
    const businessId = 'mock-business-uuid';

    this.users.set('partner@agent.core', {
      id: partnerId,
      role: 'partner',
      fullName: 'John Bali Promoter',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      createdAt: new Date().toISOString(),
      email: 'partner@agent.core',
      cardBound: true,
      cardNumber: '4242 4242 4242 4242',
      currency: 'USD',
      language: 'en',
      theme: 'neon'
    });

    this.users.set('business@agent.core', {
      id: businessId,
      role: 'business',
      fullName: 'La Brisa Bali Manager',
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=LaBrisa',
      createdAt: new Date().toISOString(),
      email: 'business@agent.core',
      cardBound: true,
      cardNumber: '5555 5555 5555 5555',
      currency: 'USD',
      language: 'en',
      theme: 'neon'
    });

    this.users.set('mak799711@gmail.com', {
      id: 'mock-admin-uuid',
      role: 'admin',
      fullName: 'Mak Admin',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mak',
      createdAt: new Date().toISOString(),
      email: 'mak799711@gmail.com',
      cardBound: true,
      cardNumber: '7777 7777 7777 7777',
      currency: 'USD',
      language: 'ru',
      theme: 'neon'
    });
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return this.currentUser;
  }

  async signUp(email: string, password: string, role: 'partner' | 'business', fullName?: string): Promise<UserProfile> {
    const id = `mock-user-${Math.random().toString(36).substr(2, 9)}`;
    const lowerEmail = email.toLowerCase();
    const user: UserProfile & { email: string } = {
      id,
      role,
      fullName: fullName || null,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName || id}`,
      createdAt: new Date().toISOString(),
      email: lowerEmail,
      cardBound: false, // Новый пользователь должен пройти Onboarding!
      cardNumber: null,
      currency: 'USD',
      language: 'en',
      theme: 'neon'
    };
    this.users.set(lowerEmail, user);
    this.currentUser = user;
    return user;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    const user = this.users.get(email.toLowerCase());
    if (!user) {
      throw new Error('User not found');
    }
    this.currentUser = user;
    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }
    
    const updatedUser = {
      ...this.currentUser,
      ...updates
    };

    // Находим почту текущего юзера
    let userEmail = '';
    for (const [email, user] of this.users.entries()) {
      if (user.id === this.currentUser.id) {
        userEmail = email;
        break;
      }
    }

    if (userEmail) {
      this.users.set(userEmail, { ...this.users.get(userEmail)!, ...updates });
    }

    this.currentUser = updatedUser;
    return updatedUser;
  }
}
