import { SupabaseAuthService } from './supabase/SupabaseAuthService';
import { SupabaseOfferRepository } from './supabase/SupabaseOfferRepository';
import { SupabaseBusinessRepository } from './supabase/SupabaseBusinessRepository';
import { SupabaseWalletRepository } from './supabase/SupabaseWalletRepository';
// Для интеграции банковской системы (Stripe, Xendit и др.), разкомментируйте строку ниже:
// import { StripeWalletRepository } from './payment/StripeWalletRepository';

// Инициализируем синглтоны сервисов
const authService = new SupabaseAuthService();
const offerRepository = new SupabaseOfferRepository();
const businessRepository = new SupabaseBusinessRepository();

// Для переключения на реальную платежную систему замените SupabaseWalletRepository на StripeWalletRepository:
const walletRepository = new SupabaseWalletRepository();
// const walletRepository = new StripeWalletRepository();

import { ticketRepository } from './supabase/SupabaseTicketRepository';

export {
  authService,
  offerRepository,
  businessRepository,
  walletRepository,
  ticketRepository
};
