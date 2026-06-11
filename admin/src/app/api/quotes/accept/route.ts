import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { quotes, invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendInvoiceEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

async function generateInvoiceNumber(): Promise<string> {
  const allInvoices = await db.select().from(invoices).orderBy(invoices.id)
  const nextNum = allInvoices.length + 1
  return `INV-${String(nextNum).padStart(4, '0')}`
}

async function fetchPdfBuffer(url: string): Promise<Buffer | undefined> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${siteUrl}${url}`)
    if (!res.ok) {
      console.warn(`⚠️ PDF fetch failed: ${res.status} ${res.statusText}`)
      return undefined
    }
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.warn('⚠️ PDF fetch error:', err)
    return undefined
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = body.token

    if (!token) {
      return NextResponse.json({ success: false, error: 'Invalid accept quote link' }, { status: 400 })
    }

    const [quote] = await db.select().from(quotes).where(eq(quotes.acceptToken, token))

    if (!quote) {
      return NextResponse.json({ success: false, error: 'Accept quote link not found or expired' }, { status: 404 })
    }

    if (quote.status === 'accepted') {
      return NextResponse.json({
        success: true,
        alreadyAccepted: true,
        quoteId: quote.id,
        clientName: quote.clientName,
        projectTitle: quote.projectTitle,
        lineItems: quote.lineItems,
        total: quote.total,
        paymentSchedule: quote.paymentSchedule,
        paymentTermsLabel: quote.paymentTermsLabel,
      })
    }

    if (!['sent', 'draft'].includes(quote.status || '')) {
      return NextResponse.json({ success: false, error: 'This quote cannot be accepted at this time' }, { status: 400 })
    }

    // Update quote status to accepted
    await db.update(quotes)
      .set({ status: 'accepted' })
      .where(eq(quotes.id, quote.id))

    // Auto-convert to invoice
    let invoiceId: number | undefined
    let invoiceNumber: string | undefined
    try {
      invoiceNumber = await generateInvoiceNumber()
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
        total: quote.total,
        discount: quote.discount,
        status: 'sent',
        paymentTerms: quote.paymentTerms,
        paymentTermsType: quote.paymentTermsType,
        paymentTermsLabel: quote.paymentTermsLabel,
        paymentMethod: quote.paymentMethod || 'bank-transfer',
        paymentSchedule,
        quoteId: quote.id,
        paymentToken,
        paymentConfirmedByClient: false,
        sentAt: new Date(),
      }).returning()

      const newInvoice = inserted[0]
      invoiceId = newInvoice.id

      await db.update(quotes)
        .set({ convertedToInvoice: true, invoiceId })
        .where(eq(quotes.id, quote.id))

      // Send invoice email automatically
      try {
        const pdfBuffer = await fetchPdfBuffer(`/api/invoices/${invoiceId}/pdf`)
        await sendInvoiceEmail(newInvoice, quote.clientEmail || '', pdfBuffer)
        await db.update(invoices)
          .set({ emailSentAt: new Date() })
          .where(eq(invoices.id, invoiceId))
      } catch (emailError) {
        console.error('❌ Failed to send invoice email:', emailError)
      }
    } catch (conversionError) {
      console.error('❌ Failed to convert quote to invoice:', conversionError)
    }

    return NextResponse.json({
      success: true,
      alreadyAccepted: false,
      quoteId: quote.id,
      clientName: quote.clientName,
      projectTitle: quote.projectTitle,
      lineItems: quote.lineItems,
      total: quote.total,
      paymentSchedule: quote.paymentSchedule,
      paymentTermsLabel: quote.paymentTermsLabel,
      invoiceId,
      invoiceNumber,
    })
  } catch (error) {
    console.error('Error accepting quote:', error)
    return NextResponse.json({ success: false, error: 'An error occurred while accepting your quote' }, { status: 500 })
  }
}
