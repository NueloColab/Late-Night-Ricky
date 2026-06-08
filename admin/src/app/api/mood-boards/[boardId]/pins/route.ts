import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { moodBoardPins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/mood-boards/:boardId/pins
export async function GET(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const boardId = Number(params.boardId);
    if (isNaN(boardId)) {
      return NextResponse.json({ error: 'Invalid board ID' }, { status: 400 });
    }

    const pins = await db
      .select()
      .from(moodBoardPins)
      .where(eq(moodBoardPins.boardId, boardId));

    return NextResponse.json({ pins });
  } catch (err) {
    console.error('Failed to fetch pins:', err);
    return NextResponse.json({ pins: [] }, { status: 500 });
  }
}

// POST /api/mood-boards/:boardId/pins
export async function POST(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const boardId = Number(params.boardId);
    const body = await request.json();
    const { imageUrl, caption } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    const [pin] = await db
      .insert(moodBoardPins)
      .values({
        boardId,
        imageUrl,
        caption: caption || null,
      })
      .returning();

    return NextResponse.json({ pin });
  } catch (err) {
    console.error('Failed to create pin:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE /api/mood-boards/:boardId/pins/:pinId
export async function DELETE(
  request: Request,
  { params }: { params: { boardId: string; pinId: string } }
) {
  try {
    const pinId = Number(params.pinId);
    await db.delete(moodBoardPins).where(eq(moodBoardPins.id, pinId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete pin:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
