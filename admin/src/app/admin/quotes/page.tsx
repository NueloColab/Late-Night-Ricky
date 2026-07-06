'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, FileText, Send, CheckCircle, XCircle, Clock, Trash2, Eye, Loader2 } from 'lucide-react'
import Modal from '@/components/Modal'
import QuoteForm from '@/components/QuoteForm'

interface Quote {
  id: number
  projectId: number | null
  clientName: string | null
  clientEmail: string | null
  clientCompany: string | null
  projectTitle: string | null
  lineItems: { 
    serviceName?: string
    serviceCategory?: string
    price?: number
    quantity?: number
    description?: string
    rate?: number
    amount?: number
  }[]
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
}

interface Project {
  id: number
  title: string
  clientId: number | null
}

const STATUS_OPTIONS = ['all', 'draft', 'sent', 'accepted', 'declined']

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  declined: 'Declined',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <Clock size={14} />,
  sent: <Send size={14} />,
  accepted: <CheckCircle size={14} />,
  declined: <XCircle size={14} />,
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

export default function QuotesPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [sendingId, setSendingId] = useState<number | null>(null)

  useEffect(() => {
    fetchQuotes()
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search])

  async function fetchQuotes() {
    setLoading(true)
    try {
      let url = '/api/quotes'
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (search) params.append('search', search)
      if (params.toString()) url += '?' + params.toString()

      const res = await fetch(url)
      const data = await res.json()
      setQuotes(data.quotes || [])
    } catch (err) {
      console.error('Failed to fetch quotes:', err)
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

  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    sent: quotes.filter((q) => q.status === 'sent').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
    declined: quotes.filter((q) => q.status === 'declined').length,
    totalValue: quotes.reduce((sum, q) => sum + (q.total || 0), 0),
  }

  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false
    if (search) {
      const term = search.toLowerCase()
      return (
        (q.quoteNumber && q.quoteNumber.toLowerCase().includes(term)) ||
        q.id.toString().includes(term) ||
        (q.clientName && q.clientName.toLowerCase().includes(term)) ||
        (q.projectTitle && q.projectTitle.toLowerCase().includes(term)) ||
        q.lineItems.some((i) => (i.serviceName || i.description || '').toLowerCase().includes(term))
      )
    }
    return true
  })

  async function sendQuote(id: number) {
    if (!confirm('Send this quote via email to the client?')) return
    setSendingId(id)
    try {
      const res = await fetch(`/api/quotes/${id}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to send quote')
      } else {
        alert('Quote sent successfully')
      }
      fetchQuotes()
    } catch (err) {
      console.error('Send failed:', err)
      alert('Failed to send quote')
    } finally {
      setSendingId(null)
    }
  }

  async function deleteQuote(id: number) {
    if (!confirm('Delete this quote?')) return
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
    fetchQuotes()
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#91715c] tracking-[3px] uppercase font-semibold mb-4">Quote Management</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#2a1a0a] tracking-[-2px] uppercase leading-[0.95]">Quotes</h1>
            <p className="text-sm text-[#b89a6e] mt-4 font-semibold uppercase tracking-[0.5px]">Create, send and track client quotes.</p>
          </div>
          <button
            onClick={() => {
              setSelectedQuote(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#2a1a0a] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#2a1a0a] hover:bg-[#FAFAF7] hover:text-white transition"
          >
            <Plus size={16} />
            New Quote
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-[#91715c]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2a1a0a] text-white rounded-lg"><FileText size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#2a1a0a] leading-none tracking-[-1px]">{loading ? '–' : stats.total}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#91715c] font-medium mt-2">Total Quotes</p>
        </div>
        <div className="bg-white border border-[#91715c]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2a1a0a] text-white rounded-lg"><Send size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#2a1a0a] leading-none tracking-[-1px]">{loading ? '–' : stats.sent}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#91715c] font-medium mt-2">Sent</p>
        </div>
        <div className="bg-white border border-[#91715c]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#5c7a3c] text-white rounded-lg"><CheckCircle size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#5c7a3c] leading-none tracking-[-1px]">{loading ? '–' : stats.accepted}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#91715c] font-medium mt-2">Accepted</p>
        </div>
        <div className="bg-white border border-[#91715c]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#91715c] text-white rounded-lg"><Clock size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#91715c] leading-none tracking-[-1px]">
            {loading
              ? '–'
              : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
                  stats.totalValue
                )}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#91715c] font-medium mt-2">Total Value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#91715c]/30 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[3px] font-semibold text-[#91715c] mb-3">Search Quotes</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#91715c]/30">
                <Search className="w-4 h-4 text-[#91715c]" />
              </div>
              <input
                type="text"
                placeholder="Search by client, project, or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#91715c]/30 text-[#2a1a0a] placeholder-[#91715c] text-sm focus:outline-none focus:border-[#2a1a0a] transition-colors rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[3px] font-semibold text-[#91715c] mb-3">Filter by Status</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#91715c]/30">
                <Filter className="w-4 h-4 text-[#91715c]" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#91715c]/30 text-[#2a1a0a] text-sm focus:outline-none focus:border-[#2a1a0a] transition-colors rounded-lg appearance-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'all' ? 'All Quotes' : STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[#91715c] text-center py-8">Loading...</p>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white border border-[#91715c]/30 p-8 text-center">
          <p className="text-[#91715c]">No quotes found. Create your first quote above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#91715c]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#91715c]/30">
                  {['Quote #', 'Client', 'Project', 'Status', 'Items', 'Total', 'Terms', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#91715c]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAFAF7]">
                {filteredQuotes.map((quote) => {
                  const proj = projects.find((p) => p.id === quote.projectId)
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => router.push(`/admin/quotes/${quote.id}`)}
                      className="hover:bg-[#f5f0e8] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-semibold text-[#2a1a0a]">
                        {quote.quoteNumber || `QT-${String(quote.id).padStart(3, '0')}`}
                      </td>
                      <td className="px-4 py-3 text-[#b89a6e]">
                        {quote.clientName || '—'}
                        {quote.clientCompany && (
                          <div className="text-xs text-[#91715c]">{quote.clientCompany}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#b89a6e]">{quote.projectTitle || proj?.title || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#FAFAF7] text-[#2a1a0a]">
                          {STATUS_ICONS[quote.status] || <Clock size={14} />}
                          {STATUS_LABELS[quote.status] || quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#b89a6e]">{quote.lineItems.length} items</td>
                      <td className="px-4 py-3 text-[#2a1a0a] font-semibold">£{quote.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#b89a6e] text-xs">
                        {quote.paymentTermsLabel || PAYMENT_TERMS_MAP[quote.paymentTermsType || ''] || quote.paymentTermsType || 'Net 30'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => router.push(`/admin/quotes/${quote.id}`)}
                            className="p-1.5 hover:bg-[#FAFAF7] rounded-lg transition-colors text-[#91715c] hover:text-[#2a1a0a]"
                          >
                            <Eye size={16} />
                          </button>
                          {quote.status === 'draft' && (
                            <button
                              onClick={() => sendQuote(quote.id)}
                              disabled={sendingId === quote.id}
                              className="p-1.5 hover:bg-[#FAFAF7] rounded-lg transition-colors text-[#91715c] hover:text-[#2a1a0a] disabled:opacity-50"
                            >
                              {sendingId === quote.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                          )}
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="p-1.5 hover:bg-[#FAFAF7] rounded-lg transition-colors text-[#91715c] hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedQuote ? `Edit ${selectedQuote.quoteNumber || `Quote #${selectedQuote.id}`}` : 'New Quote'}
        maxWidth="max-w-4xl"
      >
        <QuoteForm
          quote={selectedQuote}
          projects={projects}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchQuotes()
            setIsModalOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
