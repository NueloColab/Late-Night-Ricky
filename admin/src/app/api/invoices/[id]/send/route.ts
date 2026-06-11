import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isAuthenticated } from '@/lib/auth'
import { sendInvoiceEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const invoiceId = Number(id)

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId))
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Generate paymentToken if not present
    let paymentToken = invoice.paymentToken
    if (!paymentToken) {
      paymentToken = crypto.randomUUID()
      await db.update(invoices)
        .set({ paymentToken })
        .where(eq(invoices.id, invoiceId))
    }

    // Refresh invoice data after update
    const [updatedInvoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId))

    const pdfBuffer = await fetchPdfBuffer(`/api/invoices/${invoiceId}/pdf`)
    const emailResult = await sendInvoiceEmail(updatedInvoice, updatedInvoice.clientEmail || '', pdfBuffer)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}`, success: false },
        { status: 500 }
      )
    }

    await db.update(invoices)
      .set({
        emailSentAt: new Date(),
        status: 'sent',
        sentAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      messageId: emailResult.messageId,
    })
  } catch (error: any) {
    console.error('Error sending invoice email:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice email', details: error.message, success: false },
      { status: 500 }
    )
  }
}
