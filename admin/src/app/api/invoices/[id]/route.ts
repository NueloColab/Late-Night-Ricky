import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Known columns from the invoices schema to filter unknown keys
const knownColumns = new Set(Object.keys(invoices));

function cleanBody(body: any) {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null && knownColumns.has(key)) {
      cleaned[key] = value;
    } else if (value === null && knownColumns.has(key)) {
      // Allow explicit nulls for clearing fields
      cleaned[key] = null;
    }
  }
  return cleaned;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [row] = await db.select().from(invoices).where(eq(invoices.id, Number(params.id)));
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ invoice: row });
  } catch (err) {
    console.error('Invoice GET error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    // Clean up paidAt: convert ISO string to Date, or null if empty
    if ('paidAt' in body) {
      body.paidAt = body.paidAt ? new Date(body.paidAt) : null;
    }
    // Auto-set sentAt when status changes to sent
    if (body.status === 'sent' && !body.sentAt) {
      body.sentAt = new Date();
    }
    // Auto-set paidAt when status changes to paid
    if (body.status === 'paid' && !body.paidAt) {
      body.paidAt = new Date();
    }
    // Clear paidAt when status is not paid
    if (body.status && body.status !== 'paid') {
      body.paidAt = null;
    }
    const cleaned = cleanBody(body);
    await db.update(invoices).set(cleaned).where(eq(invoices.id, Number(params.id)));
    const [row] = await db.select().from(invoices).where(eq(invoices.id, Number(params.id)));
    return NextResponse.json({ invoice: row });
  } catch (err) {
    console.error('Invoice PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(invoices).where(eq(invoices.id, Number(params.id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Invoice DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
