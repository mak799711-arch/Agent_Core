const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jlymqwozbjazxhnretlw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseW1xd296YmphenhobnJldGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcxMTA4NiwiZXhwIjoyMDk4Mjg3MDg2fQ.W9EWCj1JBj2E-pNnuE4PyFGWuMKMeMpwUiglXqW32FE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching businesses...');
  const { data: businesses, error } = await supabase
    .from('business_profiles')
    .select('id, name');
    
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  console.log(`Found ${businesses.length} businesses. Setting coordinates to Bali...`);
  
  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    // Add some random offset so they aren't directly on top of each other
    const lat = -8.65 + (Math.random() * 0.05 - 0.025);
    const lng = 115.2167 + (Math.random() * 0.05 - 0.025);
    
    const { error: updateError } = await supabase
      .from('business_profiles')
      .update({ latitude: lat, longitude: lng })
      .eq('id', biz.id);
      
    if (updateError) {
      console.error(`Error updating ${biz.name}:`, updateError);
    } else {
      console.log(`Updated ${biz.name} to [${lat}, ${lng}]`);
    }
  }
  
  console.log('Done!');
}

main();
