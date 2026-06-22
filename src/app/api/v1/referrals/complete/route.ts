import { NextRequest, NextResponse } from 'next/server';
import { offerRepository, referralRepository, walletRepository } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { code, billAmount } = body;

    if (!code || billAmount === undefined || typeof billAmount !== 'number' || billAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Fields "code" (string) and "billAmount" (positive number) are required' },
        { status: 400 }
      );
    }

    // 1. Проверяет активность сессии
    const session = await referralRepository.getSessionByCode(code);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active referral session not found or already completed' },
        { status: 404 }
      );
    }

    if (session.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Referral session is not pending' },
        { status: 404 }
      );
    }

    // 2. Получаем оффер для расчета награды
    const offer = await offerRepository.getOfferById(session.offerId);
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found for this session' },
        { status: 404 }
      );
    }

    // 3. Вычисляем сумму награды
    let computedReward = offer.rewardAmount;
    if (offer.rewardType === 'percentage' && offer.rewardPercent !== null) {
      computedReward = billAmount * (offer.rewardPercent / 100);
    }
    // Округляем до 2 знаков после запятой
    computedReward = Math.round(computedReward * 100) / 100;

    // Вычисляем комиссию платформы (1% от суммы чека)
    const platformFee = Math.round(billAmount * 0.01 * 100) / 100;

    const totalRequired = computedReward + platformFee;

    // 4. Проверяем баланс резерва бизнеса
    const businessBalance = await walletRepository.getBalance(session.businessId);
    if (businessBalance < totalRequired) {
      return NextResponse.json(
        { success: false, error: 'Insufficient business reserve balance to complete transaction' },
        { status: 400 }
      );
    }

    // 5. Закрывает сессию
    await referralRepository.completeSession(session.id);

    // 6. Создаем транзакции
    // Начисляет награду промоутеру (типа 'reward' для partnerId)
    await walletRepository.createTransaction({
      userId: session.partnerId,
      amount: computedReward,
      type: 'reward',
      sessionId: session.id,
      status: 'completed',
    });

    // Списывает награду с баланса резерва бизнеса (типа 'fee' для businessId)
    await walletRepository.createTransaction({
      userId: session.businessId,
      amount: computedReward,
      type: 'fee',
      sessionId: session.id,
      status: 'completed',
    });

    // Списывает 1% комиссии платформы с баланса бизнеса (типа 'fee' для businessId)
    await walletRepository.createTransaction({
      userId: session.businessId,
      amount: platformFee,
      type: 'fee',
      sessionId: session.id,
      status: 'completed',
    });

    // 7. Возвращает JSON
    return NextResponse.json({
      success: true,
      paidReward: computedReward,
      platformFee: platformFee,
    });
  } catch (error: any) {
    console.error('Error completing referral session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
