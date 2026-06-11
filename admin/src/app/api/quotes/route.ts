import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { quotes } from '@/lib/db/schema';

import { eq, sql } from 'drizzle-orm';

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
    
    // Auto-generate quote number: count existing quotes + 1
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(quotes);
    const count = countResult[0]?.count ?? 0;
    const quoteNumber = `QT-${String(count + 1).padStart(3, '0')}`;
    
    const inserted = await db.insert(quotes).values({ ...body, quoteNumber }).returning();
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
