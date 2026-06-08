import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { clientNames } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const names = await db.select().from(clientNames).orderBy(asc(clientNames.order));
    return NextResponse.json({ names });
  } catch (err) {
    console.error('Client names GET error:', err);
    return NextResponse.json({ names: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, order, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [item] = await db
      .insert(clientNames)
      .values({
        name,
        order: order ?? 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json({ name: item }, { status: 201 });
  } catch (err) {
    console.error('Client names POST error:', err);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}
