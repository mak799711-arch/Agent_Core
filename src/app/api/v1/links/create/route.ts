import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, businessId, isSingleUse = true } = body;

    if (!agentId || !businessId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: link, error } = await supabase
      .from('payment_links')
      .insert({
        agent_id: agentId,
        business_id: businessId,
        is_single_use: isSingleUse,
        is_active: true,
        ttl_expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating payment link:', error);
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }

    return NextResponse.json({ linkId: link.id });
  } catch (err) {
    console.error('Payment link creation error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
