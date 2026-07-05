const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

async function createTestUsers() {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  // 1. Create Partner
  console.log('Creating partner@agent.core...');
  const partnerRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'partner@agent.core',
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Test Partner' }
    })
  });
  const partnerData = await partnerRes.json();
  console.log('Partner creation:', partnerData);

  // Create Business
  console.log('Creating business@agent.core...');
  const bizRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: 'business@agent.core',
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Test Business' }
    })
  });
  const bizData = await bizRes.json();
  console.log('Business creation:', bizData);
}

createTestUsers();
