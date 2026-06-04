import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { count } from 'drizzle-orm';

export async function GET() {
  try {
    const all = await db.select().from(invoices).orderBy(invoices.invoiceNumber);
    return NextResponse.json({ invoices: all });
  } catch (err) {
    console.error('Invoices GET error:', err);
    return NextResponse.json({ invoices: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Auto-generate invoice number if not provided
    let invoiceNumber = body.invoiceNumber;
    if (!invoiceNumber) {
      const [countRow] = await db.select({ count: count() }).from(invoices);
      const nextNum = (countRow?.count || 0) + 1;
      invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;
    }
    const inserted = await db.insert(invoices).values({ ...body, invoiceNumber }).returning();
    return NextResponse.json({ invoice: inserted[0] });
  } catch (err) {
    console.error('Invoices POST error:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}
