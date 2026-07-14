const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

async function checkDb() {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers });
  const usersData = await usersRes.json();
  console.log('--- AUTH USERS ---');
  if (usersData.users) {
    usersData.users.forEach(u => {
      console.log(`Email: ${u.email}, Banned until: ${u.banned_until}, id: ${u.id}`);
    });
  } else {
    console.log(usersData);
  }

  const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers });
  const profData = await profRes.json();
  console.log('--- PUBLIC PROFILES ---');
  if (Array.isArray(profData)) {
    profData.forEach(p => {
      console.log(`Email: ${p.email}, Role: ${p.role}, id: ${p.id}, Status: ${p.status}`);
    });
  } else {
    console.log(profData);
  }
}

checkDb();
