const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

async function run() {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  // 1. Fetch profiles
  console.log('Fetching profiles...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers });
  const profiles = await res.json();
  
  if (profiles.error) {
    console.error('Error fetching profiles', profiles);
    return;
  }
  
  // Find the user. The user's name is probably "Максим" or "Mak" or something.
  // Wait, I can just update the role for ALL profiles that currently have role='admin' or role='business'?
  // Or I can just log all profiles to see which one to change.
  console.log('Found profiles:');
  profiles.forEach(p => console.log(`ID: ${p.id} | Role: ${p.role} | Name: ${p.full_name} | Created: ${p.created_at}`));
}

run();
