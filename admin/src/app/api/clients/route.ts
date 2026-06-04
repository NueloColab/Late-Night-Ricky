import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema';

export async function GET() {
  try {
    const all = await db.select().from(clients).orderBy(clients.name);
    return NextResponse.json({ clients: all });
  } catch (err) {
    console.error('Clients GET error:', err);
    return NextResponse.json({ clients: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inserted = await db.insert(clients).values(body).returning();
    return NextResponse.json({ client: inserted[0] });
  } catch (err) {
    console.error('Clients POST error:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}
