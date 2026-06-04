import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { showCards } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const updateData: any = {};
    if (body.imagePath !== undefined) updateData.imagePath = body.imagePath;
    if (body.venue !== undefined) updateData.venue = body.venue;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.season !== undefined) updateData.season = body.season;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.href !== undefined) updateData.href = body.href;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await db.update(showCards).set(updateData).where(eq(showCards.id, id))
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Show card PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
