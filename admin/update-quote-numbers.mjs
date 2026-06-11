import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require');

const allQuotes = await sql`SELECT id FROM quotes ORDER BY id`;
for (let i = 0; i < allQuotes.length; i++) {
  const quoteId = allQuotes[i].id;
  const quoteNumber = `QT-${String(i + 1).padStart(3, '0')}`;
  await sql`UPDATE quotes SET quote_number = ${quoteNumber} WHERE id = ${quoteId}`;
  console.log(`Updated quote #${quoteId} → ${quoteNumber}`);
}
await sql.end();
