import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the caller is an admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch payment links
    const { data: links, error: linksError } = await supabaseAdmin
      .from('payment_links')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (linksError && linksError.code !== 'PGRST116') {
      console.error('Error fetching links:', linksError);
    }

    // Fetch payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payment_splits')
      .select('*, tourist_payments(*)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (paymentsError && paymentsError.code !== 'PGRST116') {
      console.error('Error fetching payments:', paymentsError);
    }

    const auditLogs = [];

    if (links) {
      links.forEach(link => {
        auditLogs.push({
          id: `link-${link.id}`,
          type: 'link',
          agentId: link.agent_id,
          businessId: link.business_id,
          status: link.is_active ? 'active' : 'used/inactive',
          createdAt: link.created_at || new Date().toISOString(),
          isSingleUse: link.is_single_use,
          ttlExpiresAt: link.ttl_expires_at,
          originalId: link.id
        });
      });
    }

    if (payments) {
      payments.forEach(payment => {
        auditLogs.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          agentId: payment.agent_id,
          businessId: 'N/A', // Business ID might not be directly on split, we will render it from agent
          status: payment.status || 'success',
          createdAt: payment.created_at || new Date().toISOString(),
          amount: payment.gross_amount,
          agentCommission: payment.agent_commission,
          platformCommission: payment.platform_commission,
          originalId: payment.id
        });
      });
    }

    // Sort combined logs by date descending
    auditLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, sessions: auditLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
