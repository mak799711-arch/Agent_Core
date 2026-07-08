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

    console.log('Received Loyverse Webhook payload:', JSON.stringify(body, null, 2));

    const note = body.receipt?.note || body.note || '';
    const totalMoney = body.receipt?.total_money || body.total_money || body.billAmount;
    
    // Find 6-digit numeric referral code in the note or body fields
    let code = '';
    const match = String(note || body.code || body.referralCode || '').match(/\b\d{6}\b/);
    if (match) {
      code = match[0];
    } else {
      const fallbackCode = String(body.code || body.referralCode || '').trim();
      if (fallbackCode.length === 6 && /^\d+$/.test(fallbackCode)) {
        code = fallbackCode;
      }
    }

    const billAmount = typeof totalMoney === 'number' ? totalMoney : parseFloat(totalMoney);

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'No valid 6-digit referral code found in note or request fields' },
        { status: 400 }
      );
    }

    if (isNaN(billAmount) || billAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid positive total amount / billAmount is required' },
        { status: 400 }
      );
    }

    // 1. Find referral session
    const session = await referralRepository.getSessionByCode(code);
    if (!session) {
      return NextResponse.json(
        { success: false, error: `No active referral session found for code ${code}` },
        { status: 404 }
      );
    }

    if (session.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Referral session is already completed or expired' },
        { status: 400 }
      );
    }

    // 2. Fetch the offer details
    const offer = await offerRepository.getOfferById(session.offerId);
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found for this referral session' },
        { status: 404 }
      );
    }

    // 3. Compute rewards & fees
    let computedReward = offer.rewardAmount;
    if (offer.rewardType === 'percentage' && offer.rewardPercent !== null) {
      computedReward = billAmount * (offer.rewardPercent / 100);
    }
    computedReward = Math.round(computedReward * 100) / 100;

    // Platform fee (dynamic from DB, fallback to 1%)
    const feePercent = offer.platformFeePercent ?? 1.00;
    const platformFee = Math.round(billAmount * (feePercent / 100) * 100) / 100;
    const totalRequired = computedReward + platformFee;

    // 4. Verify balance
    const businessBalance = await walletRepository.getBalance(session.businessId);
    if (businessBalance < totalRequired) {
      return NextResponse.json(
        { success: false, error: 'Insufficient business balance to complete Loyverse referral' },
        { status: 400 }
      );
    }

    // 5. Complete session
    await referralRepository.completeSession(session.id);

    // 6. Record transactions
    // Partner gets rewarded
    await walletRepository.createTransaction({
      userId: session.partnerId,
      amount: computedReward,
      type: 'reward',
      sessionId: session.id,
      status: 'completed',
    });

    // Business pays reward
    await walletRepository.createTransaction({
      userId: session.businessId,
      amount: computedReward,
      type: 'fee',
      sessionId: session.id,
      status: 'completed',
    });

    // Business pays platform fee
    await walletRepository.createTransaction({
      userId: session.businessId,
      amount: platformFee,
      type: 'fee',
      sessionId: session.id,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      message: 'Loyverse webhook processed successfully',
      referralCode: code,
      receiptId: body.receipt?.id || body.receipt_number || 'mock-loyverse-receipt',
      paidReward: computedReward,
      platformFee: platformFee
    });

  } catch (error: any) {
    console.error('Error handling Loyverse webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
