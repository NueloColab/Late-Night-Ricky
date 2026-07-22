import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmailWithFallback } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'latenightricky@gmail.com'
const FROM_ADDRESS = process.env.SMTP_FROM || 'Late Night Ricky <latenightricky@gmail.com>'

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

    if (invoice.status === 'paid' || invoice.paymentConfirmedByClient) {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        message: 'Payment has already been confirmed for this invoice.',
        invoiceNumber: invoice.invoiceNumber,
      })
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

    // Notify admin via email
    try {
      const currency = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amountPaid || invoice.total || 0)
      await sendEmailWithFallback({
        from: FROM_ADDRESS,
        to: ADMIN_EMAIL,
        replyTo: invoice.clientEmail || undefined,
        subject: `Payment Confirmed — ${invoice.invoiceNumber}`,
        html: `
          <div style="padding:40px;font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="margin:0 0 20px 0;color:#2a1a0a;font-size:22px;font-weight:300;">Payment Confirmed</h2>
            <p style="margin:0 0 15px 0;color:#666;font-size:15px;line-height:1.6;">
              A client has confirmed payment for an invoice.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fafafa;border-left:4px solid #2a1a0a;margin:0 0 20px 0;">
              <tr><td style="padding:20px;">
                <p style="margin:0 0 8px 0;font-size:14px;"><strong>Invoice:</strong> ${invoice.invoiceNumber}</p>
                <p style="margin:0 0 8px 0;font-size:14px;"><strong>Client:</strong> ${invoice.clientName || '—'}</p>
                <p style="margin:0 0 8px 0;font-size:14px;"><strong>Project:</strong> ${invoice.projectTitle || '—'}</p>
                <p style="margin:0 0 8px 0;font-size:14px;"><strong>Amount:</strong> ${currency}</p>
                <p style="margin:0;font-size:14px;"><strong>Method:</strong> ${paymentMethod || 'Bank Transfer'}</p>
                ${reference ? `<p style="margin:8px 0 0 0;font-size:14px;"><strong>Reference:</strong> ${reference}</p>` : ''}
              </td></tr>
            </table>
            <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
              The invoice has been automatically marked as <strong>Paid</strong> in the admin dashboard.
            </p>
            <p style="margin:20px 0 0 0;color:#999;font-size:12px;">Late Night Ricky — Admin Notification</p>
          </div>
        `,
      })
      console.log('📧 Admin notification sent for payment confirmation')
    } catch (emailErr) {
      console.error('⚠️ Failed to send admin notification:', emailErr)
    }

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
