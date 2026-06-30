import { MockAuthService } from './mock/MockAuthService';
import { MockOfferRepository } from './mock/MockOfferRepository';
import { MockReferralRepository } from './mock/MockReferralRepository';
import { MockWalletRepository } from './mock/MockWalletRepository';
// Для интеграции банковской системы (Stripe, Xendit и др.), разкомментируйте строку ниже:
// import { StripeWalletRepository } from './payment/StripeWalletRepository';

// Инициализируем синглтоны сервисов
const authService = new MockAuthService();
const offerRepository = new MockOfferRepository();
const referralRepository = new MockReferralRepository();

// Для переключения на реальную платежную систему замените MockWalletRepository на StripeWalletRepository:
const walletRepository = new MockWalletRepository();
// const walletRepository = new StripeWalletRepository();

export {
  authService,
  offerRepository,
  referralRepository,
  walletRepository
};
