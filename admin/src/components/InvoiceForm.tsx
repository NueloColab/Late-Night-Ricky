'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X, Heart } from 'lucide-react'
import ServiceSelector from '@/components/ServiceSelector'
import ClientAutocomplete from '@/components/ClientAutocomplete'
import DiscountToggle from '@/components/DiscountToggle'
import VatToggle from '@/components/VatToggle'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'
import PaymentSchedule from '@/components/PaymentSchedule'
import NotesField from '@/components/NotesField'
import {
  PAYMENT_TERMS_OPTIONS,
  getDefaultSchedule,
  calculateDueDateFromTerms,
  isNetTerms,
} from '@/lib/payment-terms'
import { PaymentScheduleItem } from '@/lib/payment-terms'

interface LineItem {
  serviceName?: string
  serviceCategory?: string
  price?: number
  quantity?: number
  description?: string
  rate?: number
  amount?: number
  date?: string
  _custom?: boolean
}

interface Discount {
  enabled: boolean
  type: string
  percent: number
  amount: number
}

interface InvoiceFormProps {
  invoice?: {
    id?: number
    clientName?: string | null
    clientEmail?: string | null
    clientCompany?: string | null
    projectTitle?: string | null
    lineItems?: LineItem[]
    notes?: string | null
    taxRate?: number
    vatEnabled?: boolean
    discount?: Discount
    paymentMethod?: string | null
    paymentTermsType?: string | null
    paymentTermsLabel?: string | null
    paymentSchedule?: PaymentScheduleItem[]
    dueDate?: string | null
    projectId?: number | null
    ccEmails?: string | null
  } | null
  projects?: { id: number; title: string; clientId?: number | null }[]
  onClose: () => void
  onSuccess: () => void
}

interface Template {
  id: number
  name: string
  clientName?: string | null
  clientEmail?: string | null
  clientCompany?: string | null
  projectTitle?: string | null
  lineItems?: LineItem[]
  notes?: string | null
  taxRate?: number
  vatEnabled?: boolean
  discount?: Discount
  paymentMethod?: string | null
  paymentTermsType?: string | null
  paymentTermsLabel?: string | null
  paymentSchedule?: PaymentScheduleItem[]
  ccEmails?: string | null
}

function InvoicePreview({
  clientName,
  clientCompany,
  clientEmail,
  projectTitle,
  lineItems,
  subtotal,
  discount,
  discountAmount,
  tax,
  taxRate,
  vatEnabled,
  total,
  paymentTermsLabel,
  dueDate,
  notes,
}: {
  clientName: string
  clientCompany: string
  clientEmail: string
  projectTitle: string
  lineItems: LineItem[]
  subtotal: number
  discount: Discount
  discountAmount: number
  tax: number
  taxRate: number
  vatEnabled: boolean
  total: number
  paymentTermsLabel: string
  dueDate: string
  notes: string
}) {
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) setSettings(data.settings)
      })
      .catch(() => {})
  }, [])

  const companyName = settings.companyName || 'Late Night Ricky'
  const companyAddress = settings.companyAddress || ''
  const companyNumber = settings.companyNumber || ''
  const vatNumber = settings.vatNumber || ''
  const bankName = settings.bankName || 'Tide'
  const bankAccountName = settings.bankAccountName || 'Late Night Ricky'
  const bankSortCode = settings.bankSortCode || '—'
  const bankAccountNumber = settings.bankAccountNumber || '—'
  const swiftCode = settings.swiftCode || ''
  const iban = settings.iban || ''

  return (
    <div className="bg-[#f0e6d8] border border-[#A8D5F0]/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#d0c4a8] flex items-center justify-between">
        <span className="text-xs font-semibold text-[#5a3a1a] uppercase tracking-[3px]">PDF Preview</span>
        <span className="text-[10px] text-[#5a3a1a]/50">This is how the invoice will look</span>
      </div>

      <div className="p-6 space-y-5">
        {/* Top row: Company + Bill To */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Bill To */}
          <div>
            <p className="text-[10px] font-bold text-[#5a3a1a] uppercase tracking-[0.15em] mb-1">Bill To</p>
            <p className="text-sm font-bold text-[#2a1a0a]">{clientName || 'Client Name'}</p>
            {clientCompany && <p className="text-xs text-[#5a3a1a]/70">{clientCompany}</p>}
            {clientEmail && <p className="text-xs text-[#5a3a1a]/70">{clientEmail}</p>}
          </div>

          {/* Company Details */}
          <div className="text-right">
            <p className="text-sm font-bold text-[#2a1a0a]">{companyName}</p>
            {companyAddress && companyAddress.split('\n').map((line: string, i: number) => (
              <p key={i} className="text-xs text-[#5a3a1a]/70">{line}</p>
            ))}
            {companyNumber && <p className="text-[10px] text-[#5a3a1a]/50 mt-1">Company No: {companyNumber}</p>}
            {vatNumber && <p className="text-[10px] text-[#5a3a1a]/50">VAT No: {vatNumber}</p>}
          </div>
        </div>

        {/* Project + Meta */}
        <div className="flex flex-col md:flex-row justify-between gap-4 text-xs text-[#5a3a1a]">
          {projectTitle && <p><span className="font-semibold">Project:</span> {projectTitle}</p>}
          <div className="flex gap-4">
            <p><span className="font-semibold">Terms:</span> {paymentTermsLabel}</p>
            {dueDate && <p><span className="font-semibold">Due:</span> {dueDate}</p>}
          </div>
        </div>

        {/* Line Items */}
        <div className="border border-[#d0c4a8] rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 px-4 py-2 bg-[#2a1a0a] text-[#e8d4b8] text-[10px] font-bold uppercase tracking-wider">
            <span>Service</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>
          {lineItems.filter(item => item.serviceName || item.description).map((item, i) => {
            const qty = Number(item.quantity || 1)
            const rate = Number(item.price || 0)
            const amount = qty * rate
            return (
              <div key={i} className={`grid grid-cols-[1fr_60px_80px_80px] gap-2 px-4 py-2.5 text-xs ${i % 2 === 1 ? 'bg-[#e8d4b8]/20' : ''}`}>
                <div>
                  <p className="font-medium text-[#2a1a0a]">{item.serviceName || item.description}</p>
                  {item.serviceCategory && <p className="text-[10px] text-[#5a3a1a]/50">{item.serviceCategory}</p>}
                  {item.date && <p className="text-[10px] text-[#5a3a1a]/60">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                </div>
                <span className="text-center text-[#5a3a1a]">{qty}</span>
                <span className="text-right text-[#5a3a1a]">£{rate.toLocaleString()}</span>
                <span className="text-right font-semibold text-[#2a1a0a]">£{amount.toLocaleString()}</span>
              </div>
            )
          })}
          {lineItems.filter(item => item.serviceName || item.description).length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-[#5a3a1a]/40 italic">No services added yet</div>
          )}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-[280px] space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#5a3a1a]/60">Subtotal</span>
              <span className="font-semibold text-[#2a1a0a]">£{subtotal.toFixed(2)}</span>
            </div>
            {discount.enabled && discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#5a3a1a]/60">Discount ({discount.percent}%)</span>
                <span className="font-semibold text-red-600">-£{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {vatEnabled && taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-[#5a3a1a]/60">VAT ({taxRate}%)</span>
                <span className="font-semibold text-[#2a1a0a]">£{tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#2a1a0a]">
              <span className="text-base font-black text-[#2a1a0a] tracking-tight">Total</span>
              <span className="text-base font-black text-[#2a1a0a] tracking-tight">£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-[#e8d4b8]/30 border border-[#d0c4a8] rounded-lg p-4">
          <p className="text-[10px] font-bold text-[#5a3a1a] uppercase tracking-[0.15em] mb-2">Bank Details for Payment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#2a1a0a]">
            <p><span className="text-[#5a3a1a]/60">Bank:</span> <span className="font-semibold">{bankName}</span></p>
            <p><span className="text-[#5a3a1a]/60">Account Name:</span> <span className="font-semibold">{bankAccountName}</span></p>
            <p><span className="text-[#5a3a1a]/60">Sort Code:</span> <span className="font-semibold">{bankSortCode}</span></p>
            <p><span className="text-[#5a3a1a]/60">Account No:</span> <span className="font-semibold">{bankAccountNumber}</span></p>
            {swiftCode && <p><span className="text-[#5a3a1a]/60">SWIFT:</span> <span className="font-semibold">{swiftCode}</span></p>}
            {iban && <p><span className="text-[#5a3a1a]/60">IBAN:</span> <span className="font-semibold">{iban}</span></p>}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div>
            <p className="text-[10px] font-bold text-[#5a3a1a] uppercase tracking-[0.15em] mb-1">Notes & Terms</p>
            <p className="text-xs text-[#5a3a1a]/80 whitespace-pre-wrap leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#d0c4a8] text-center">
          <p className="text-[10px] text-[#5a3a1a]/40">Late Night Ricky · International DJ & Grammy Winning Producer</p>
          <p className="text-[10px] text-[#5a3a1a]/40">Payment is due by the date specified above. Thank you for your business.</p>
        </div>
      </div>
    </div>
  )
}

export default function InvoiceForm({ invoice, projects = [], onClose, onSuccess }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const [clientName, setClientName] = useState(invoice?.clientName || '')
  const [clientEmail, setClientEmail] = useState(invoice?.clientEmail || '')
  const [clientCompany, setClientCompany] = useState(invoice?.clientCompany || '')
  const [projectTitle, setProjectTitle] = useState(invoice?.projectTitle || '')
  const [ccEmails, setCcEmails] = useState(invoice?.ccEmails || '')
  const [projectId, setProjectId] = useState<number | null>(invoice?.projectId ?? null)
  const [notes, setNotes] = useState(invoice?.notes || 'Thank you for doing business with Fricktion Music Ltd')
  const [dueDate, setDueDate] = useState(invoice?.dueDate || '')
  const [items, setItems] = useState<LineItem[]>(
    invoice?.lineItems?.length
      ? invoice.lineItems
      : [{ serviceName: '', serviceCategory: '', price: 0, quantity: 1 }]
  )
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? 20)
  const [vatEnabled, setVatEnabled] = useState(invoice?.vatEnabled ?? true)
  const [discount, setDiscount] = useState<Discount>(
    invoice?.discount || { enabled: false, type: 'friends-family', percent: 10, amount: 0 }
  )
  const [paymentMethod, setPaymentMethod] = useState(invoice?.paymentMethod || 'bank-transfer')
  const [paymentTermsType, setPaymentTermsType] = useState(invoice?.paymentTermsType || 'net-30')
  const [paymentTermsLabel, setPaymentTermsLabel] = useState(invoice?.paymentTermsLabel || 'Net 30')
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>(
    invoice?.paymentSchedule || getDefaultSchedule('net-30', 0)
  )

  // Load templates on mount
  useEffect(() => {
    fetch('/api/invoice-templates')
      .then(r => r.json())
      .then(data => {
        if (data.templates) setTemplates(data.templates)
      })
      .catch(() => {})
  }, [])

  function applyTemplate(templateId: string) {
    const t = templates.find((tmpl) => String(tmpl.id) === templateId)
    if (!t) return
    setClientName(t.clientName || '')
    setClientEmail(t.clientEmail || '')
    setClientCompany(t.clientCompany || '')
    setProjectTitle(t.projectTitle || '')
    setCcEmails(t.ccEmails || '')
    setNotes(t.notes || 'Thank you for doing business with Fricktion Music Ltd')
    setItems(t.lineItems?.length ? t.lineItems : [{ serviceName: '', serviceCategory: '', price: 0, quantity: 1 }])
    setTaxRate(t.taxRate ?? 20)
    setVatEnabled(t.vatEnabled ?? true)
    setDiscount(t.discount || { enabled: false, type: 'friends-family', percent: 10, amount: 0 })
    setPaymentMethod(t.paymentMethod || 'bank-transfer')
    if (t.paymentTermsType) {
      setPaymentTermsType(t.paymentTermsType)
      setPaymentTermsLabel(t.paymentTermsLabel || t.paymentTermsType)
      setPaymentSchedule(t.paymentSchedule?.length ? t.paymentSchedule : getDefaultSchedule(t.paymentTermsType, 0))
    }
  }

  async function saveAsTemplate() {
    const name = prompt('Template name (e.g. "Weekly Club Booking"):')
    if (!name?.trim()) return
    setSavingTemplate(true)
    try {
      const res = await fetch('/api/invoice-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          clientName,
          clientEmail,
          clientCompany,
          projectTitle,
          lineItems: items,
          notes,
          taxRate,
          vatEnabled,
          discount,
          paymentTermsType,
          paymentTermsLabel,
          paymentMethod,
          paymentSchedule,
          ccEmails,
        }),
      })
      const data = await res.json()
      if (data.template) {
        setTemplates((prev) => [data.template, ...prev])
        alert('Template saved!')
      } else {
        alert('Failed to save template')
      }
    } catch {
      alert('Error saving template')
    } finally {
      setSavingTemplate(false)
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    )
    const discountAmount = discount.enabled ? (subtotal * discount.percent) / 100 : 0
    const discountedSubtotal = subtotal - discountAmount
    const tax = vatEnabled ? (discountedSubtotal * taxRate) / 100 : 0
    const total = discountedSubtotal + tax
    return { subtotal, discountAmount, discountedSubtotal, tax, total }
  }

  const { subtotal, discountAmount, tax, total } = calculateTotals()

  const handleTermsChange = (value: string) => {
    const opt = PAYMENT_TERMS_OPTIONS.find((o) => o.value === value)
    setPaymentTermsType(value)
    setPaymentTermsLabel(opt?.label || value)
    const schedule = getDefaultSchedule(value, total)
    setPaymentSchedule(schedule)
    // Auto-calculate due date for net terms
    if (isNetTerms(value)) {
      setDueDate(calculateDueDateFromTerms(value))
    }
  }

  const handleServiceChange = (index: number, field: string, value: unknown) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleServiceBatchChange = (index: number, updates: Partial<LineItem>) => {
    const updated = [...items]
    updated[index] = { ...updated[index], ...updates }
    setItems(updated)
  }

  const addService = () => {
    setItems([...items, { serviceName: '', serviceCategory: '', price: 0, quantity: 1 }])
  }

  const removeService = (index: number) => {
    if (items.length === 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleClientSelect = (client: { name: string; email?: string | null; company?: string | null }) => {
    setClientName(client.name)
    if (client.email) setClientEmail(client.email)
    if (client.company) setClientCompany(client.company)
  }

  const handleProjectChange = (pid: number | null) => {
    setProjectId(pid)
    if (pid) {
      const proj = projects.find((p) => p.id === pid)
      if (proj) {
        setProjectTitle(proj.title)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientName || !clientEmail || !projectTitle) {
      alert('Please fill in client name, email, and project title')
      return
    }

    if (items.some((s) => !s.serviceName && !s.description)) {
      alert('All services must have a name')
      return
    }

    setLoading(true)
    const { subtotal, discountAmount, tax, total } = calculateTotals()

    const body: any = {
      clientName,
      clientEmail,
      clientCompany,
      projectTitle,
      projectId: projectId || undefined,
      notes,
      lineItems: items.map((item) => ({
        ...item,
        amount: (Number(item.price) || 0) * (Number(item.quantity) || 1),
      })),
      subtotal: Number(subtotal.toFixed(2)),
      taxRate: Number(taxRate),
      vatEnabled,
      discount: { ...discount, amount: Number(discountAmount.toFixed(2)) },
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      paymentTerms: paymentTermsType,
      paymentTermsType,
      paymentTermsLabel,
      paymentMethod,
      paymentSchedule: paymentSchedule.map((item) => ({
        ...item,
        amount: +((total * item.percent) / 100).toFixed(2),
      })),
    }
    if (dueDate) body.dueDate = dueDate
    if (ccEmails?.trim()) body.ccEmails = ccEmails.trim()

    try {
      const url = invoice?.id ? `/api/invoices` : '/api/invoices'
      const method = invoice?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice?.id ? { id: invoice.id, ...body } : body),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save invoice')
      }
    } catch (error) {
      console.error('Failed to save invoice:', error)
      alert('An error occurred while saving the invoice')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-[#A8D5F0]/30 rounded-lg text-[#152a47] text-sm focus:outline-none focus:border-[#152a47] transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selector */}
      {!invoice?.id && (
        <div className="bg-white border border-[#A8D5F0]/30 p-4 rounded-lg flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-1.5">
              Load from Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value)
                if (e.target.value) applyTemplate(e.target.value)
              }}
              className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8`}
            >
              <option value="">No template — start fresh</option>
              {templates.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={saveAsTemplate}
            disabled={savingTemplate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#152a47] border border-[#152a47] rounded-lg hover:bg-[#152a47] hover:text-white transition-colors whitespace-nowrap"
          >
            {savingTemplate ? 'Saving...' : 'Save as Template'}
          </button>
        </div>
      )}

      {/* Client Information */}
      <div className="bg-white border border-[#A8D5F0]/30 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#0d1f3d]">
          <h3 className="text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px]">Client Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">
              Client Name <span className="text-red-400">*</span>
            </label>
            <ClientAutocomplete
              value={clientName}
              onChange={setClientName}
              onSelect={handleClientSelect}
              className={inputClass}
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">
              Company Address
            </label>
            <input
              type="text"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              className={inputClass}
              placeholder="Company name / address (optional)"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className={inputClass}
              placeholder="client@example.com"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">
              CC Emails
            </label>
            <input
              type="text"
              value={ccEmails}
              onChange={(e) => setCcEmails(e.target.value)}
              className={inputClass}
              placeholder="finance@client.com, manager@client.com (comma separated)"
            />
            <p className="text-[10px] text-[#6B8FAB] mt-1">Separate multiple emails with commas. CC recipients will receive the invoice too.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className={inputClass}
              placeholder="Enter project title"
              required
            />
          </div>
        </div>
        {projects.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">
              Link to Project
            </label>
            <select
              value={projectId ?? ''}
              onChange={(e) => handleProjectChange(e.target.value ? Number(e.target.value) : null)}
              className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8`}
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Services */}
      <div className="bg-white border border-[#A8D5F0]/30 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#0d1f3d]">
          <h3 className="text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px]">Services</h3>
          <button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#152a47] border border-[#152a47] rounded-lg hover:bg-[#152a47] hover:text-white transition-colors"
          >
            <Plus size={14} />
            Add Service
          </button>
        </div>

        <div className="space-y-3">
          {items.map((service, index) => (
            <div
              key={index}
              className="p-4 bg-[#F8FAFB] rounded-lg border border-[#0d1f3d]"
            >
              {/* Date + Service */}
              <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="w-full md:w-40 shrink-0">
                  <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">
                    Performance Date
                  </label>
                  <input
                    type="date"
                    value={service.date || ''}
                    onChange={(e) => handleServiceChange(index, 'date', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex-1">
                  <ServiceSelector
                    service={service}
                    onChange={(field, value) => handleServiceChange(index, field, value)}
                    onBatchChange={(updates) => handleServiceBatchChange(index, updates)}
                    inputClassName={inputClass}
                  />
                </div>
              </div>

              {/* Price + Delete */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-11">
                  <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px] mb-2">
                    Price (£)
                  </label>
                  <input
                    type="number"
                    value={service.price === 0 ? '' : service.price || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      handleServiceChange(index, 'price', value === '' ? '' : parseFloat(value))
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.value = ''
                        handleServiceChange(index, 'price', '')
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        handleServiceChange(index, 'price', 0)
                      }
                    }}
                    className={`${inputClass} text-right`}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="w-full p-2.5 rounded-lg hover:bg-red-50 border border-[#A8D5F0]/30 text-[#A8D5F0] hover:text-red-500 hover:border-red-300 transition-colors"
                    title="Remove Service"
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white border border-[#A8D5F0]/30 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#0d1f3d]">
          <h3 className="text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px]">Pricing Summary</h3>
        </div>
        <div className="space-y-6">
          {/* Toggles Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DiscountToggle discount={discount} onChange={setDiscount} />
            <VatToggle
              vatEnabled={vatEnabled}
              taxRate={taxRate}
              onVatChange={setVatEnabled}
              onRateChange={setTaxRate}
            />
            <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          {/* Payment Terms & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px]">
                Payment Terms
              </label>
              <select
                value={paymentTermsType}
                onChange={(e) => handleTermsChange(e.target.value)}
                className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8`}
              >
                {PAYMENT_TERMS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px]">
                Due Date {isNetTerms(paymentTermsType) && <span className="text-[#152a47]">(auto-calculated)</span>}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
                readOnly={isNetTerms(paymentTermsType)}
              />
            </div>
          </div>

          {/* Payment Schedule */}
          <PaymentSchedule
            schedule={paymentSchedule}
            termsType={paymentTermsType}
            total={total}
            onChange={setPaymentSchedule}
          />

          {/* Totals Box */}
          <div className="ml-auto max-w-sm w-full space-y-2.5 p-5 bg-[#F8FAFB] rounded-lg border border-[#0d1f3d]">
            <div className="flex justify-between text-sm">
              <span className="text-[#a0a0a0]">Subtotal</span>
              <span className="font-semibold text-[#152a47]">£{subtotal.toFixed(2)}</span>
            </div>
            {discount.enabled && (
              <div className="flex justify-between text-sm">
                <span className="text-[#152a47] flex items-center gap-1">
                  <Heart size={11} /> Discount ({discount.percent}%)
                </span>
                <span className="font-semibold text-[#152a47]">-£{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {vatEnabled ? (
              <div className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">VAT ({taxRate}%)</span>
                <span className="font-semibold text-[#152a47]">£{tax.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-[#a0a0a0]">VAT</span>
                <span className="text-[#A8D5F0]">N/A</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[#0d1f3d]">
              <span className="text-base font-black text-[#111] tracking-[-1px]">Total</span>
              <span className="text-base font-black text-[#111] tracking-[-1px]">£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-[#A8D5F0]/30 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#0d1f3d]">
          <h3 className="text-xs font-semibold text-[#A8D5F0] uppercase tracking-[3px]">Notes & Terms</h3>
        </div>
        <NotesField value={notes} onChange={setNotes} />
      </div>

      {/* Live PDF Preview */}
      <InvoicePreview
        clientName={clientName}
        clientCompany={clientCompany}
        clientEmail={clientEmail}
        projectTitle={projectTitle}
        lineItems={items}
        subtotal={subtotal}
        discount={discount}
        discountAmount={discountAmount}
        tax={tax}
        taxRate={taxRate}
        vatEnabled={vatEnabled}
        total={total}
        paymentTermsLabel={paymentTermsLabel}
        dueDate={dueDate}
        notes={notes}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#152a47] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              {invoice?.id ? 'Update Invoice' : 'Create Invoice'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#A8D5F0]/50 text-[#152a47] text-sm font-semibold rounded-lg hover:bg-[#F8FAFB] transition-colors"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </form>
  )
}
