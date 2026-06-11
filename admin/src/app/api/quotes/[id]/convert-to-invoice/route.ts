import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { quotes, invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function generateInvoiceNumber(): Promise<string> {
  const allInvoices = await db.select().from(invoices).orderBy(invoices.id)
  const nextNum = allInvoices.length + 1
  return `INV-${String(nextNum).padStart(4, '0')}`
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const quoteId = Number(id)

    const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId))
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (quote.status !== 'accepted') {
      return NextResponse.json({ error: 'Quote must be accepted before converting to invoice' }, { status: 400 })
    }

    if (quote.convertedToInvoice) {
      return NextResponse.json({ error: 'Quote has already been converted to invoice' }, { status: 400 })
    }

    const invoiceNumber = await generateInvoiceNumber()
    const paymentToken = crypto.randomUUID()

    const lineItems = Array.isArray(quote.lineItems) ? quote.lineItems : []
    const paymentSchedule = Array.isArray(quote.paymentSchedule) && quote.paymentSchedule.length > 0
      ? quote.paymentSchedule.map((item: any) => ({ ...item, status: item.status || 'pending' }))
      : [{ label: 'Full Payment', percent: 100, due: 'Due on receipt', amount: quote.total, status: 'pending' }]

    const inserted = await db.insert(invoices).values({
      projectId: quote.projectId,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      clientCompany: quote.clientCompany,
      projectTitle: quote.projectTitle,
      invoiceNumber,
      lineItems,
      notes: quote.notes,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      vatEnabled: quote.vatEnabled,
      tax: quote.tax,
      total: quote.total,
      discount: quote.discount,
      status: 'draft',
      paymentTerms: quote.paymentTerms,
      paymentTermsType: quote.paymentTermsType,
      paymentTermsLabel: quote.paymentTermsLabel,
      paymentMethod: quote.paymentMethod || 'bank-transfer',
      paymentSchedule,
      quoteId: quote.id,
      paymentToken,
      paymentConfirmedByClient: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    const newInvoice = inserted[0]

    await db.update(quotes)
      .set({ convertedToInvoice: true, invoiceId: newInvoice.id, updatedAt: new Date() })
      .where(eq(quotes.id, quoteId))

    return NextResponse.json({
      success: true,
      invoiceId: newInvoice.id,
      invoiceNumber,
      message: `Invoice ${invoiceNumber} created from quote`,
    })
  } catch (error: any) {
    console.error('Error converting quote to invoice:', error)
    return NextResponse.json({ error: 'Failed to convert quote to invoice', details: error.message }, { status: 500 })
  }
}
