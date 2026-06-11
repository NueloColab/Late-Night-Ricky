import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { users, siteSections } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const DEFAULT_SETTINGS = { taxRate: 0, quoteTemplate: 'standard', currency: 'GBP' };

async function getSettings() {
  try {
    const rows = await db
      .select()
      .from(siteSections)
      .where(and(eq(siteSections.page, 'global'), eq(siteSections.section, 'settings')))
      .limit(1);

    if (rows.length > 0 && rows[0].content) {
      const parsed = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error('[Settings] DB read error:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

async function saveSettings(settings: any) {
  try {
    const rows = await db
      .select()
      .from(siteSections)
      .where(and(eq(siteSections.page, 'global'), eq(siteSections.section, 'settings')))
      .limit(1);

    if (rows.length > 0) {
      await db
        .update(siteSections)
        .set({ content: settings, updatedAt: new Date() })
        .where(eq(siteSections.id, rows[0].id));
    } else {
      await db.insert(siteSections).values({
        page: 'global',
        section: 'settings',
        content: settings,
        isActive: true,
      });
    }
    return true;
  } catch (err) {
    console.error('[Settings] DB save error:', err);
    return false;
  }
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const current = await getSettings();
    const updated = { ...current, ...body };
    const saved = await saveSettings(updated);
    if (!saved) {
      return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    }
    return NextResponse.json({ settings: updated });
  } catch (err) {
    console.error('Settings PUT error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'changePin') {
      const { currentPin, newPin } = body;
      if (!currentPin || !newPin || newPin.length < 4) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
      }
      const [user] = await db.select().from(users).where(eq(users.id, 1));
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const valid = await bcrypt.compare(currentPin, user.pinHash);
      if (!valid) return NextResponse.json({ error: 'Current PIN incorrect' }, { status: 401 });
      const newHash = await bcrypt.hash(newPin, 10);
      await db.update(users).set({ pinHash: newHash }).where(eq(users.id, 1));
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Settings POST error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
