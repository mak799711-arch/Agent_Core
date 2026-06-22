import { NextRequest, NextResponse } from 'next/server';
import { authService, offerRepository, referralRepository } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "code" is required' },
        { status: 400 }
      );
    }

    // 1. Находим активную реферальную сессию (в статусе 'pending') по этому коду.
    const session = await referralRepository.getSessionByCode(code);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Active referral session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Referral session is not pending' },
        { status: 404 }
      );
    }

    // 2. Подгружаем соответствующий оффер
    const offer = await offerRepository.getOfferById(session.offerId);
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found for this session' },
        { status: 404 }
      );
    }

    // 3. Подгружаем соответствующий профиль бизнеса (заведения)
    const users = await authService.getAllUsers();
    const biz = users.find((u) => u.id === session.businessId);

    if (!biz) {
      return NextResponse.json(
        { success: false, error: 'Business profile not found' },
        { status: 404 }
      );
    }

    // 4. Возвращаем JSON
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        shortCode: session.shortCode,
        status: session.status,
      },
      offer: {
        id: offer.id,
        title: offer.title,
        rewardAmount: offer.rewardAmount,
        rewardType: offer.rewardType,
        rewardPercent: offer.rewardPercent,
        conditions: offer.conditions,
      },
      business: {
        id: biz.id,
        name: biz.fullName,
      },
    });
  } catch (error: any) {
    console.error('Error verifying referral code:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
