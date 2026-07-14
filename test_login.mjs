const SUPABASE_URL = 'https://jlymqwozbjazxhnretlw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UAku9POv0DvtqJCLn5-SyQ_8rkaIdkh'; // From .env.local but wait, I can just fetch from API

async function testLogin() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': 'sb_publishable_UAku9POv0DvtqJCLn5-SyQ_8rkaIdkh', // need the actual anon key
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'business@agent.core',
      password: 'password123'
    })
  });
  
  const data = await res.json();
  console.log('Login response:', data);
}

testLogin();
