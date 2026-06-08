import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { carouselImages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { imagePath, alt, order, isActive } = body;

    await db
      .update(carouselImages)
      .set({
        imagePath: imagePath !== undefined ? imagePath : undefined,
        alt: alt !== undefined ? alt : undefined,
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      })
      .where(eq(carouselImages.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Carousel PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await db.delete(carouselImages).where(eq(carouselImages.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Carousel DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
