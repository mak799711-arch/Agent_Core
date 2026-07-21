import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('id');

    if (!linkId) {
      return NextResponse.json({ error: 'Missing link ID' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Use admin client to bypass RLS for tourists scanning the QR
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: link, error: linkError } = await supabaseAdmin
      .from("payment_links")
      .select("business_id, agent_id, is_active, ttl_expires_at")
      .eq("id", linkId)
      .single();

    if (linkError || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ link });
  } catch (err: any) {
    console.error('Verify link error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
