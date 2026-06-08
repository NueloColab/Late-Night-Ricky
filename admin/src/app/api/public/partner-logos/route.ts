import { NextResponse } from 'next/server';
import { getPartnerLogos } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logos = await getPartnerLogos();
    return NextResponse.json({ logos });
  } catch (err) {
    console.error('Public partner logos GET error:', err);
    return NextResponse.json({ logos: [] }, { status: 500 });
  }
}
