import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enquiries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEnquiryReplyEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

async function isAdmin() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const session = cookieStore.get('lnr_admin_session')?.value || cookieStore.get('lnr_session')?.value
  return !!session
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params.id)
    const body = await request.json()
    const { subject, message } = body

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id))
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    const result = await sendEnquiryReplyEmail(
      { name: enquiry.name, email: enquiry.email, type: enquiry.type, message: enquiry.message },
      subject,
      message
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 })
    }

    const existingReplies = Array.isArray(enquiry.replies) ? enquiry.replies : []
    const newReply = {
      subject,
      message,
      sentAt: new Date().toISOString(),
      sentBy: 'Late Night Ricky',
    }

    await db.update(enquiries)
      .set({
        status: 'replied',
        replies: [...existingReplies, newReply],
      })
      .where(eq(enquiries.id, id))

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error: any) {
    console.error('Reply error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send reply' }, { status: 500 })
  }
}
