import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { moodBoards, moodBoardPins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/projects/:id/mood-boards
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = Number(params.id);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const boards = await db
      .select()
      .from(moodBoards)
      .where(eq(moodBoards.projectId, projectId));

    return NextResponse.json({ boards });
  } catch (err) {
    console.error('Failed to fetch mood boards:', err);
    return NextResponse.json({ boards: [] }, { status: 500 });
  }
}

// POST /api/projects/:id/mood-boards
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = Number(params.id);
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    const [board] = await db
      .insert(moodBoards)
      .values({
        projectId,
        title,
        description: description || null,
        shareToken: crypto.randomUUID().slice(0, 8),
      })
      .returning();

    return NextResponse.json({ board });
  } catch (err) {
    console.error('Failed to create mood board:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
