import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enquiries, quotes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
    const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id))
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    // Generate quote number
    const allQuotes = await db.select().from(quotes)
    const quoteNumber = `QT-${String(allQuotes.length + 1).padStart(3, '0')}`

    const projectTitle = enquiry.clubName
      ? `${enquiry.clubName} — ${enquiry.type === 'booking' ? 'Booking' : 'Enquiry'}`
      : `${enquiry.type === 'booking' ? 'Booking' : 'Enquiry'} Enquiry`

    const [newQuote] = await db.insert(quotes).values({
      projectTitle,
      clientName: enquiry.name,
      clientEmail: enquiry.email,
      clientCompany: enquiry.clubName,
      notes: enquiry.message || `Converted from ${enquiry.type} enquiry.\n\nOriginal details:\nClub: ${enquiry.clubName || 'N/A'}\nCity: ${enquiry.city || 'N/A'}\nFee: ${enquiry.fee || 'N/A'}\nEvent Date: ${enquiry.eventDate || 'N/A'}`,
      status: 'draft',
      quoteNumber,
      subtotal: 0,
      taxRate: 20,
      total: 0,
      lineItems: [],
      paymentTerms: 'net-30',
      paymentTermsType: 'net-30',
      paymentTermsLabel: 'Net 30',
      paymentMethod: 'bank-transfer',
    }).returning()

    return NextResponse.json({
      success: true,
      quoteId: newQuote.id,
      quoteNumber: newQuote.quoteNumber,
    })
  } catch (error: any) {
    console.error('Convert to quote error:', error)
    return NextResponse.json({ error: error.message || 'Failed to convert to quote' }, { status: 500 })
  }
}
