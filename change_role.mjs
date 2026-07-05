import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function changeRole() {
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  const targetUser = users.users.find(u => u.email === 'mak799711@gmail.com');
  if (!targetUser) {
    console.error('User mak799711@gmail.com not found');
    return;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'partner' })
    .eq('id', targetUser.id)
    .select();
    
  if (error) {
    console.error('Error updating role:', error);
  } else {
    console.log('Successfully updated role for', targetUser.email, 'to partner');
    console.log(data);
  }
}

changeRole();
