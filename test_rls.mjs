const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UAku9POv0DvtqJCLn5-SyQ_8rkaIdkh';

async function testUpdate() {
  const targetId = '0060f815-1514-47cf-a978-689281619824';
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${targetId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ status: 'banned', is_blocked: true })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Result:', text);
}

testUpdate();
