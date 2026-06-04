import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';
import { storeFile } from '@/lib/storage';
import { cookies } from 'next/headers';
import path from 'path';

function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('origin') || undefined),
  });
}

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('lnr_admin_session')?.value || cookieStore.get('lnr_session')?.value;
  return !!session;
}

export async function GET(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const ids = searchParams.get('ids');

    let query = db.select().from(submissions).$dynamic();
    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(eq(submissions.status, status as any));
    }
    if (ids) {
      const idList = ids.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
      if (idList.length > 0) {
        conditions.push(inArray(submissions.id, idList));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const all = await query.orderBy(desc(submissions.createdAt)).all();
    return NextResponse.json({ submissions: all }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Submissions GET error:', err);
    return NextResponse.json({ submissions: [] }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const artistName = formData.get('artistName') as string | null;
    const trackTitle = formData.get('trackTitle') as string | null;
    const file = formData.get('file') as File | null;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400, headers: corsHeaders() });
    }

    let filePath: string | null = null;
    let fileSize: number | null = null;

    if (file) {
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File must be under 20MB' }, { status: 400, headers: corsHeaders() });
      }

      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
        return NextResponse.json({ error: 'Only MP3 and WAV files are allowed' }, { status: 400, headers: corsHeaders() });
      }

      const ext = path.extname(file.name) || '.mp3';
      const filename = `submission-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const { url, size } = await storeFile(file, filename, {
        contentType: file.type,
      });

      filePath = url;
      fileSize = size;
    }

    const row = await db
      .insert(submissions)
      .values({
        email,
        artistName: artistName || null,
        trackTitle: trackTitle || null,
        filePath,
        fileSize,
        status: 'new',
      })
      .returning()
      .get();

    return NextResponse.json({ success: true, submission: row }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Submission POST error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500, headers: corsHeaders() });
  }
}

export async function PATCH(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400, headers: corsHeaders() });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    await db.update(submissions).set(updates).where(eq(submissions.id, id));
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Submission PATCH error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500, headers: corsHeaders() });
  }
}

export async function DELETE(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'IDs required' }, { status: 400, headers: corsHeaders() });
    }

    const idList = ids.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
    if (idList.length === 0) {
      return NextResponse.json({ error: 'No valid IDs' }, { status: 400, headers: corsHeaders() });
    }

    await db.delete(submissions).where(inArray(submissions.id, idList));
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Submission DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500, headers: corsHeaders() });
  }
}
