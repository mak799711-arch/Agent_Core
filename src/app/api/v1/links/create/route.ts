import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Client for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(authHeader.replace("Bearer ", ""));
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, businessId, isSingleUse = true } = body;

    if (!agentId || !businessId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (user.id !== agentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: link, error } = await supabaseAdmin
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
      return NextResponse.json({ error: error.message || 'Failed to create payment link' }, { status: 400 });
    }

    return NextResponse.json({ linkId: link.id });
  } catch (err: any) {
    console.error('Payment link creation error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
