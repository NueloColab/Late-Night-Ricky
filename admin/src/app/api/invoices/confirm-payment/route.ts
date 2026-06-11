import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentToken, paymentMethod, amountPaid, receiptFile, receiptFilename, receiptContentType, reference, notes } = body

    if (!paymentToken) {
      return NextResponse.json({ error: 'Payment token is required' }, { status: 400 })
    }

    const [invoice] = await db.select().from(invoices).where(eq(invoices.paymentToken, paymentToken))

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found or link has expired' }, { status: 404 })
    }

    const paymentConfirmation = {
      method: paymentMethod || 'Bank Transfer',
      amount: amountPaid || invoice.total,
      reference: reference || '',
      notes: notes || '',
      confirmedAt: new Date(),
    }

    if (receiptFile) {
      ;(paymentConfirmation as any).receipt = {
        filename: receiptFilename || 'receipt',
        contentType: receiptContentType || 'application/octet-stream',
        data: receiptFile,
        uploadedAt: new Date(),
      }
    }

    // Mark first pending instalment as paid
    let markedFirst = false
    const finalSchedule = (Array.isArray(invoice.paymentSchedule) ? invoice.paymentSchedule : []).map((item: any) => {
      if (!markedFirst && item.status === 'pending') {
        markedFirst = true
        return { ...item, status: 'paid', paidAt: new Date().toISOString() }
      }
      return item
    })

    await db.update(invoices).set({
      paymentConfirmation,
      paymentConfirmedByClient: true,
      paymentConfirmedAt: new Date(),
      paymentSchedule: finalSchedule,
      status: 'paid',
      paidAt: new Date(),
    }).where(eq(invoices.id, invoice.id))

    console.log(`✅ Payment confirmation received for invoice ${invoice.invoiceNumber}`)

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      invoiceNumber: invoice.invoiceNumber,
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}
