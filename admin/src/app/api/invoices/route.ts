import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq, max, sql } from 'drizzle-orm';

function cleanBody(body: any) {
  // Strip undefined/null values and unknown columns to avoid DB errors
  const knownColumns = new Set(Object.keys(invoices));
  const cleaned: any = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null && knownColumns.has(key)) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

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
    // Use MAX to avoid collisions when invoices have been deleted
    let invoiceNumber = body.invoiceNumber;
    if (!invoiceNumber) {
      const maxResult = await db
        .select({ maxNum: sql<string>`COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0)` })
        .from(invoices);
      const nextNum = (Number(maxResult[0]?.maxNum) || 0) + 1;
      invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;
    }
    const cleaned = cleanBody(body);
    const inserted = await db.insert(invoices).values({ ...cleaned, invoiceNumber }).returning();
    return NextResponse.json({ invoice: inserted[0] });
  } catch (err) {
    console.error('Invoices POST error:', err);
    return NextResponse.json({ error: 'Insert failed', details: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    
    // Set sentAt when status changes to sent
    if (updateData.status === 'sent' && !updateData.sentAt) {
      updateData.sentAt = new Date();
    }
    // Set paidAt when status changes to paid
    if (updateData.status === 'paid' && !updateData.paidAt) {
      updateData.paidAt = new Date();
    }
    // Clear paidAt when marking as not paid
    if (updateData.status && updateData.status !== 'paid') {
      updateData.paidAt = null;
    }
    
    const cleaned = cleanBody(updateData);
    await db.update(invoices).set(cleaned).where(eq(invoices.id, id));
    const [row] = await db.select().from(invoices).where(eq(invoices.id, id));
    return NextResponse.json({ invoice: row });
  } catch (err) {
    console.error('Invoices PUT error:', err);
    return NextResponse.json({ error: 'Update failed', details: String(err) }, { status: 500 });
  }
}
