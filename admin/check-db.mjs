import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require');

const invoices = await sql`SELECT id, invoice_number, quote_id, client_name, client_email, status, sent_at FROM invoices WHERE quote_id = 2`;
console.log('Invoices for quote #2:', invoices);

const quotes = await sql`SELECT id, status, converted_to_invoice, invoice_id, accept_token, client_email FROM quotes WHERE id = 2`;
console.log('Quote #2:', quotes);
await sql.end();
