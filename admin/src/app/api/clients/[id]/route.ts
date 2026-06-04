import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [row] = await db.select().from(clients).where(eq(clients.id, Number(params.id)));
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ client: row });
  } catch (err) {
    console.error('Client GET error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    await db.update(clients).set(body).where(eq(clients.id, Number(params.id)));
    const [row] = await db.select().from(clients).where(eq(clients.id, Number(params.id)));
    return NextResponse.json({ client: row });
  } catch (err) {
    console.error('Client PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(clients).where(eq(clients.id, Number(params.id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Client DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
