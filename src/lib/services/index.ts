import { MockAuthService } from './mock/MockAuthService';
import { MockOfferRepository } from './mock/MockOfferRepository';
import { MockReferralRepository } from './mock/MockReferralRepository';
import { MockWalletRepository } from './mock/MockWalletRepository';

// Инициализируем синглтоны мок-сервисов
const authService = new MockAuthService();
const offerRepository = new MockOfferRepository();
const referralRepository = new MockReferralRepository();
const walletRepository = new MockWalletRepository();

export {
  authService,
  offerRepository,
  referralRepository,
  walletRepository
};
