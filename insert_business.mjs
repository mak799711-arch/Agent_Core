const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

async function insertBusiness() {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const bizId = 'c8db102a-6b07-4aa4-99db-fc49a1a36576'; // Test Business user ID

  console.log('Inserting Business Record...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/businesses`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      owner_id: bizId,
      name: 'Test Business Venue',
      description: 'A test venue for demo purposes',
      is_verified: false
    })
  });
  console.log(await res.json());
}

insertBusiness();
