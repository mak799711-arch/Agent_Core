const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

async function checkStatus() {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.business@agent.core&select=*`, { headers });
  // wait, email is not in profiles! We must get id from auth users
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers });
  const authData = await authRes.json();
  const user = authData.users.find(u => u.email === 'business@agent.core');
  
  if (user) {
    const profRes2 = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`, { headers });
    const profData2 = await profRes2.json();
    console.log(profData2);
  }
}

checkStatus();
