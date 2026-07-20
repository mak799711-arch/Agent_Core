import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { xenditGateway } from '@/lib/services/payment/XenditGateway';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // 1. Verify webhook signature
    const callbackToken = request.headers.get('x-callback-token') || '';
    if (!xenditGateway.verifyWebhook(callbackToken)) {
      console.error('Invalid Xendit Webhook Token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Xendit payload
    const payload = await request.json();
    const { external_id, status } = payload;
    
    // We expect external_id to be "payment_<uuid>"
    if (!external_id || !external_id.startsWith('payment_')) {
      return NextResponse.json({ error: 'Ignored: Invalid external_id' }, { status: 200 });
    }
    
    const paymentId = external_id.replace('payment_', '');

    // 3. Process PAID status
    if (status === 'PAID' || status === 'SETTLED') {
      // Get the payment split to know agent_id and agent_commission
      const { data: split, error: fetchError } = await supabaseAdmin
        .from('payment_splits')
        .select('agent_id, agent_commission, status')
        .eq('payment_id', paymentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Idempotency: prevent double processing if Xendit sends webhook twice
      if (split.status === 'completed' || split.status === 'settled') {
        console.log(`Payment ${paymentId} already completed. Ignoring duplicate webhook.`);
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Update tourist_payments
      const { error: paymentError } = await supabaseAdmin
        .from('tourist_payments')
        .update({ status: 'completed' })
        .eq('id', paymentId);
        
      if (paymentError) throw paymentError;
      
      // Update payment_splits
      const { error: splitError } = await supabaseAdmin
        .from('payment_splits')
        .update({ status: 'completed' })
        .eq('payment_id', paymentId);
        
      if (splitError) throw splitError;

      // Внутренний кошелек (transactions) удален. Прямые выплаты на карты.
      // TODO: Внедрить Xendit Platform API split rules для автоматического зачисления на привязанные карты агента и бизнеса.

      console.log(`Successfully processed payment ${paymentId}`);
      return NextResponse.json({ success: true, message: 'Payment completed' });
    }

    // 4. Handle EXPIRED or FAILED status
    if (status === 'EXPIRED') {
      await supabaseAdmin.from('tourist_payments').update({ status: 'failed' }).eq('id', paymentId);
      await supabaseAdmin.from('payment_splits').update({ status: 'failed' }).eq('payment_id', paymentId);
      return NextResponse.json({ success: true, message: 'Payment expired' });
    }

    return NextResponse.json({ success: true, message: 'Status unhandled' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
