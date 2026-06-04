import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const row = await db.select().from(invoices).where(eq(invoices.id, Number(params.id))).get();
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
    await db.update(invoices).set(body).where(eq(invoices.id, Number(params.id)));
    const row = await db.select().from(invoices).where(eq(invoices.id, Number(params.id))).get();
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
