import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require');

const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices' ORDER BY ordinal_position`;
console.log('Invoice columns:', cols.map(r => r.column_name));
await sql.end();
