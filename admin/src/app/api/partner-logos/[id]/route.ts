import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { partnerLogos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.imagePath !== undefined) updateData.imagePath = body.imagePath;
    if (body.href !== undefined) updateData.href = body.href;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await db.update(partnerLogos).set(updateData).where(eq(partnerLogos.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Partner logo PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await db.delete(partnerLogos).where(eq(partnerLogos.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Partner logo DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
