import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';

export async function GET() {
  try {
    const all = await db.select().from(invoices).orderBy(invoices.invoiceNumber).all();
    return NextResponse.json({ invoices: all });
  } catch (err) {
    console.error('Invoices GET error:', err);
    return NextResponse.json({ invoices: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inserted = await db.insert(invoices).values(body).returning();
    return NextResponse.json({ invoice: inserted[0] });
  } catch (err) {
    console.error('Invoices POST error:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}
