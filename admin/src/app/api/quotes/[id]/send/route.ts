import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { quotes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isAuthenticated } from '@/lib/auth'
import { sendQuoteEmail } from '@/lib/mailer'

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
    const quoteId = Number(id)

    const [quote] = await db.select().from(quotes).where(eq(quotes.id, quoteId))
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Generate acceptToken if not present
    let acceptToken = quote.acceptToken
    if (!acceptToken) {
      acceptToken = crypto.randomUUID()
      await db.update(quotes)
        .set({ acceptToken })
        .where(eq(quotes.id, quoteId))
    }

    // Refresh quote data after update
    const [updatedQuote] = await db.select().from(quotes).where(eq(quotes.id, quoteId))

    const pdfBuffer = await fetchPdfBuffer(`/api/quotes/${quoteId}/pdf`)
    const emailResult = await sendQuoteEmail(updatedQuote, updatedQuote.clientEmail || '', pdfBuffer)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}`, success: false },
        { status: 500 }
      )
    }

    await db.update(quotes)
      .set({
        emailSentAt: new Date(),
        status: 'sent',
        sentAt: new Date(),
      })
      .where(eq(quotes.id, quoteId))

    return NextResponse.json({
      success: true,
      message: 'Quote sent successfully',
      messageId: emailResult.messageId,
    })
  } catch (error: any) {
    console.error('Error sending quote email:', error)
    return NextResponse.json(
      { error: 'Failed to send quote email', details: error.message, success: false },
      { status: 500 }
    )
  }
}
