import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices, siteSections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

async function getSettings() {
  try {
    const { eq, and } = await import('drizzle-orm')
    const rows = await db.select().from(siteSections).where(and(eq(siteSections.page, 'global'), eq(siteSections.section, 'settings'))).limit(1)
    return rows[0]?.content || {}
  } catch {
    return {}
  }
}

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Invalid payment token' }, { status: 400 })
    }

    const [invoice] = await db.select().from(invoices).where(eq(invoices.paymentToken, token))

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found or link has expired' }, { status: 404 })
    }

    const settings = await getSettings()

    return NextResponse.json({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientCompany: invoice.clientCompany,
      clientEmail: invoice.clientEmail,
      projectTitle: invoice.projectTitle,
      lineItems: invoice.lineItems,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      vatEnabled: invoice.vatEnabled,
      total: invoice.total,
      discount: invoice.discount,
      dueDate: invoice.dueDate,
      paymentTermsLabel: invoice.paymentTermsLabel,
      status: invoice.status,
      paymentSchedule: invoice.paymentSchedule,
      paymentConfirmedByClient: invoice.paymentConfirmedByClient,
      settings,
    })
  } catch (error) {
    console.error('Error fetching invoice by token:', error)
    return NextResponse.json({ error: 'Failed to load invoice' }, { status: 500 })
  }
}
