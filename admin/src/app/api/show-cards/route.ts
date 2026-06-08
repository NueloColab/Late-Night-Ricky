import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { showCards } from '@/lib/db/schema';
import { asc, inArray } from 'drizzle-orm';

export async function GET() {
  try {
    const cards = await db.select().from(showCards).orderBy(asc(showCards.order));
    return NextResponse.json({ cards });
  } catch (err) {
    console.error('Show cards GET error:', err);
    return NextResponse.json({ cards: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, venue, location, season, description, href, imagePath, order, isActive } = body;

    if (!title || !venue) {
      return NextResponse.json({ error: 'Title and venue are required' }, { status: 400 });
    }

    const [card] = await db
      .insert(showCards)
      .values({
        title,
        venue,
        location: location || '',
        season: season || '',
        description: description || '',
        href: href || '#',
        imagePath: imagePath || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json({ card }, { status: 201 });
  } catch (err) {
    console.error('Show cards POST error:', err);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'IDs required' }, { status: 400 });
    }

    const idList = ids.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (idList.length === 0) {
      return NextResponse.json({ error: 'No valid IDs' }, { status: 400 });
    }

    await db.delete(showCards).where(inArray(showCards.id, idList));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Show cards DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
