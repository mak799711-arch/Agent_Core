import { SupabaseAuthService } from './supabase/SupabaseAuthService';
import { SupabaseOfferRepository } from './supabase/SupabaseOfferRepository';
import { SupabaseBusinessRepository } from './supabase/SupabaseBusinessRepository';
import { SupabaseReferralRepository } from './supabase/SupabaseReferralRepository';
import { SupabaseWalletRepository } from './supabase/SupabaseWalletRepository';
// Для интеграции банковской системы (Stripe, Xendit и др.), разкомментируйте строку ниже:
// import { StripeWalletRepository } from './payment/StripeWalletRepository';

// Инициализируем синглтоны сервисов
const authService = new SupabaseAuthService();
const offerRepository = new SupabaseOfferRepository();
const businessRepository = new SupabaseBusinessRepository();
const referralRepository = new SupabaseReferralRepository();

// Для переключения на реальную платежную систему замените SupabaseWalletRepository на StripeWalletRepository:
const walletRepository = new SupabaseWalletRepository();
// const walletRepository = new StripeWalletRepository();

export {
  authService,
  offerRepository,
  businessRepository,
  referralRepository,
  walletRepository
};
