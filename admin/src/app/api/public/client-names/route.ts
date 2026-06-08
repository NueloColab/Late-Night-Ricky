import { NextResponse } from 'next/server';
import { getClientNames } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const names = await getClientNames();
    return NextResponse.json({ names });
  } catch (err) {
    console.error('Public client names GET error:', err);
    return NextResponse.json({ names: [] }, { status: 500 });
  }
}
