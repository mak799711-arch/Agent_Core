import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    // 1. Mark payment as completed
    const { error: paymentError } = await supabase
      .from('tourist_payments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', paymentId)
      .eq('status', 'pending');

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    // 2. Fetch the split details
    const { data: split, error: splitFetchError } = await supabase
      .from('payment_splits')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('status', 'pending')
      .single();

    if (splitFetchError || !split) {
      console.error('Error fetching split:', splitFetchError);
      // Might have already been processed
      return NextResponse.json({ success: true, message: 'Payment completed, split not found or already processed' });
    }

    // 3. Update split status to applied
    await supabase
      .from('payment_splits')
      .update({ status: 'applied' })
      .eq('id', split.id);

    // 4. Upsert agent wallet if it doesn't exist (handle safely)
    const { data: wallet, error: walletFetchError } = await supabase
      .from('agent_wallets')
      .select('id')
      .eq('agent_id', split.agent_id)
      .maybeSingle();

    let walletId = wallet?.id;

    if (!walletId) {
      // Create wallet
      const { data: newWallet, error: newWalletError } = await supabase
        .from('agent_wallets')
        .insert({ agent_id: split.agent_id, balance: 0, currency: 'IDR' })
        .select('id')
        .single();
        
      if (newWalletError) {
        console.error('Error creating wallet:', newWalletError);
        return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
      }
      walletId = newWallet.id;
    }

    // 5. Add to wallet_transactions (trigger will update the balance)
    const { error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: walletId,
        type: 'commission_credit',
        amount: split.agent_commission,
        reference_id: paymentId,
        description: `Commission for payment ${paymentId}`
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Simulate success error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
