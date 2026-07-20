import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { xenditGateway } from '@/lib/services/payment/XenditGateway';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, linkId } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000000000) {
      return NextResponse.json({ error: 'Invalid amount or missing link ID' }, { status: 400 });
    }

    const { data: link, error: linkError } = await supabaseAdmin
      .from('payment_links')
      .select('business_id, agent_id, is_single_use, is_active, ttl_expires_at')
      .eq('id', linkId)
      .single();
      
    if (linkError || !link || !link.is_active || new Date(link.ttl_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invalid, inactive, or expired link ID' }, { status: 400 });
    }

    const secureBusinessId = link.business_id;
    const secureAgentId = link.agent_id;

    // Сжигаем одноразовую ссылку атомарно, чтобы предотвратить Race Condition
    if (link.is_single_use) {
      const { data: updatedLink, error: updateError } = await supabaseAdmin
        .from('payment_links')
        .update({ is_active: false })
        .eq('id', linkId)
        .eq('is_active', true)
        .select()
        .single();
        
      if (updateError || !updatedLink) {
        return NextResponse.json({ error: 'Link already used or being processed' }, { status: 409 });
      }
    }

    // Fetch the active offer for this business to get the global margin
    const { data: offer, error: offerError } = await supabaseAdmin
      .from('offers')
      .select('global_margin_percent')
      .eq('business_id', secureBusinessId)
      .eq('is_active', true)
      .single();
      
    // SECURITY FIX: Ensure the agent and business are still not banned at the moment of payment
    const { data: agentProfile } = await supabaseAdmin.from('profiles').select('status').eq('id', secureAgentId).single();
    if (!agentProfile || agentProfile.status === 'banned') {
      return NextResponse.json({ error: 'Agent is banned' }, { status: 403 });
    }
    
    const { data: businessOwner } = await supabaseAdmin.from('businesses').select('owner_id').eq('id', secureBusinessId).single();
    if (businessOwner) {
      const { data: ownerProfile } = await supabaseAdmin.from('profiles').select('status').eq('id', businessOwner.owner_id).single();
      if (!ownerProfile || ownerProfile.status === 'banned') {
        return NextResponse.json({ error: 'Business is banned' }, { status: 403 });
      }
    }

    // Default to 10% if not found or no active offer
    const globalMarginPercent = offer?.global_margin_percent || 10.0;
    const globalMarginRatio = globalMarginPercent / 100.0;

    // 1. Calculate splits based on Global Margin
    // Tourist: 30% of margin, Agent: 60% of margin, Platform: 10% of margin
    const TOURIST_DISCOUNT = globalMarginRatio * 0.3;
    const AGENT_COMMISSION = globalMarginRatio * 0.6;
    const PLATFORM_COMMISSION = globalMarginRatio * 0.1;

    const touristDiscountAmount = Math.round(parsedAmount * TOURIST_DISCOUNT);
    const finalPaymentAmount = Math.round(parsedAmount - touristDiscountAmount); // This is what the tourist actually pays

    const agentCommissionAmount = Math.round(parsedAmount * AGENT_COMMISSION);
    const platformCommissionAmount = Math.round(parsedAmount * PLATFORM_COMMISSION);
    const businessShare = finalPaymentAmount - agentCommissionAmount - platformCommissionAmount;

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
