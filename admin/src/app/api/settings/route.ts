import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const SETTINGS_FILE = '/tmp/lnr-settings.json';

import { readFile, writeFile } from 'fs/promises';

async function getSettings() {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { taxRate: 0, quoteTemplate: 'standard', currency: 'GBP' };
  }
}

async function saveSettings(settings: any) {
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = await getSettings();
    const updated = { ...settings, ...body };
    await saveSettings(updated);
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
      const user = await db.select().from(users).where(eq(users.id, 1)).get();
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
