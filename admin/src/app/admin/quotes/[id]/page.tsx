'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Trash2,
  Edit2,
  Mail,
  Download,
  Users,
  FolderOpen,
  Receipt,
  Copy,
  Clock,
  Loader2,
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
  updatedAt: string
  quoteNumber: string | null
  acceptToken: string | null
  convertedToInvoice: boolean
  invoiceId: number | null
  sentAt: string | null
  emailSentAt: string | null
}

function normaliseStatus(raw: string) {
  const s = (raw || '').trim().toLowerCase()
  if (s === 'approved') return 'accepted'
  if (s === 'rejected') return 'declined'
  if (!s) return 'draft'
  return s
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  sent:     { bg: '#1B3A4C1a', text: '#1B3A4C', border: '#1B3A4C33' },
  accepted: { bg: '#2d6a2d1a', text: '#2d6a2d', border: '#2d6a2d33' },
  declined: { bg: '#c4632e1a', text: '#c4632e', border: '#c4632e33' },
  draft:    { bg: '#f8f7f6',   text: '#666666', border: '#e5e5e5' },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0)
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchQuote()
  }, [id])

  async function fetchQuote() {
    setLoading(true)
    try {
      const res = await fetch(`/api/quotes/${id}`)
      if (!res.ok) {
        router.push('/admin/quotes')
        return
      }
      const data = await res.json()
      setQuote(data.quote || data)
    } catch {
      router.push('/admin/quotes')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendEmail() {
    if (!quote) return
    setSendingEmail(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}/send`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        alert('Quote sent successfully')
        fetchQuote()
      } else {
        alert(data.error || 'Failed to send quote')
      }
    } catch {
      alert('An error occurred while sending the quote')
    } finally {
      setSendingEmail(false)
    }
  }

  async function handleDownloadPDF() {
    if (!quote) return
    try {
      const res = await fetch(`/api/quotes/${quote.id}/pdf`)
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quote-${quote.quoteNumber || quote.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      alert('Failed to download PDF')
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!quote) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchQuote()
      } else {
        alert('Failed to update quote status')
      }
    } catch {
      alert('An error occurred while updating the status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleConvertToInvoice() {
    if (!quote) return
    if (!confirm('Convert this accepted quote to an invoice?')) return
    try {
      const res = await fetch(`/api/quotes/${quote.id}/convert-to-invoice`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        alert(`Invoice ${data.invoiceNumber} created successfully`)
        router.push(`/admin/invoices/${data.invoiceId}`)
      } else {
        alert(data.error || 'Failed to convert to invoice')
      }
    } catch {
      alert('Failed to convert quote to invoice')
    }
  }

  async function handleDelete() {
    if (!quote) return
    if (!confirm('Delete this quote permanently?')) return
    try {
      await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' })
      router.push('/admin/quotes')
    } catch {
      alert('Failed to delete quote')
    }
  }

  function handleCopyAcceptLink() {
    if (!quote?.acceptToken) return
    const url = `${window.location.origin}/quote/accept?token=${quote.acceptToken}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    alert('Accept link copied to clipboard')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <Loader2 size={32} className="animate-spin mx-auto text-[#6B8FAB] mb-4" />
        <p className="text-[#6B8FAB] text-sm">Loading quote...</p>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <AlertCircle size={32} className="mx-auto text-red-400 mb-4" />
        <p className="text-[#5B7A8E] text-sm">Quote not found.</p>
      </div>
    )
  }

  const currentStatus = normaliseStatus(quote.status)
  const style = statusStyles[currentStatus] || statusStyles.draft

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock size={14} />
      case 'sent': return <Mail size={14} />
      case 'accepted': return <CheckCircle size={14} />
      case 'declined': return <XCircle size={14} />
      default: return null
    }
  }

  const validUntil = new Date(new Date(quote.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000)
  const isExpired = validUntil < new Date() && currentStatus !== 'accepted'

  const lineItems = Array.isArray(quote.lineItems) ? quote.lineItems : []

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Back Link */}
      <Link
        href="/admin/quotes"
        className="inline-flex items-center gap-2 text-sm text-[#1B3A4C] hover:text-[#111] transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Quotes</span>
      </Link>

      {/* Header Row */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-px bg-[#A3B5C4]" />
              <p className="text-xs uppercase tracking-widest text-[#5B7A8E]">Quote Details</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-[#111] mb-2">
              {quote.quoteNumber || `QT-${String(quote.id).padStart(3, '0')}`}
            </h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full"
                style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
              >
                {getStatusIcon(currentStatus)}
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </span>
              {quote.emailSentAt && (
                <span className="text-sm text-[#5B7A8E]">
                  Email sent on {new Date(quote.emailSentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-white border border-[#A3B5C4] text-[#111] hover:border-[#1B3A4C]"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-[#1B3A4C] text-white hover:bg-[#0f1923]"
            >
              {sendingEmail ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail size={14} />
                  <span>{quote.emailSentAt ? 'Resend' : 'Send'}</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-white border border-[#A3B5C4] text-[#111] hover:border-[#1B3A4C]"
            >
              <Download size={14} />
              <span>PDF</span>
            </button>

            {currentStatus === 'accepted' && !quote.convertedToInvoice && (
              <button
                onClick={handleConvertToInvoice}
                className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-[#0f1923] text-white hover:bg-[#1B3A4C]"
              >
                <FileText size={14} />
                <span>Convert to Invoice</span>
              </button>
            )}

            {quote.convertedToInvoice && quote.invoiceId && (
              <Link
                href={`/admin/invoices/${quote.invoiceId}`}
                className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-white border border-[#1B3A4C] text-[#1B3A4C]"
              >
                <FileText size={14} />
                <span>View Invoice</span>
              </Link>
            )}

            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Client & Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E3E8ED] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-[#1B3A4C] text-white">
              <Users size={16} />
            </div>
            <h3 className="text-lg font-light text-[#111]">Client Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Name</p>
              <p className="text-base font-medium text-[#111]">{quote.clientName || '—'}</p>
            </div>
            {quote.clientCompany && (
              <div>
                <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Company</p>
                <p className="text-base text-[#111]">{quote.clientCompany}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Email</p>
              <p className="text-base text-[#111]">{quote.clientEmail || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E3E8ED] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-[#1B3A4C] text-white">
              <FolderOpen size={16} />
            </div>
            <h3 className="text-lg font-light text-[#111]">Project Details</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Project Title</p>
              <p className="text-base font-medium text-[#111]">{quote.projectTitle || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Date Created</p>
              <p className="text-base text-[#111]">
                {new Date(quote.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Valid Until</p>
              <p className={`text-base ${isExpired ? 'text-red-600 font-medium' : 'text-[#111]'}`}>
                {validUntil.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                {isExpired && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">Expired</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white border border-[#E3E8ED] overflow-hidden">
        <div className="p-6 border-b border-[#E3E8ED]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1B3A4C] text-white">
              <FileText size={16} />
            </div>
            <h3 className="text-lg font-light text-[#111]">Services</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFB] border-b border-[#E3E8ED]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#111] uppercase tracking-widest">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8ED]">
              {lineItems.map((item, index) => (
                <tr key={index} className="hover:bg-[#F8FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#111]">{item.serviceName || item.description || 'Service'}</p>
                    {item.description && item.serviceName && (
                      <p className="text-xs text-[#5B7A8E] mt-1 leading-relaxed">{item.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.serviceCategory && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#1B3A4C1a] text-[#1B3A4C]">
                        {item.serviceCategory}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#111] text-right">
                    {formatCurrency(item.price || item.amount || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white border border-[#E3E8ED] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-[#1B3A4C] text-white">
            <Receipt size={16} />
          </div>
          <h3 className="text-lg font-light text-[#111]">Pricing Summary</h3>
        </div>
        <div className="max-w-md ml-auto space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#5B7A8E]">Subtotal:</span>
            <span className="font-semibold text-[#111]">{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#5B7A8E]">VAT ({quote.taxRate}%):</span>
            <span className="font-semibold text-[#111]">{formatCurrency((quote.subtotal * quote.taxRate) / 100)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold pt-3 border-t-2 border-[#111]">
            <span className="text-[#0f1923]">Total:</span>
            <span className="text-[#0f1923]">{formatCurrency(quote.total)}</span>
          </div>
          {quote.paymentMethod && (
            <div className="flex justify-between items-center text-sm pt-3 border-t border-[#E3E8ED]">
              <span className="text-[#5B7A8E]">Payment Method:</span>
              <span className="font-medium text-[#111] capitalize">{(quote.paymentMethod || '').replace(/-/g, ' ')}</span>
            </div>
          )}
          {quote.paymentTermsLabel && (
            <div className="flex justify-between items-center text-sm pt-3 border-t border-[#E3E8ED]">
              <span className="text-[#5B7A8E]">Payment Terms:</span>
              <span className="font-semibold text-[#111]">{quote.paymentTermsLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="bg-[#F8FAFB] border border-[#E3E8ED] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-[#1B3A4C] text-white">
              <FileText size={16} />
            </div>
            <h3 className="text-lg font-light text-[#111]">Notes & Terms</h3>
          </div>
          <p className="text-sm text-[#5B7A8E] whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
        </div>
      )}

      {/* Status Update */}
      <div className="bg-white border border-[#E3E8ED] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-[#1B3A4C] text-white">
            <Clock size={16} />
          </div>
          <h3 className="text-lg font-light text-[#111]">Update Status</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {['draft', 'sent', 'accepted', 'declined'].map((status) => {
            const isActive = currentStatus === status
            const s = statusStyles[status] || statusStyles.draft
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updatingStatus || isActive}
                className="px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed"
                style={isActive
                  ? { backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }
                  : { backgroundColor: '#fff', color: '#666', border: '1px solid #e5e5e5' }
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Accept Link */}
      {quote.acceptToken && (
        <div className="bg-white border border-[#E3E8ED] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-[#1B3A4C] text-white">
              <CheckCircle size={16} />
            </div>
            <h3 className="text-lg font-light text-[#111]">Client Accept Link</h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/quote/accept?token=${quote.acceptToken}`}
              className="flex-1 px-4 py-2 text-sm border border-[#E3E8ED] bg-[#F8FAFB] text-[#5B7A8E] focus:outline-none"
            />
            <button
              onClick={handleCopyAcceptLink}
              className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-white border border-[#E3E8ED] text-[#111] hover:border-[#1B3A4C]"
            >
              <Copy size={14} />
              <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
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
