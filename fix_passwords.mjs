const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

async function updatePasswords() {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers });
  const { users } = await usersRes.json();
  
  for (const u of users) {
    if (u.email === 'business@agent.core' || u.email === 'partner@agent.core') {
      console.log(`Updating password for ${u.email}...`);
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ password: 'password123', email_confirm: true })
      });
      console.log(`Updated ${u.email}`);
    }
  }
}

updatePasswords();
