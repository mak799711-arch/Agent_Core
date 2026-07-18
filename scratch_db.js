async function test() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/payment_links`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        agent_id: '11111111-1111-1111-1111-111111111111',
        business_id: '22222222-2222-2222-2222-222222222222',
        is_single_use: true,
        is_active: true,
        ttl_expires_at: new Date().toISOString()
    })
  });
  const data = await res.text();
  console.log('Insert Result:', res.status, data);
}
test();
