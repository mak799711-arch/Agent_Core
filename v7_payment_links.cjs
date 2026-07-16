const { Client } = require('pg');

const client = new Client({
  host: 'db.jlymqwozbjazxhnretlw.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '@eDJY,vS9j29vZk',
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres.');

    // 1. Create payment_links table (from V4 schema)
    const createLinks = `
      CREATE TABLE IF NOT EXISTS payment_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id UUID REFERENCES profiles(id) NOT NULL,
        business_id UUID REFERENCES businesses(id) NOT NULL,
        is_single_use BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        ttl_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client.query(createLinks);
    console.log('Successfully ensured payment_links table exists.');

    // 2. Add link_id to tourist_payments
    const alterTouristPayments = `
      ALTER TABLE tourist_payments 
      ADD COLUMN IF NOT EXISTS link_id UUID REFERENCES payment_links(id);
    `;
    await client.query(alterTouristPayments);
    console.log('Successfully altered tourist_payments table to add link_id.');

    // 3. Create terminals table (from V4 schema)
    const createTerminals = `
      CREATE TABLE IF NOT EXISTS terminals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES businesses(id) NOT NULL,
        mac_address VARCHAR(17) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'online')),
        last_ping_at TIMESTAMP WITH TIME ZONE
      );
    `;
    await client.query(createTerminals);
    console.log('Successfully ensured terminals table exists.');

    // 4. Add terminal_notified to tourist_payments
    const addTerminalNotified = `
      ALTER TABLE tourist_payments
      ADD COLUMN IF NOT EXISTS terminal_notified BOOLEAN DEFAULT false;
    `;
    await client.query(addTerminalNotified);
    console.log('Successfully added terminal_notified to tourist_payments.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
