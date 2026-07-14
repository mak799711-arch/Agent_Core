import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

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

    const sqlFilePath = path.join(process.cwd(), 'add_ban_fields.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    await client.query(sql);
    console.log('Successfully applied add_ban_fields.sql');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
