import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jlymqwozbjazxhnretlw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE'
);

async function check() {
  const { data, error } = await supabase.from('payment_links').select('*').limit(1);
  console.log('payment_links:', data, error);

  const { data: tp, error: tperror } = await supabase.from('tourist_payments').select('link_id').limit(1);
  console.log('tourist_payments.link_id:', tp, tperror);
}

check();
