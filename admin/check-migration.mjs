import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require');

const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'quotes' AND column_name IN ('accept_token', 'email_sent_at', 'converted_to_invoice', 'invoice_id')`;
console.log('quotes new columns:', result.map(r => r.column_name));
const result2 = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices' AND column_name IN ('payment_token', 'payment_confirmed_by_client', 'payment_confirmed_at', 'payment_confirmation', 'email_sent_at', 'quote_id')`;
console.log('invoices new columns:', result2.map(r => r.column_name));
await sql.end();
