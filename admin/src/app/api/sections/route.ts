import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { siteSections } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');

  if (!page) {
    return NextResponse.json({ error: 'Page parameter required' }, { status: 400 });
  }

  try {
    const sections = await db
      .select()
      .from(siteSections)
      .where(eq(siteSections.page, page as any))
      .orderBy(asc(siteSections.order));

    return NextResponse.json({ sections });
  } catch (err) {
    console.error('Sections GET error:', err);
    return NextResponse.json({ sections: [] }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await request.json();
    const [section] = await db.update(siteSections)
      .set({
        content: body.content,
        images: body.images,
        videos: body.videos,
        links: body.links,
        isActive: body.isActive,
        updatedAt: new Date(),
      })
      .where(eq(siteSections.id, Number(id)))
      .returning();
    return NextResponse.json({ section });
  } catch (err: any) {
    console.error('Sections PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
