import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { partnerLogos } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const logos = await db.select().from(partnerLogos).orderBy(asc(partnerLogos.order));
    return NextResponse.json({ logos });
  } catch (err) {
    console.error('Partner logos GET error:', err);
    return NextResponse.json({ logos: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, imagePath, href, order, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [logo] = await db
      .insert(partnerLogos)
      .values({
        name,
        imagePath: imagePath || null,
        href: href || null,
        order: order ?? 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json({ logo }, { status: 201 });
  } catch (err) {
    console.error('Partner logos POST error:', err);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}
