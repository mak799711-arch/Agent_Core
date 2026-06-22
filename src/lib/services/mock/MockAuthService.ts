import { IAuthService, UserProfile } from '../../interfaces/auth';

export interface MockUser extends UserProfile {
  email: string;
  password?: string;
}

export class MockAuthService implements IAuthService {
  private currentUser: UserProfile | null = null;
  private users: Map<string, MockUser> = new Map();

  constructor() {
    const isClient = typeof window !== 'undefined';
    
    // 1. Load users list from localStorage or initialize with defaults
    let loadedUsers: [string, MockUser][] | null = null;
    if (isClient) {
      try {
        const stored = localStorage.getItem('mock_users');
        if (stored) {
          loadedUsers = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error loading mock users:', e);
      }
    }

    if (loadedUsers && loadedUsers.length > 0) {
      this.users = new Map(loadedUsers);
    }

    let needsSave = false;

    // Ensure Admin Account
    if (!this.users.has('mak799711@gmail.com')) {
      this.users.set('mak799711@gmail.com', {
        id: 'mock-admin-uuid',
        role: 'admin',
        fullName: 'Mak Admin',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mak',
        createdAt: new Date().toISOString(),
        email: 'mak799711@gmail.com',
        password: 'MAKADMIN1551',
        cardBound: true,
        cardNumber: '7777 7777 7777 7777',
        currency: 'USD',
        language: 'ru',
        theme: 'dark'
      });
      needsSave = true;
    }

    // Ensure Demo Partner Account
    if (!this.users.has('partner@agent.core')) {
      this.users.set('partner@agent.core', {
        id: 'mock-partner-uuid',
        role: 'partner',
        fullName: 'John Bali Promoter',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        createdAt: new Date().toISOString(),
        email: 'partner@agent.core',
        password: 'password123',
        cardBound: true,
        cardNumber: '4242 4242 4242 4242',
        currency: 'USD',
        language: 'en',
        theme: 'dark'
      });
      needsSave = true;
    }

    // Ensure Demo Business Account
    if (!this.users.has('business@agent.core')) {
      this.users.set('business@agent.core', {
        id: 'mock-business-uuid',
        role: 'business',
        fullName: 'La Brisa Bali Manager',
        avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=LaBrisa',
        createdAt: new Date().toISOString(),
        email: 'business@agent.core',
        password: 'password123',
        cardBound: true,
        cardNumber: '5555 5555 5555 5555',
        currency: 'USD',
        language: 'en',
        theme: 'dark'
      });
      needsSave = true;
    }

    // Ensure Beta Partner Account (goes through 3-step onboarding)
    if (!this.users.has('beta-partner@agent.core')) {
      this.users.set('beta-partner@agent.core', {
        id: 'mock-beta-partner-uuid',
        role: 'partner',
        fullName: 'Beta Tester Partner',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=BetaPartner',
        createdAt: new Date().toISOString(),
        email: 'beta-partner@agent.core',
        password: 'beta123',
        cardBound: false,
        cardNumber: null,
        currency: 'USD',
        language: 'en',
        theme: 'dark'
      });
      needsSave = true;
    }

    // Ensure Beta Business Account (goes through 3-step onboarding)
    if (!this.users.has('beta-business@agent.core')) {
      this.users.set('beta-business@agent.core', {
        id: 'mock-beta-business-uuid',
        role: 'business',
        fullName: 'Beta Tester Business',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=BetaBusiness',
        createdAt: new Date().toISOString(),
        email: 'beta-business@agent.core',
        password: 'beta123',
        cardBound: false,
        cardNumber: null,
        currency: 'USD',
        language: 'en',
        theme: 'dark'
      });
      needsSave = true;
    }

    if (needsSave) {
      this.saveUsersToStorage();
    }

    // 2. Load active session from localStorage
    if (isClient) {
      try {
        const storedEmail = localStorage.getItem('current_user_email');
        if (storedEmail) {
          const user = this.users.get(storedEmail);
          if (user) {
            this.currentUser = user;
          }
        }
      } catch (e) {
        console.error('Error loading active user session:', e);
      }
    }
  }

  private saveUsersToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mock_users', JSON.stringify(Array.from(this.users.entries())));
      } catch (e) {
        console.error('Failed to save mock users to storage:', e);
      }
    }
  }

  private saveSession(email: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user_email', email);
    }
  }

  private clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_user_email');
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return this.currentUser;
  }

  async signUp(email: string, password: string, role: 'partner' | 'business', fullName?: string): Promise<UserProfile> {
    const id = `mock-user-${Math.random().toString(36).substr(2, 9)}`;
    const cleanEmail = email.trim().toLowerCase();
    const user: MockUser = {
      id,
      role,
      fullName: fullName || null,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName || id}`,
      createdAt: new Date().toISOString(),
      email: cleanEmail,
      password,
      cardBound: false,
      cardNumber: null,
      currency: 'USD',
      language: 'en',
      theme: 'dark'
    };
    this.users.set(cleanEmail, user);
    this.saveUsersToStorage();
    this.currentUser = user;
    this.saveSession(cleanEmail);
    return user;
  }

  async signIn(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.users.get(cleanEmail);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.password && user.password !== password) {
      throw new Error('Incorrect password');
    }
    this.currentUser = user;
    this.saveSession(cleanEmail);
    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.clearSession();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }
    
    const updatedUser = {
      ...this.currentUser,
      ...updates
    };

    let userEmail = '';
    for (const [email, user] of this.users.entries()) {
      if (user.id === this.currentUser.id) {
        userEmail = email;
        break;
      }
    }

    if (userEmail) {
      this.users.set(userEmail, { ...this.users.get(userEmail)!, ...updates });
      this.saveUsersToStorage();
    }

    this.currentUser = updatedUser;
    return updatedUser;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return Array.from(this.users.values()).map((u) => {
      const { password: _password, ...user } = u;
      return user;
    });
  }

  async blockUser(id: string, isBlocked: boolean): Promise<void> {
    for (const [email, user] of this.users.entries()) {
      if (user.id === id) {
        user.isBlocked = isBlocked;
        this.users.set(email, user);
        break;
      }
    }
    this.saveUsersToStorage();
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser.isBlocked = isBlocked;
    }
  }
}


