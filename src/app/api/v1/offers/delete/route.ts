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

    const { offerId } = await req.json();
    
    if (!offerId) {
       return NextResponse.json({ error: "Missing offerId" }, { status: 400 });
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
    
    // 3. Delete it
    const { error } = await supabaseAdmin
      .from("offers")
      .delete()
      .eq("id", offerId);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
