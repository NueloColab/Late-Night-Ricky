import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require');

// Check all invoices
const all = await sql`SELECT id, invoice_number, quote_id, status FROM invoices ORDER BY id`;
console.log('All invoices:', all);

// Check quote #2 line items
const q = await sql`SELECT line_items FROM quotes WHERE id = 2`;
console.log('Quote #2 line_items:', q[0]?.line_items, 'type:', typeof q[0]?.line_items);

// Try to insert a test invoice
const count = await sql`SELECT COUNT(*)::int as c FROM invoices`;
const nextNum = count[0].c + 1;
const invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;
console.log('Next invoice number:', invoiceNumber);

await sql`INSERT INTO invoices (invoice_number, client_name, client_email, project_title, line_items, subtotal, total, status, payment_token, quote_id)
  VALUES (${invoiceNumber}, 'Test', 'test@test.com', 'Test', ${'[]'}, 0, 0, 'draft', ${'test-token'}, 2)`;
console.log('Test insert succeeded!');

// Clean up
await sql`DELETE FROM invoices WHERE invoice_number = ${invoiceNumber}`;
console.log('Cleaned up test invoice');
await sql.end();
