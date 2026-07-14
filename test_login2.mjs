import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jlymqwozbjazxhnretlw.supabase.co';
const supabaseAnonKey = 'sb_publishable_UAku9POv0DvtqJCLn5-SyQ_8rkaIdkh';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'business@agent.core',
    password: 'password123',
  });

  if (error) {
    console.error('Sign in error:', error.message);
  } else {
    console.log('Sign in success! User:', data.user.email);
  }
}

testSignIn();
