import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require');

// Get quote #2 data
const quotes = await sql`SELECT * FROM quotes WHERE id = 2`;
const quote = quotes[0];
console.log('Quote #2 data:');
console.log('  clientName:', quote.client_name);
console.log('  clientEmail:', quote.client_email);
console.log('  projectTitle:', quote.project_title);
console.log('  lineItems:', quote.line_items);
console.log('  subtotal:', quote.subtotal);
console.log('  taxRate:', quote.tax_rate);
console.log('  vatEnabled:', quote.vat_enabled);
console.log('  total:', quote.total);
console.log('  discount:', quote.discount);
console.log('  paymentTerms:', quote.payment_terms);
console.log('  paymentTermsType:', quote.payment_terms_type);
console.log('  paymentTermsLabel:', quote.payment_terms_label);
console.log('  paymentMethod:', quote.payment_method);
console.log('  paymentSchedule:', quote.payment_schedule);
console.log('  notes:', quote.notes);

// Try exact insert like accept API does
const count = await sql`SELECT COUNT(*)::int as c FROM invoices`;
const nextNum = count[0].c + 1;
const invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;

const lineItems = Array.isArray(quote.line_items) ? quote.line_items : [];
const paymentSchedule = Array.isArray(quote.payment_schedule) && quote.payment_schedule.length > 0
  ? quote.payment_schedule
  : [{ label: 'Full Payment', percent: 100, due: 'Due on receipt', amount: quote.total, status: 'pending' }];

try {
  await sql`INSERT INTO invoices (
    project_id, client_name, client_email, client_company, project_title,
    invoice_number, line_items, notes, subtotal, tax_rate, vat_enabled,
    total, discount, status, payment_terms, payment_terms_type, payment_terms_label,
    payment_method, payment_schedule, quote_id, payment_token, payment_confirmed_by_client,
    sent_at
  ) VALUES (
    ${quote.project_id}, ${quote.client_name}, ${quote.client_email}, ${quote.client_company}, ${quote.project_title},
    ${invoiceNumber}, ${JSON.stringify(lineItems)}, ${quote.notes}, ${quote.subtotal}, ${quote.tax_rate}, ${quote.vat_enabled},
    ${quote.total}, ${quote.discount ? JSON.stringify(quote.discount) : '{}'}, ${'sent'}, ${quote.payment_terms}, ${quote.payment_terms_type}, ${quote.payment_terms_label},
    ${quote.payment_method || 'bank-transfer'}, ${JSON.stringify(paymentSchedule)}, ${2}, ${'test-token-123'}, ${false},
    ${new Date()}
  )`;
  console.log('Insert succeeded with invoice number:', invoiceNumber);
  
  // Clean up
  await sql`DELETE FROM invoices WHERE invoice_number = ${invoiceNumber}`;
  console.log('Cleaned up');
} catch (e) {
  console.error('Insert failed:', e);
}

await sql.end();
