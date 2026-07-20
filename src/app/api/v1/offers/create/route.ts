import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Client for auth verification
    const supabaseAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(authHeader.replace("Bearer ", ""));
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Client with service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the business belongs to the user
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('owner_id')
      .eq('id', body.business_id)
      .single();

    if (!business || business.owner_id !== user.id) {
       return NextResponse.json({ error: "Forbidden: You can only create offers for your own business" }, { status: 403 });
    }
    
    // SECURITY FIX: Sanitize input and enforce margin boundaries
    let margin = Number(body.global_margin_percent);
    if (isNaN(margin)) margin = 10;
    if (margin < 1) margin = 1;
    if (margin > 100) margin = 100;

    const sanitizedBody = {
      business_id: body.business_id,
      title: body.title,
      global_margin_percent: margin,
      average_bill: body.average_bill,
      category: body.category,
      conditions: body.conditions,
      image_url: body.image_url,
      image_urls: body.image_urls,
      reward_amount: 0,
      reward_percent: 0,
      reward_type: 'percent',
      is_active: true
    };
    
    const { data, error } = await supabaseAdmin
      .from("offers")
      .insert(sanitizedBody)
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
