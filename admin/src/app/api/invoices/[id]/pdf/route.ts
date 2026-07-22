import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatCurrency(amount: number | null | undefined) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount || 0)
}

function formatDate(dateStr: string | Date | null | undefined) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return String(dateStr)
  }
}

function sanitizePdfText(text: string | null | undefined): string {
  if (!text) return ''
  return String(text).replace(/[\r\n\t]/g, ' ').replace(/[^\x20-\xFF]/g, '')
}

async function getSettings() {
  try {
    const { siteSections } = await import('@/lib/db/schema')
    const rows = await db
      .select()
      .from(siteSections)
      .where(and(eq(siteSections.page, 'global'), eq(siteSections.section, 'settings')))
      .limit(1)
    if (rows.length > 0 && rows[0].content) {
      const parsed = typeof rows[0].content === 'string' ? JSON.parse(rows[0].content) : rows[0].content
      return parsed
    }
  } catch {}
  return {}
}

// Logo loaded from pre-encoded base64 file (same pattern as Nuelo)
import { LNR_LOGO_BASE64 } from '@/lib/logoBase64'

async function getLogoBase64(): Promise<string | null> {
  return LNR_LOGO_BASE64 || null
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const c = {
  brown:     '#2a1a0a',
  gold:      '#c9a96e',
  black:     '#000000',
  darkText:  '#333333',
  mutedText: '#666666',
  dimText:   '#999999',
  border:    '#e5e5e5',
  bg:        '#fafafa',
  white:     '#ffffff',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: c.darkText,
    backgroundColor: c.white,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.brown,
    paddingVertical: 18,
    paddingHorizontal: 42,
    marginBottom: 26,
  },
  bodyContent: {
    paddingHorizontal: 42,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 30,
    objectFit: 'contain',
  },
  brandBlock: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: 'Helvetica',
    fontSize: 24,
    letterSpacing: 5,
    color: c.black,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 7.5,
    color: c.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  docLabel: {
    fontFamily: 'Helvetica',
    fontSize: 21,
    color: c.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  docNumber: {
    fontSize: 9,
    color: c.gold,
    marginTop: 3,
  },

  infoGrid: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 22,
  },
  infoBox: {
    flex: 1,
    backgroundColor: c.bg,
    borderWidth: 1,
    borderColor: c.border,
    padding: 15,
  },
  infoBoxTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.8,
    color: c.dimText,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  infoNameText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: c.black,
    marginBottom: 2,
  },
  infoBodyText: {
    fontFamily: 'Helvetica',
    fontSize: 9.8,
    color: c.darkText,
    lineHeight: 1.65,
  },

  metaRow: {
    flexDirection: 'row',
    backgroundColor: c.bg,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 11,
    paddingHorizontal: 15,
    marginBottom: 22,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.8,
    color: c.dimText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.8,
    color: c.black,
  },

  tableBorder: {
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 18,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: c.black,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  tableHeadText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: c.white,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tableRowAlt: {
    backgroundColor: c.bg,
  },
  colDesc: {
    flex: 1,
  },
  colAmt: {
    width: 80,
    alignItems: 'flex-end',
  },
  serviceNameText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: c.black,
    marginBottom: 2,
  },
  serviceCatText: {
    fontSize: 8.3,
    color: c.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicePriceText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11.3,
    color: c.black,
  },

  totalsWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 22,
  },
  totalsBox: {
    width: 210,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7.5,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  totalRowLabel: {
    fontFamily: 'Helvetica',
    fontSize: 9.8,
    color: c.mutedText,
  },
  totalRowValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.8,
    color: c.black,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 11,
    marginTop: 6,
    borderTopWidth: 2.25,
    borderTopColor: c.brown,
  },
  grandTotalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: c.brown,
  },
  grandTotalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: c.brown,
  },

  notesBox: {
    backgroundColor: c.bg,
    borderWidth: 1,
    borderColor: c.border,
    padding: 15,
    marginBottom: 22,
  },
  notesTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: c.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  notesText: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: c.mutedText,
    lineHeight: 1.7,
  },

  scheduleBox: {
    backgroundColor: '#f5efe9',
    borderWidth: 1,
    borderColor: '#d4c4b0',
    padding: 15,
    marginBottom: 22,
  },
  scheduleTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: c.brown,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d4c4b0',
    paddingBottom: 6,
    marginBottom: 6,
  },
  scheduleHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: c.brown,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scheduleRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5ddd3',
  },
  scheduleColLabel: { flex: 3 },
  scheduleColPercent: { flex: 1, alignItems: 'center' },
  scheduleColDue: { flex: 3 },
  scheduleColAmount: { flex: 2, alignItems: 'flex-end' },
  scheduleCellText: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333333',
  },
  scheduleCellBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#000000',
  },

  bankBox: {
    backgroundColor: c.bg,
    borderWidth: 1,
    borderColor: c.gold,
    padding: 15,
    marginBottom: 22,
  },
  bankTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: c.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bankLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#666666',
    width: 100,
  },
  bankValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#000000',
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingTop: 12,
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerBrand: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: c.brown,
    letterSpacing: 1,
    marginBottom: 3,
  },
  footerText: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: c.dimText,
    lineHeight: 1.5,
    textAlign: 'center',
  },
})

// ─── Invoice PDF Document ───────────────────────────────────────────────────

interface LineItem {
  serviceName?: string
  description?: string
  serviceCategory?: string
  price?: number
  amount?: number
  quantity?: number
  rate?: number
}

interface PaymentScheduleItem {
  label?: string
  percent?: number
  due?: string
  dueLabel?: string
  amount?: number
}

interface InvoiceData {
  clientName: string
  clientEmail: string
  clientCompany: string | null
  projectTitle: string
  performanceDate: string | null
  invoiceNumber: string
  sentAt: string | Date | null
  dueDate: string | Date | null
  paymentTermsLabel: string | null
  lineItems: LineItem[]
  subtotal: number
  taxRate: number
  vatEnabled: boolean
  discount: { enabled?: boolean; percent?: number; amount?: number } | null
  total: number
  paymentSchedule: PaymentScheduleItem[]
  notes: string | null
  paymentMethod: string | null
}

function InvoicePDF({ invoice, logoBase64, bankDetails, companyName }: {
  invoice: InvoiceData
  logoBase64: string | null
  bankDetails: {
    bankName: string
    bankAccountName: string
    bankSortCode: string
    bankAccountNumber: string
    swiftCode: string
    iban: string
  }
  companyName: string
}) {
  const taxRate = invoice.taxRate || 20
  const vatEnabled = invoice.vatEnabled !== false
  const discount = invoice.discount || { enabled: false, percent: 0, amount: 0 }
  const e = React.createElement

  const dueDateStr = invoice.dueDate ? formatDate(invoice.dueDate) : 'Upon receipt'
  const termsLabel = invoice.paymentTermsLabel || '-'
  const hasSchedule = invoice.paymentSchedule && invoice.paymentSchedule.length > 1

  const subtotal = Number(invoice.subtotal || 0)
  const discountEnabled = discount.enabled || false
  const discountPercent = discount.percent || 0
  const discountAmount = discountEnabled ? (subtotal * discountPercent) / 100 : 0
  const taxableAmount = subtotal - discountAmount
  const taxAmount = vatEnabled ? taxableAmount * (taxRate / 100) : 0
  const total = Number(invoice.total || 0)

  return e(Document, { title: `Invoice ${invoice.invoiceNumber} - Late Night Ricky` },
    e(Page, { size: 'A4', style: styles.page },

      // HEADER
      e(View, { style: styles.header },
        e(View, { style: styles.headerLeft },
          logoBase64 ? e(Image, { style: styles.logo, src: logoBase64 }) : e(Text, { style: styles.brandName }, 'LATE NIGHT RICKY')
        ),
        e(View, { style: styles.headerRight },
          e(Text, { style: styles.docLabel }, 'Invoice'),
          e(Text, { style: styles.docNumber }, invoice.invoiceNumber)
        )
      ),

      // BODY (padded content below header)
      e(View, { style: styles.bodyContent },

      // INFO GRID
      e(View, { style: styles.infoGrid },
        e(View, { style: styles.infoBox },
          e(Text, { style: styles.infoBoxTitle }, 'Bill To'),
          e(Text, { style: styles.infoNameText }, invoice.clientName),
          invoice.clientCompany ? e(Text, { style: styles.infoBodyText }, invoice.clientCompany) : null,
          e(Text, { style: styles.infoBodyText }, invoice.clientEmail)
        ),
        e(View, { style: styles.infoBox },
          e(Text, { style: styles.infoBoxTitle }, 'Project'),
          e(Text, { style: styles.infoNameText }, invoice.projectTitle),
          invoice.performanceDate ? e(Text, { style: styles.infoBodyText }, `Performance: ${formatDate(invoice.performanceDate)}`) : null,
          e(Text, { style: styles.infoBodyText },
            `${invoice.lineItems?.length || 0} item${invoice.lineItems?.length !== 1 ? 's' : ''}`
          )
        )
      ),

      // META ROW
      e(View, { style: styles.metaRow },
        e(View, { style: styles.metaItem },
          e(Text, { style: styles.metaLabel }, 'Date Issued'),
          e(Text, { style: styles.metaValue }, formatDate(invoice.sentAt || new Date()))
        ),
        e(View, { style: styles.metaItem },
          e(Text, { style: styles.metaLabel }, 'Due Date'),
          e(Text, { style: styles.metaValue }, dueDateStr)
        ),
        e(View, { style: styles.metaItem },
          e(Text, { style: styles.metaLabel }, 'Payment Terms'),
          e(Text, { style: styles.metaValue }, termsLabel)
        ),
        e(View, { style: styles.metaItem },
          e(Text, { style: styles.metaLabel }, 'Invoice Number'),
          e(Text, { style: styles.metaValue }, invoice.invoiceNumber)
        )
      ),

      // SERVICES TABLE
      e(View, { style: styles.tableBorder },
        e(View, { style: styles.tableHead },
          e(View, { style: styles.colDesc }, e(Text, { style: styles.tableHeadText }, 'Service Description')),
          e(View, { style: styles.colAmt }, e(Text, { style: styles.tableHeadText }, 'Amount'))
        ),
        ...(invoice.lineItems || []).map((service, i) =>
          e(View, {
            key: String(i),
            style: [styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}],
          },
            e(View, { style: styles.colDesc },
              e(Text, { style: styles.serviceNameText }, service.serviceName || service.description || ''),
              e(Text, { style: styles.serviceCatText }, service.serviceCategory || '')
            ),
            e(View, { style: styles.colAmt },
              e(Text, { style: styles.servicePriceText }, formatCurrency(service.price || service.amount || 0))
            )
          )
        )
      ),

      // TOTALS
      e(View, { style: styles.totalsWrap },
        e(View, { style: styles.totalsBox },
          e(View, { style: styles.totalRow },
            e(Text, { style: styles.totalRowLabel }, 'Subtotal:'),
            e(Text, { style: styles.totalRowValue }, formatCurrency(subtotal))
          ),
          discountEnabled
            ? e(View, { style: styles.totalRow },
                e(Text, { style: [styles.totalRowLabel, { color: c.brown }] }, `Friends \u0026 Family Discount (${discountPercent}%):`),
                e(Text, { style: [styles.totalRowValue, { color: c.brown }] }, `-${formatCurrency(discountAmount)}`)
              )
            : null,
          vatEnabled
            ? e(View, { style: styles.totalRow },
                e(Text, { style: styles.totalRowLabel }, `VAT (${taxRate}%):`),
                e(Text, { style: styles.totalRowValue }, formatCurrency(taxAmount))
              )
            : e(View, { style: styles.totalRow },
                e(Text, { style: styles.totalRowLabel }, 'VAT:'),
                e(Text, { style: [styles.totalRowValue, { color: c.dimText }] }, 'N/A')
              ),
          e(View, { style: styles.grandTotalRow },
            e(Text, { style: styles.grandTotalLabel }, 'Total:'),
            e(Text, { style: styles.grandTotalValue }, formatCurrency(total))
          )
        )
      ),

      // PAYMENT SCHEDULE (only for split payments)
      hasSchedule
        ? e(View, { style: styles.scheduleBox },
            e(Text, { style: styles.scheduleTitle }, 'Payment Schedule'),
            e(View, { style: styles.scheduleHeaderRow },
              e(View, { style: styles.scheduleColLabel }, e(Text, { style: styles.scheduleHeaderText }, 'Installment')),
              e(View, { style: styles.scheduleColPercent }, e(Text, { style: styles.scheduleHeaderText }, '%')),
              e(View, { style: styles.scheduleColDue }, e(Text, { style: styles.scheduleHeaderText }, 'Due')),
              e(View, { style: styles.scheduleColAmount }, e(Text, { style: styles.scheduleHeaderText }, 'Amount'))
            ),
            ...invoice.paymentSchedule.map((item, i) =>
              e(View, { key: String(i), style: styles.scheduleRow },
                e(View, { style: styles.scheduleColLabel }, e(Text, { style: styles.scheduleCellBold }, item.label || '')),
                e(View, { style: styles.scheduleColPercent }, e(Text, { style: styles.scheduleCellText }, `${item.percent}%`)),
                e(View, { style: styles.scheduleColDue }, e(Text, { style: styles.scheduleCellText }, item.due || item.dueLabel || '')),
                e(View, { style: styles.scheduleColAmount }, e(Text, { style: styles.scheduleCellBold }, formatCurrency(item.amount || (total * (item.percent || 0)) / 100)))
              )
            )
          )
        : null,

      // BANK DETAILS
      e(View, { style: styles.bankBox },
        e(Text, { style: styles.bankTitle }, 'Bank Details for Payment'),
        e(View, { style: styles.bankRow },
          e(Text, { style: styles.bankLabel }, 'Bank:'),
          e(Text, { style: styles.bankValue }, bankDetails.bankName)
        ),
        e(View, { style: styles.bankRow },
          e(Text, { style: styles.bankLabel }, 'Account Name:'),
          e(Text, { style: styles.bankValue }, bankDetails.bankAccountName)
        ),
        e(View, { style: styles.bankRow },
          e(Text, { style: styles.bankLabel }, 'Sort Code:'),
          e(Text, { style: styles.bankValue }, bankDetails.bankSortCode)
        ),
        e(View, { style: styles.bankRow },
          e(Text, { style: styles.bankLabel }, 'Account No:'),
          e(Text, { style: styles.bankValue }, bankDetails.bankAccountNumber)
        ),
        bankDetails.swiftCode
          ? e(View, { style: styles.bankRow },
              e(Text, { style: styles.bankLabel }, 'SWIFT:'),
              e(Text, { style: styles.bankValue }, bankDetails.swiftCode)
            )
          : null,
        bankDetails.iban
          ? e(View, { style: styles.bankRow },
              e(Text, { style: styles.bankLabel }, 'IBAN:'),
              e(Text, { style: styles.bankValue }, bankDetails.iban)
            )
          : null
      ),

      // NOTES
      invoice.notes
        ? e(View, { style: styles.notesBox },
            e(Text, { style: styles.notesTitle }, 'Notes \u0026 Terms'),
            e(Text, { style: styles.notesText }, invoice.notes)
          )
        : null,

      // FOOTER
      e(View, { style: styles.footer },
        e(Text, { style: styles.footerBrand }, companyName),
        e(Text, { style: styles.footerText }, 'GRAMMY WINNING PRODUCER | INTERNATIONAL DJ'),
        e(Text, { style: styles.footerText }, 'This is an invoice for services rendered. Payment is due by the date specified above. Thank you for your business.')
      )

      ) // close bodyContent
    )
  )
}

// ─── API Route ──────────────────────────────────────────────────────────────

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [invoiceRow] = await db.select().from(invoices).where(eq(invoices.id, Number(params.id)))
    if (!invoiceRow) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const s = sanitizePdfText

    // Parse line items
    const lineItemsRaw = invoiceRow.lineItems || '[]'
    const lineItems: LineItem[] = Array.isArray(lineItemsRaw)
      ? lineItemsRaw
      : JSON.parse(typeof lineItemsRaw === 'string' ? lineItemsRaw : '[]')

    // Parse discount
    const discountRaw = invoiceRow.discount || { enabled: false, percent: 0, amount: 0 }
    const discount = typeof discountRaw === 'string' ? JSON.parse(discountRaw) : discountRaw

    // Parse payment schedule
    const scheduleRaw = invoiceRow.paymentSchedule || '[]'
    const paymentSchedule: PaymentScheduleItem[] = Array.isArray(scheduleRaw)
      ? scheduleRaw
      : JSON.parse(typeof scheduleRaw === 'string' ? scheduleRaw : '[]')

    const invoiceData: InvoiceData = {
      clientName: s(invoiceRow.clientName) || '',
      clientEmail: s(invoiceRow.clientEmail) || '',
      clientCompany: s(invoiceRow.clientCompany),
      projectTitle: s(invoiceRow.projectTitle) || '',
      performanceDate: s(invoiceRow.performanceDate),
      invoiceNumber: s(invoiceRow.invoiceNumber) || '',
      sentAt: invoiceRow.sentAt,
      dueDate: s(invoiceRow.dueDate),
      paymentTermsLabel: s(invoiceRow.paymentTermsLabel),
      lineItems,
      subtotal: Number(invoiceRow.subtotal || 0),
      taxRate: Number(invoiceRow.taxRate || 0),
      vatEnabled: invoiceRow.vatEnabled !== false,
      discount,
      total: Number(invoiceRow.total || 0),
      paymentSchedule,
      notes: s(invoiceRow.notes),
      paymentMethod: s(invoiceRow.paymentMethod),
    }

    // Settings
    const settings = await getSettings()
    const bankName = s(settings.bankName) || 'Tide'
    const bankAccountName = s(settings.bankAccountName) || 'Late Night Ricky'
    const bankSortCode = s(settings.bankSortCode) || '—'
    const bankAccountNumber = s(settings.bankAccountNumber) || '—'
    const swiftCode = s(settings.swiftCode) || ''
    const iban = s(settings.iban) || ''
    const companyName = s(settings.companyName) || 'Late Night Ricky'

    const bankDetails = {
      bankName,
      bankAccountName,
      bankSortCode,
      bankAccountNumber,
      swiftCode,
      iban,
    }

    // Logo
    const logoBase64 = await getLogoBase64()

    // Generate PDF
    const doc = React.createElement(InvoicePDF, { invoice: invoiceData, logoBase64, bankDetails, companyName })
    const pdfBuffer = await renderToBuffer(doc as any)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="LNR-Invoice-${invoiceData.invoiceNumber}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Invoice PDF error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
