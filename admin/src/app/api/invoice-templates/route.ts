import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { invoiceTemplates } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const all = await db.select().from(invoiceTemplates).orderBy(desc(invoiceTemplates.createdAt));
    return NextResponse.json({ templates: all });
  } catch (err) {
    console.error('Templates GET error:', err);
    return NextResponse.json({ templates: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const inserted = await db.insert(invoiceTemplates).values({
      name: body.name,
      clientName: body.clientName || null,
      clientEmail: body.clientEmail || null,
      clientCompany: body.clientCompany || null,
      projectTitle: body.projectTitle || null,
      lineItems: body.lineItems || [],
      notes: body.notes || null,
      taxRate: body.taxRate ?? 20,
      vatEnabled: body.vatEnabled ?? true,
      discount: body.discount || { enabled: false, type: 'friends-family', percent: 10, amount: 0 },
      paymentTermsType: body.paymentTermsType || 'net-30',
      paymentTermsLabel: body.paymentTermsLabel || 'Net 30',
      paymentMethod: body.paymentMethod || 'bank-transfer',
      paymentSchedule: body.paymentSchedule || [],
      ccEmails: body.ccEmails || null,
      updatedAt: new Date(),
    }).returning();
    return NextResponse.json({ template: inserted[0] });
  } catch (err) {
    console.error('Templates POST error:', err);
    return NextResponse.json({ error: 'Insert failed', details: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const cleaned: any = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined && value !== null) cleaned[key] = value;
    }
    cleaned.updatedAt = new Date();

    await db.update(invoiceTemplates).set(cleaned).where(eq(invoiceTemplates.id, id));
    const [row] = await db.select().from(invoiceTemplates).where(eq(invoiceTemplates.id, id));
    return NextResponse.json({ template: row });
  } catch (err) {
    console.error('Templates PUT error:', err);
    return NextResponse.json({ error: 'Update failed', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db.delete(invoiceTemplates).where(eq(invoiceTemplates.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Templates DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
