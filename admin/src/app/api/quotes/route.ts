import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { quotes } from '@/lib/db/schema';

import { eq, sql } from 'drizzle-orm';

// Known columns from the quotes schema to filter unknown keys
const knownQuoteColumns = new Set(Object.keys(quotes));

function cleanBody(body: any) {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null && knownQuoteColumns.has(key)) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export async function GET() {
  try {
    const all = await db.select().from(quotes).orderBy(quotes.id);
    return NextResponse.json({ quotes: all });
  } catch (err) {
    console.error('Quotes GET error:', err);
    return NextResponse.json({ quotes: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auto-generate quote number: use MAX to avoid collisions from deletions
    const maxResult = await db
      .select({ maxNum: sql<string>`COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 4) AS INTEGER)), 0)` })
      .from(quotes);
    const nextNum = (Number(maxResult[0]?.maxNum) || 0) + 1;
    const quoteNumber = `QT-${String(nextNum).padStart(3, '0')}`;
    
    const cleaned = cleanBody(body);
    const inserted = await db.insert(quotes).values({ ...cleaned, quoteNumber }).returning();
    return NextResponse.json({ quote: inserted[0] });
  } catch (err) {
    console.error('Quotes POST error:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
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
    
    await db.update(quotes).set(updateData).where(eq(quotes.id, id));
    const [row] = await db.select().from(quotes).where(eq(quotes.id, id));
    return NextResponse.json({ quote: row });
  } catch (err) {
    console.error('Quotes PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
