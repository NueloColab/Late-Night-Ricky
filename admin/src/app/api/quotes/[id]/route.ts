import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { quotes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Known columns from the quotes schema to filter unknown keys
const knownQuoteColumns = new Set(Object.keys(quotes));

function cleanBody(body: any) {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null && knownQuoteColumns.has(key)) {
      cleaned[key] = value;
    } else if (value === null && knownQuoteColumns.has(key)) {
      cleaned[key] = null;
    }
  }
  return cleaned;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [row] = await db.select().from(quotes).where(eq(quotes.id, Number(params.id)));
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ quote: row });
  } catch (err) {
    console.error('Quote GET error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    // Set sentAt when status changes to sent
    if (body.status === 'sent' && !body.sentAt) {
      body.sentAt = new Date();
    }
    const cleaned = cleanBody(body);
    await db.update(quotes).set(cleaned).where(eq(quotes.id, Number(params.id)));
    const [row] = await db.select().from(quotes).where(eq(quotes.id, Number(params.id)));
    return NextResponse.json({ quote: row });
  } catch (err) {
    console.error('Quote PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(quotes).where(eq(quotes.id, Number(params.id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Quote DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}