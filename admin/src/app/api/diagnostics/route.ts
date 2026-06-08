import { NextResponse } from 'next/server';
import { getBlobStatus } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getBlobStatus();
  return NextResponse.json({
    blob: status,
    env: {
      nodeEnv: process.env.NODE_ENV,
      storage: 'cloudinary',
    },
  });
}