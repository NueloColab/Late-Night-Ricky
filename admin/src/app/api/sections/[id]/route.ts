import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { siteSections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.content !== undefined) updateData.content = typeof body.content === 'string' ? body.content : JSON.stringify(body.content);
    if (body.images !== undefined) updateData.images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images);
    if (body.videos !== undefined) updateData.videos = typeof body.videos === 'string' ? body.videos : JSON.stringify(body.videos);
    if (body.links !== undefined) updateData.links = typeof body.links === 'string' ? body.links : JSON.stringify(body.links);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isVisible !== undefined) updateData.isVisible = body.isVisible;
    if (body.order !== undefined) updateData.order = body.order;

    await db.update(siteSections).set(updateData).where(eq(siteSections.id, id))

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Section PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
