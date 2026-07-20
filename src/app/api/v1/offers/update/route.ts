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
    const { offerId, updates } = body;
    
    if (!offerId || !updates) {
       return NextResponse.json({ error: "Missing offerId or updates" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Get the offer to find its business_id
    const { data: offer } = await supabaseAdmin.from('offers').select('business_id').eq('id', offerId).single();
    if (!offer) {
       return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }
    
    // 2. Verify business belongs to user
    const { data: business } = await supabaseAdmin.from('businesses').select('owner_id').eq('id', offer.business_id).single();
    if (!business || business.owner_id !== user.id) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // 3. Sanitize updates
    const sanitizedUpdates: any = {};
    if (updates.title !== undefined) sanitizedUpdates.title = updates.title;
    if (updates.average_bill !== undefined) sanitizedUpdates.average_bill = updates.average_bill;
    if (updates.category !== undefined) sanitizedUpdates.category = updates.category;
    if (updates.conditions !== undefined) sanitizedUpdates.conditions = updates.conditions;
    if (updates.is_active !== undefined) sanitizedUpdates.is_active = updates.is_active;
    if (updates.image_url !== undefined) sanitizedUpdates.image_url = updates.image_url;
    if (updates.image_urls !== undefined) sanitizedUpdates.image_urls = updates.image_urls;

    if (updates.global_margin_percent !== undefined) {
      let margin = Number(updates.global_margin_percent);
      if (isNaN(margin)) margin = 10;
      if (margin < 1) margin = 1;
      if (margin > 100) margin = 100;
      sanitizedUpdates.global_margin_percent = margin;
    }
    
    // 4. Update it
    const { data, error } = await supabaseAdmin
      .from("offers")
      .update(sanitizedUpdates)
      .eq("id", offerId)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
