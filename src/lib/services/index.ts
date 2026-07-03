import { SupabaseAuthService } from './supabase/SupabaseAuthService';
import { SupabaseOfferRepository } from './supabase/SupabaseOfferRepository';
import { SupabaseBusinessRepository } from './supabase/SupabaseBusinessRepository';
import { MockReferralRepository } from './mock/MockReferralRepository';
import { MockWalletRepository } from './mock/MockWalletRepository';
// Для интеграции банковской системы (Stripe, Xendit и др.), разкомментируйте строку ниже:
// import { StripeWalletRepository } from './payment/StripeWalletRepository';

// Инициализируем синглтоны сервисов
const authService = new SupabaseAuthService();
const offerRepository = new SupabaseOfferRepository();
const businessRepository = new SupabaseBusinessRepository();
const referralRepository = new MockReferralRepository();

// Для переключения на реальную платежную систему замените MockWalletRepository на StripeWalletRepository:
const walletRepository = new MockWalletRepository();
// const walletRepository = new StripeWalletRepository();

export {
  authService,
  offerRepository,
  businessRepository,
  referralRepository,
  walletRepository
};
