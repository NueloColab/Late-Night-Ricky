'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trash2,
  Edit,
  Loader2,
  FileText,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  PoundSterling,
  AlertCircle,
} from 'lucide-react'
import Modal from '@/components/Modal'
import QuoteForm from '@/components/QuoteForm'

interface LineItem {
  serviceName?: string
  serviceCategory?: string
  price?: number
  quantity?: number
  description?: string
  rate?: number
  amount?: number
}

interface Quote {
  id: number
  projectId: number | null
  clientName: string | null
  clientEmail: string | null
  clientCompany: string | null
  projectTitle: string | null
  lineItems: LineItem[]
  subtotal: number
  taxRate: number
  total: number
  status: string
  paymentTermsType: string | null
  paymentTermsLabel: string | null
  paymentMethod: string | null
  notes: string | null
  createdAt: string
  quoteNumber: string | null
  acceptToken: string | null
  convertedToInvoice: boolean
  invoiceId: number | null
  sentAt: string | null
}

interface Project {
  id: number
  title: string
  clientId: number | null
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  declined: 'Declined',
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[#E3E8ED]/80 text-[#5B7A8E]',
  sent: 'bg-[#1B3A4C]/10 text-[#1B3A4C]',
  accepted: 'bg-[#2d6a2d]/10 text-[#2d6a2d]',
  declined: 'bg-red-50 text-red-600',
}

const PAYMENT_TERMS_MAP: Record<string, string> = {
  'due-on-receipt': 'Due on Receipt',
  'net-7': 'Net 7',
  'net-14': 'Net 14',
  'net-30': 'Net 30',
  'net-60': 'Net 60',
  '50-50': '50/50 Split',
  '25-50-25': '25/50/25',
  'dev-standard': 'Dev Standard',
  'custom': 'Custom',
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [converting, setConverting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchQuote()
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchQuote() {
    setLoading(true)
    try {
      const res = await fetch(`/api/quotes/${id}`)
      const data = await res.json()
      if (data.quote) {
        setQuote(data.quote)
      } else {
        setQuote(null)
      }
    } catch (err) {
      console.error('Failed to fetch quote:', err)
      setQuote(null)
    }
    setLoading(false)
  }

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    }
  }

  async function updateStatus(status: string) {
    if (!quote) return
    try {
      await fetch(`/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchQuote()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  async function sendQuote() {
    if (!quote) return
    if (!confirm('Send this quote via email to the client?')) return
    setSending(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to send quote')
      } else {
        alert('Quote sent successfully')
      }
      fetchQuote()
    } catch (err) {
      console.error('Send failed:', err)
      alert('Failed to send quote')
    } finally {
      setSending(false)
    }
  }

  async function convertToInvoice() {
    if (!quote) return
    if (!confirm('Convert this accepted quote to an invoice?')) return
    setConverting(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}/convert-to-invoice`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to convert quote')
      } else {
        alert(`Invoice ${data.invoiceNumber} created successfully`)
      }
      fetchQuote()
    } catch (err) {
      console.error('Convert failed:', err)
      alert('Failed to convert quote to invoice')
    } finally {
      setConverting(false)
    }
  }

  async function deleteQuote() {
    if (!quote) return
    if (!confirm('Delete this quote permanently?')) return
    try {
      await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' })
      router.push('/admin/quotes')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <Loader2 size={32} className="animate-spin mx-auto text-[#6B8FAB] mb-4" />
        <p className="text-[#6B8FAB] text-sm">Loading quote...</p>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <AlertCircle size={32} className="mx-auto text-red-400 mb-4" />
        <p className="text-[#5B7A8E] text-sm mb-4">Quote not found.</p>
        <Link
          href="/admin/quotes"
          className="inline-flex items-center gap-2 px-6 py-2 border-2 border-[#111] rounded-full text-xs font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
        >
          <ArrowLeft size={14} />
          Back to Quotes
        </Link>
      </div>
    )
  }

  const proj = projects.find((p) => p.id === quote.projectId)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/quotes"
          className="text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest hover:underline flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={12} /> Back to Quotes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-[#A3B5C4]" />
              <span className="text-xs text-[#999] uppercase tracking-wider">
                {quote.quoteNumber || `QT-${String(quote.id).padStart(3, '0')}`}
              </span>
            </div>
            <h1 className="font-black text-[clamp(24px,3.5vw,40px)] text-[#111] tracking-[-0.5px] uppercase">
              Quote {quote.quoteNumber || `QT-${String(quote.id).padStart(3, '0')}`}
            </h1>
            <p className="text-sm text-[#5B7A8E] mt-1">
              {quote.clientName || 'Unknown Client'} — {quote.projectTitle || proj?.title || 'No project'}
            </p>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${STATUS_STYLES[quote.status] || 'bg-[#E3E8ED]/80 text-[#5B7A8E]'}`}
          >
            {STATUS_LABELS[quote.status] || quote.status}
          </span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-3">Actions</p>
        <div className="flex flex-wrap gap-2">
          {quote.status === 'draft' && (
            <button
              onClick={sendQuote}
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3A4C] text-white rounded-full text-[11px] font-semibold uppercase tracking-[1px] hover:opacity-90 transition disabled:opacity-50"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send Quote
            </button>
          )}
          {quote.status === 'sent' && (
            <>
              <button
                onClick={() => updateStatus('accepted')}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#2d6a2d] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#2d6a2d] hover:bg-[#2d6a2d] hover:text-white transition"
              >
                <CheckCircle size={14} />
                Mark Accepted
              </button>
              <button
                onClick={() => updateStatus('declined')}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-300 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-red-600 hover:bg-red-50 transition"
              >
                <XCircle size={14} />
                Mark Declined
              </button>
            </>
          )}
          {quote.status === 'accepted' && (
            <>
              {!quote.convertedToInvoice ? (
                <button
                  onClick={convertToInvoice}
                  disabled={converting}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#6B8FAB] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#6B8FAB] hover:bg-[#6B8FAB] hover:text-white transition disabled:opacity-50"
                >
                  {converting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                  Create Invoice
                </button>
              ) : (
                <Link
                  href={`/admin/invoices?projectId=${quote.projectId || ''}`}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#6B8FAB] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#6B8FAB] hover:bg-[#6B8FAB] hover:text-white transition"
                >
                  <ArrowRight size={14} />
                  View Invoices
                </Link>
              )}
            </>
          )}
          {quote.status === 'declined' && (
            <button
              onClick={() => updateStatus('draft')}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#A3B5C4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition"
            >
              <RotateCcw size={14} />
              Reopen as Draft
            </button>
          )}
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#A3B5C4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={deleteQuote}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-200 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-red-500 hover:bg-red-50 hover:border-red-300 transition"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-[#6B8FAB]" />
          <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider">Client & Project</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quote.clientName && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Client</p>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-[#6B8FAB]" />
                <span className="text-sm text-[#111] font-medium">{quote.clientName}</span>
              </div>
            </div>
          )}
          {quote.clientEmail && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Email</p>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-[#6B8FAB]" />
                <span className="text-sm text-[#5B7A8E]">{quote.clientEmail}</span>
              </div>
            </div>
          )}
          {quote.clientCompany && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Company</p>
              <div className="flex items-center gap-2">
                <Building2 size={12} className="text-[#6B8FAB]" />
                <span className="text-sm text-[#5B7A8E]">{quote.clientCompany}</span>
              </div>
            </div>
          )}
          {quote.projectTitle && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Project</p>
              <div className="flex items-center gap-2">
                <Briefcase size={12} className="text-[#6B8FAB]" />
                <span className="text-sm text-[#111] font-medium">{quote.projectTitle}</span>
              </div>
            </div>
          )}
          {quote.sentAt && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Sent</p>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-[#6B8FAB]" />
                <span className="text-sm text-[#5B7A8E]">
                  {new Date(quote.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}
          {quote.createdAt && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Created</p>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-[#6B8FAB]" />
                <span className="text-sm text-[#5B7A8E]">
                  {new Date(quote.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <PoundSterling size={16} className="text-[#6B8FAB]" />
          <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider">Line Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#A3B5C4]/30">
                <th className="px-4 py-2 text-left font-semibold text-[#1B3A4C] text-xs uppercase tracking-wider">Service</th>
                <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C] text-xs uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C] text-xs uppercase tracking-wider">Price</th>
                <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C] text-xs uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8ED]">
              {quote.lineItems.map((item, idx) => {
                const isOldFormat = !!item.description
                const name = isOldFormat ? item.description : item.serviceName
                const category = item.serviceCategory
                const qty = isOldFormat ? item.quantity : item.quantity || 1
                const rate = isOldFormat ? item.rate : item.price
                const amount = isOldFormat ? item.amount : (item.price || 0) * (item.quantity || 1)
                return (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-[#1B3A4C]">
                      <div className="font-medium text-sm">{name}</div>
                      {category && <div className="text-xs text-[#6B8FAB]">{category}</div>}
                    </td>
                    <td className="px-4 py-3 text-right text-[#5B7A8E]">{qty}</td>
                    <td className="px-4 py-3 text-right text-[#5B7A8E]">£{Number(rate).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1B3A4C]">
                      £{Number(amount).toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 ml-auto max-w-sm w-full space-y-2 p-5 bg-[#F8FAFB] rounded-lg border border-[#E3E8ED]">
          <div className="flex justify-between text-sm">
            <span className="text-[#5B7A8E]">Subtotal</span>
            <span className="font-semibold text-[#1B3A4C]">£{quote.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#5B7A8E]">Tax ({quote.taxRate}%)</span>
            <span className="font-semibold text-[#1B3A4C]">
              £{((quote.subtotal * quote.taxRate) / 100).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t border-[#E3E8ED]">
            <span className="text-base font-black text-[#111] tracking-[-1px]">Total</span>
            <span className="text-base font-black text-[#111] tracking-[-1px]">
              £{quote.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Payment & Terms */}
      <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-[#6B8FAB]" />
          <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider">Payment & Terms</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Payment Terms</p>
            <p className="text-sm text-[#111] font-medium">
              {quote.paymentTermsLabel || PAYMENT_TERMS_MAP[quote.paymentTermsType || ''] || quote.paymentTermsType || 'Net 30'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Payment Method</p>
            <p className="text-sm text-[#111] font-medium capitalize">
              {(quote.paymentMethod || 'bank-transfer').replace('-', ' ')}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Status</p>
            <span
              className={`inline-block text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full ${STATUS_STYLES[quote.status] || 'bg-[#E3E8ED]/80 text-[#5B7A8E]'}`}
            >
              {STATUS_LABELS[quote.status] || quote.status}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} className="text-[#6B8FAB]" />
            <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider">Notes</h3>
          </div>
          <p className="text-sm text-[#5B7A8E] whitespace-pre-wrap">{quote.notes}</p>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${quote.quoteNumber || `Quote #${quote.id}`}`}
        maxWidth="max-w-4xl"
      >
        <QuoteForm
          quote={quote}
          projects={projects}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            fetchQuote()
            setIsEditOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
