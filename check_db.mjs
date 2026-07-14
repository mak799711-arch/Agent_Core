import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDb() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('--- AUTH USERS ---');
    users.users.forEach(u => {
      console.log(`Email: ${u.email}, Banned until: ${u.banned_until}, id: ${u.id}`);
    });
  }

  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) {
    console.error('Error fetching profiles:', pError);
  } else {
    console.log('--- PUBLIC PROFILES ---');
    profiles.forEach(p => {
      console.log(`Email: ${p.email}, Role: ${p.role}, BanStatus: ${p.ban_status}, id: ${p.id}`);
    });
  }
}

checkDb();
