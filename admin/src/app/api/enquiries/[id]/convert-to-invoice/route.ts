import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { enquiries, invoices } from '@/lib/db/schema'
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

    // Generate invoice number
    const allInvoices = await db.select().from(invoices)
    const invoiceNumber = `INV-${String(allInvoices.length + 1).padStart(4, '0')}`

    const projectTitle = enquiry.clubName
      ? `${enquiry.clubName} — ${enquiry.type === 'booking' ? 'Booking' : 'Enquiry'}`
      : `${enquiry.type === 'booking' ? 'Booking' : 'Enquiry'} Enquiry`

    const [newInvoice] = await db.insert(invoices).values({
      projectTitle,
      clientName: enquiry.name,
      clientEmail: enquiry.email,
      clientCompany: enquiry.clubName,
      notes: enquiry.message || `Converted from ${enquiry.type} enquiry.\n\nOriginal details:\nClub: ${enquiry.clubName || 'N/A'}\nCity: ${enquiry.city || 'N/A'}\nFee: ${enquiry.fee || 'N/A'}\nEvent Date: ${enquiry.eventDate || 'N/A'}`,
      status: 'draft',
      invoiceNumber,
      subtotal: 0,
      taxRate: 20,
      total: 0,
      lineItems: [],
      paymentTerms: 'net-30',
      paymentTermsType: 'net-30',
      paymentTermsLabel: 'Net 30',
      paymentMethod: 'bank-transfer',
      paymentToken: crypto.randomUUID(),
    }).returning()

    return NextResponse.json({
      success: true,
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
    })
  } catch (error: any) {
    console.error('Convert to invoice error:', error)
    return NextResponse.json({ error: error.message || 'Failed to convert to invoice' }, { status: 500 })
  }
}
