import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { carouselImages } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const images = await db
      .select()
      .from(carouselImages)
      .where(eq(carouselImages.isActive, true))
      .orderBy(asc(carouselImages.order));
    return NextResponse.json({ images });
  } catch (err) {
    console.error('Failed to load carousel:', err);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}
