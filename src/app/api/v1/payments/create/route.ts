import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, businessId, agentId } = body;

    if (!amount || !businessId || !agentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Calculate splits (Default 10% global margin: 5% tourist discount, 4% agent, 1% platform)
    const TOURIST_DISCOUNT = 0.05;
    const AGENT_COMMISSION = 0.04;
    const PLATFORM_COMMISSION = 0.01;

    const touristDiscountAmount = amount * TOURIST_DISCOUNT;
    const finalPaymentAmount = amount - touristDiscountAmount; // This is what the tourist actually pays

    const agentCommissionAmount = amount * AGENT_COMMISSION;
    const platformCommissionAmount = amount * PLATFORM_COMMISSION;
    const businessShare = amount - touristDiscountAmount - agentCommissionAmount - platformCommissionAmount;

    // 2. Insert into tourist_payments
    // We store the finalPaymentAmount as the amount paid by tourist
    const { data: payment, error: paymentError } = await supabase
      .from('tourist_payments')
      .insert({
        amount: finalPaymentAmount,
        currency: currency || 'IDR',
        status: 'pending'
      })
      .select('id')
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    // 3. Insert into payment_splits
    const { error: splitError } = await supabase
      .from('payment_splits')
      .insert({
        payment_id: payment.id,
        agent_id: agentId,
        gross_amount: finalPaymentAmount, // The total money entered into the system
        business_share: businessShare,
        agent_commission: agentCommissionAmount,
        platform_commission: platformCommissionAmount,
        status: 'pending'
      });

    if (splitError) {
      console.error('Error creating payment split:', splitError);
      return NextResponse.json({ error: 'Failed to create payment split' }, { status: 500 });
    }

    // Return the payment ID
    return NextResponse.json({ paymentId: payment.id, finalAmount: finalPaymentAmount, currency });
  } catch (err) {
    console.error('Payment creation error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
