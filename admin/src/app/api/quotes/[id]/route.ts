import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { quotes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
    await db.update(quotes).set(body).where(eq(quotes.id, Number(params.id)));
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
