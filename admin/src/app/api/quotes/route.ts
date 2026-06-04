import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes } from '@/lib/db/schema';

export async function GET() {
  try {
    const all = await db.select().from(quotes).orderBy(quotes.id).all();
    return NextResponse.json({ quotes: all });
  } catch (err) {
    console.error('Quotes GET error:', err);
    return NextResponse.json({ quotes: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inserted = await db.insert(quotes).values(body).returning();
    return NextResponse.json({ quote: inserted[0] });
  } catch (err) {
    console.error('Quotes POST error:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}
