const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

async function insertProfiles() {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const partnerId = '0060f815-1514-47cf-a978-689281619824';
  const bizId = 'c8db102a-6b07-4aa4-99db-fc49a1a36576';

  console.log('Inserting Partner Profile...');
  const res1 = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: partnerId,
      role: 'partner',
      full_name: 'Test Partner',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId}`
    })
  });
  console.log(await res1.json());

  console.log('Inserting Business Profile...');
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: bizId,
      role: 'business',
      full_name: 'Test Business',
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${bizId}`
    })
  });
  console.log(await res2.json());
}

insertProfiles();
