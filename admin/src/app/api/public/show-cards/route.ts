import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { showCards } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const cards = await db.select().from(showCards).orderBy(asc(showCards.order));
    return NextResponse.json({ cards });
  } catch (err) {
    console.error('Public show cards GET error:', err);
    return NextResponse.json({ cards: [] }, { status: 500 });
  }
}
