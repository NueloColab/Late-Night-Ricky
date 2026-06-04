import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    const all = await db.select().from(invoices).where(eq(invoices.projectId, projectId)).orderBy(invoices.id).all();
    return NextResponse.json({ invoices: all });
  } catch (err) {
    console.error('Project invoices GET error:', err);
    return NextResponse.json({ invoices: [] }, { status: 500 });
  }
}
