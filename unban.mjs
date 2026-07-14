import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function unbanAll() {
  // Show currently banned users first
  const { data: banned } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, is_blocked, ban_until, ban_reason')
    .eq('is_blocked', true);

  console.log('Currently banned users:', JSON.stringify(banned, null, 2));

  if (!banned || banned.length === 0) {
    console.log('No banned users found.');
    return;
  }

  // Unban all
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_blocked: false, ban_until: null, ban_reason: null })
    .eq('is_blocked', true);

  if (error) {
    console.error('Error unbanning:', error);
  } else {
    console.log(`✅ Successfully unbanned ${banned.length} user(s)!`);
    banned.forEach(u => console.log(`  - ${u.full_name} (${u.id})`));
  }
}

unbanAll();
