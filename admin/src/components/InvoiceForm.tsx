'use client'

import { useState } from 'react'
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
  } | null
  projects?: { id: number; title: string; clientId?: number | null }[]
  onClose: () => void
  onSuccess: () => void
}

export default function InvoiceForm({ invoice, projects = [], onClose, onSuccess }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false)
  const [clientName, setClientName] = useState(invoice?.clientName || '')
  const [clientEmail, setClientEmail] = useState(invoice?.clientEmail || '')
  const [clientCompany, setClientCompany] = useState(invoice?.clientCompany || '')
  const [projectTitle, setProjectTitle] = useState(invoice?.projectTitle || '')
  const [projectId, setProjectId] = useState<number | null>(invoice?.projectId ?? null)
  const [notes, setNotes] = useState(invoice?.notes || '')
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

    const body = {
      clientName,
      clientEmail,
      clientCompany,
      projectTitle,
      projectId: projectId || undefined,
      notes,
      dueDate: dueDate || undefined,
      lineItems: items.map((item) => ({
        ...item,
        amount: (Number(item.price) || 0) * (Number(item.quantity) || 1),
      })),
      subtotal,
      taxRate,
      vatEnabled,
      discount: { ...discount, amount: discountAmount },
      tax,
      total,
      paymentTerms: paymentTermsType,
      paymentTermsType,
      paymentTermsLabel,
      paymentMethod,
      paymentSchedule: paymentSchedule.map((item) => ({
        ...item,
        amount: +((total * item.percent) / 100).toFixed(2),
      })),
    }

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
    'w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Information */}
      <div className="bg-white border border-[#A3B5C4]/30 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8ED]">
          <h3 className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Client Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">
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
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">
              Company
            </label>
            <input
              type="text"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              className={inputClass}
              placeholder="Company name (optional)"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">
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
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">
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
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">
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
      <div className="bg-white border border-[#A3B5C4]/30 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E3E8ED]">
          <h3 className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Services</h3>
          <button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1B3A4C] border border-[#1B3A4C] rounded-lg hover:bg-[#1B3A4C] hover:text-white transition-colors"
          >
            <Plus size={14} />
            Add Service
          </button>
        </div>

        <div className="space-y-3">
          {items.map((service, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-[#F8FAFB] rounded-lg border border-[#E3E8ED] items-end"
            >
              <ServiceSelector
                service={service}
                onChange={(field, value) => handleServiceChange(index, field, value)}
                onBatchChange={(updates) => handleServiceBatchChange(index, updates)}
                inputClassName={inputClass}
              />
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">
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
                  className="w-full p-2.5 rounded-lg hover:bg-red-50 border border-[#A3B5C4]/30 text-[#A3B5C4] hover:text-red-500 hover:border-red-300 transition-colors"
                  title="Remove Service"
                >
                  <Trash2 size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white border border-[#A3B5C4]/30 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8ED]">
          <h3 className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Pricing Summary</h3>
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
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">
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
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">
                Due Date {isNetTerms(paymentTermsType) && <span className="text-[#1B3A4C]">(auto-calculated)</span>}
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
          <div className="ml-auto max-w-sm w-full space-y-2.5 p-5 bg-[#F8FAFB] rounded-lg border border-[#E3E8ED]">
            <div className="flex justify-between text-sm">
              <span className="text-[#5B7A8E]">Subtotal</span>
              <span className="font-semibold text-[#1B3A4C]">£{subtotal.toFixed(2)}</span>
            </div>
            {discount.enabled && (
              <div className="flex justify-between text-sm">
                <span className="text-[#1B3A4C] flex items-center gap-1">
                  <Heart size={11} /> Discount ({discount.percent}%)
                </span>
                <span className="font-semibold text-[#1B3A4C]">-£{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {vatEnabled ? (
              <div className="flex justify-between text-sm">
                <span className="text-[#5B7A8E]">VAT ({taxRate}%)</span>
                <span className="font-semibold text-[#1B3A4C]">£{tax.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-[#5B7A8E]">VAT</span>
                <span className="text-[#A3B5C4]">N/A</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[#E3E8ED]">
              <span className="text-base font-black text-[#111] tracking-[-1px]">Total</span>
              <span className="text-base font-black text-[#111] tracking-[-1px]">£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-[#A3B5C4]/30 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E3E8ED]">
          <h3 className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Notes & Terms</h3>
        </div>
        <NotesField value={notes} onChange={setNotes} />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B3A4C] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
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
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#A3B5C4]/50 text-[#1B3A4C] text-sm font-semibold rounded-lg hover:bg-[#F8FAFB] transition-colors"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </form>
  )
}
