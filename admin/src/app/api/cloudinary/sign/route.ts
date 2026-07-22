import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfllse3az',
  api_key: process.env.CLOUDINARY_API_KEY || '999646942898938',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ZPTfioQjEGd-KeWpi-6cWZm2XrQ',
  secure: true,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folder = 'nuelo/late-night-ricky/tracks' } = body;

    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || 'ZPTfioQjEGd-KeWpi-6cWZm2XrQ'
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY || '999646942898938',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dfllse3az',
    });
  } catch (err: any) {
    console.error('Cloudinary sign error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
