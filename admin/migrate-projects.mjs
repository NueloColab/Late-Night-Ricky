import postgres from 'postgres';

const sql = postgres('postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require');

async function migrate() {
  try {
    await sql`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
      ADD COLUMN IF NOT EXISTS deadline TEXT,
      ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS team JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS mood_board JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS contract_number TEXT
    `;
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();