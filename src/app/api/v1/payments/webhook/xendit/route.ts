import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { xenditGateway } from '@/lib/services/payment/XenditGateway';

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
      // Update tourist_payments
      const { error: paymentError } = await supabase
        .from('tourist_payments')
        .update({ status: 'completed' })
        .eq('id', paymentId);
        
      if (paymentError) throw paymentError;
      
      // Update payment_splits
      const { error: splitError } = await supabase
        .from('payment_splits')
        .update({ status: 'completed' })
        .eq('payment_id', paymentId);
        
      if (splitError) throw splitError;

      console.log(`Successfully processed payment ${paymentId}`);
      return NextResponse.json({ success: true, message: 'Payment completed' });
    }

    // 4. Handle EXPIRED or FAILED status
    if (status === 'EXPIRED') {
      await supabase.from('tourist_payments').update({ status: 'failed' }).eq('id', paymentId);
      await supabase.from('payment_splits').update({ status: 'failed' }).eq('payment_id', paymentId);
      return NextResponse.json({ success: true, message: 'Payment expired' });
    }

    return NextResponse.json({ success: true, message: 'Status unhandled' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
