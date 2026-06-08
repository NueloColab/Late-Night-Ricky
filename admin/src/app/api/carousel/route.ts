import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { carouselImages } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const images = await db.select().from(carouselImages).orderBy(asc(carouselImages.order));
    return NextResponse.json({ images });
  } catch (err) {
    console.error('Carousel GET error:', err);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imagePath, alt, page, order, isActive } = body;

    const [image] = await db
      .insert(carouselImages)
      .values({
        imagePath: imagePath || null,
        alt: alt || '',
        page: page || 'home',
        order: order ?? 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json({ image }, { status: 201 });
  } catch (err) {
    console.error('Carousel POST error:', err);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}
