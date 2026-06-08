import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || `upload-${Date.now()}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dfllse3az';
    const apiKey = process.env.CLOUDINARY_API_KEY || '999646942898938';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'ZPTfioQjEGd-KeWpi-6cWZm2XrQ';

    const folder = 'nuelo/late-night-ricky/media';
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        public_id: publicId,
        overwrite: true,
      },
      apiSecret
    );

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      publicId,
    });
  } catch (err: any) {
    console.error('[Upload Signature] Error:', err);
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 });
  }
}