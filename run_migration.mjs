import { Client } from 'pg';

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

    const alterOffers = `
      ALTER TABLE offers 
      ADD COLUMN IF NOT EXISTS customer_discount_percent DECIMAL(5,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS platform_fee_percent DECIMAL(5,2) DEFAULT 1.00;
    `;
    await client.query(alterOffers);
    console.log('Successfully altered "offers" table.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
