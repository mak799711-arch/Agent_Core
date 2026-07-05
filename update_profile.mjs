const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

async function run() {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const userId = '4f765405-de6c-4932-b29f-0f617db36d17';
  console.log('Updating role to partner for', userId);
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ role: 'partner' })
  });
  
  const updated = await res.json();
  console.log('Update result:', updated);
}

run();
