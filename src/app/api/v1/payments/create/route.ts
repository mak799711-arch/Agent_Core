import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { xenditGateway } from '@/lib/services/payment/XenditGateway';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, businessId, agentId, linkId } = body;

    if (!amount || !businessId || !agentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let secureBusinessId = businessId;
    let secureAgentId = agentId;

    if (linkId) {
      const { data: link, error: linkError } = await supabaseAdmin
        .from('payment_links')
        .select('business_id, agent_id')
        .eq('id', linkId)
        .single();
        
      if (!linkError && link) {
        secureBusinessId = link.business_id;
        secureAgentId = link.agent_id;
      } else {
        return NextResponse.json({ error: 'Invalid link ID' }, { status: 400 });
      }
    }

    // Fetch the active offer for this business to get the global margin
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('offers')
      .select('global_margin_percent')
      .eq('business_id', secureBusinessId)
      .eq('is_active', true)
      .single();

    // Default to 10% if not found or no active offer
    const globalMarginPercent = offer?.global_margin_percent || 10.0;
    const globalMarginRatio = globalMarginPercent / 100.0;

    // 1. Calculate splits based on Global Margin
    // Tourist: 30% of margin, Agent: 60% of margin, Platform: 10% of margin
    const TOURIST_DISCOUNT = globalMarginRatio * 0.3;
    const AGENT_COMMISSION = globalMarginRatio * 0.6;
    const PLATFORM_COMMISSION = globalMarginRatio * 0.1;

    const touristDiscountAmount = amount * TOURIST_DISCOUNT;
    const finalPaymentAmount = amount - touristDiscountAmount; // This is what the tourist actually pays

    const agentCommissionAmount = amount * AGENT_COMMISSION;
    const platformCommissionAmount = amount * PLATFORM_COMMISSION;
    const businessShare = amount - touristDiscountAmount - agentCommissionAmount - platformCommissionAmount;

    // 2. Insert into tourist_payments
    // We store the finalPaymentAmount as the amount paid by tourist
    const { data: payment, error: paymentError } = await supabaseAdmin
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
    const { error: splitError } = await supabaseAdmin
      .from('payment_splits')
      .insert({
        payment_id: payment.id,
        agent_id: secureAgentId,
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invoice = await xenditGateway.createInvoice({
      externalId: `payment_${payment.id}`,
      amount: finalPaymentAmount,
      currency: currency || 'IDR',
      description: `Payment for Business ${secureBusinessId} via AgentCore`,
      successRedirectUrl: `${baseUrl}/checkout/success?payment_id=${payment.id}`,
      failureRedirectUrl: `${baseUrl}/checkout/failed?payment_id=${payment.id}`,
      splits: {
        platformFee: platformCommissionAmount
        // Real xenPlatform splits will require destination accounts config
      }
    });

    // Return the payment ID and the Xendit checkout URL
    return NextResponse.json({ 
      paymentId: payment.id, 
      finalAmount: finalPaymentAmount, 
      currency,
      checkoutUrl: invoice.invoiceUrl 
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
