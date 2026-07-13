import { supabase } from './src/lib/supabase/client';
async function test() {
  const {data, error} = await supabase.from('businesses').select('*');
  console.log('Businesses:', data);
  const {data: u} = await supabase.from('users').select('*');
  console.log('Users:', u?.map(x=>({id:x.id, role:x.role, lat:x.latitude})));
}
test();
