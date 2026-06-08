import { NextResponse } from 'next/server';
import { getSiteSections } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');

  if (!page) {
    return NextResponse.json({ error: 'Page parameter required' }, { status: 400 });
  }

  try {
    const sections = await getSiteSections(page);
    return NextResponse.json({ sections });
  } catch (err) {
    console.error('Public sections GET error:', err);
    return NextResponse.json({ sections: [] }, { status: 500 });
  }
}
