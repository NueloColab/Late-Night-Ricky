'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, FileText, Send, CheckCircle, XCircle, Clock, Trash2, Eye, ArrowRight, RotateCcw } from 'lucide-react'
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
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  useEffect(() => {
    fetchQuotes()
    fetchProjects()
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
        q.id.toString().includes(term) ||
        (q.clientName && q.clientName.toLowerCase().includes(term)) ||
        (q.projectTitle && q.projectTitle.toLowerCase().includes(term)) ||
        q.lineItems.some((i) => (i.serviceName || i.description || '').toLowerCase().includes(term))
      )
    }
    return true
  })

  async function updateQuoteStatus(id: number, status: string) {
    try {
      await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchQuotes()
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote({ ...selectedQuote, status })
      }
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  async function deleteQuote(id: number) {
    if (!confirm('Delete this quote?')) return
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
    fetchQuotes()
  }

  function openView(quote: Quote) {
    setSelectedQuote(quote)
    setIsViewOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Quote Management</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Quotes</h1>
            <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Create, send and track client quotes.</p>
          </div>
          <button
            onClick={() => {
              setSelectedQuote(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
          >
            <Plus size={16} />
            New Quote
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1B3A4C] text-white rounded-lg"><FileText size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">{loading ? '–' : stats.total}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Total Quotes</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1B3A4C] text-white rounded-lg"><Send size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#1B3A4C] leading-none tracking-[-1px]">{loading ? '–' : stats.sent}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Sent</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d6a2d] text-white rounded-lg"><CheckCircle size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#2d6a2d] leading-none tracking-[-1px]">{loading ? '–' : stats.accepted}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Accepted</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#6B8FAB] text-white rounded-lg"><Clock size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#6B8FAB] leading-none tracking-[-1px]">
            {loading
              ? '–'
              : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
                  stats.totalValue
                )}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Total Value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#A3B5C4]/30 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[3px] font-semibold text-[#6B8FAB] mb-3">Search Quotes</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#A3B5C4]/30">
                <Search className="w-4 h-4 text-[#A3B5C4]" />
              </div>
              <input
                type="text"
                placeholder="Search by client, project, or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#A3B5C4]/30 text-[#1B3A4C] placeholder-[#A3B5C4] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[3px] font-semibold text-[#6B8FAB] mb-3">Filter by Status</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#A3B5C4]/30">
                <Filter className="w-4 h-4 text-[#A3B5C4]" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#A3B5C4]/30 text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors rounded-lg appearance-none"
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
        <p className="text-[#6B8FAB] text-center py-8">Loading...</p>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white border border-[#A3B5C4]/30 p-8 text-center">
          <p className="text-[#6B8FAB]">No quotes found. Create your first quote above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#A3B5C4]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#A3B5C4]/30">
                  {['Quote #', 'Client', 'Project', 'Status', 'Items', 'Total', 'Terms', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#6B8FAB]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {filteredQuotes.map((quote) => {
                  const proj = projects.find((p) => p.id === quote.projectId)
                  return (
                    <tr key={quote.id} className="hover:bg-[#F8FAFB] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1B3A4C]">#{quote.id}</td>
                      <td className="px-4 py-3 text-[#5B7A8E]">
                        {quote.clientName || '—'}
                        {quote.clientCompany && (
                          <div className="text-xs text-[#A3B5C4]">{quote.clientCompany}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#5B7A8E]">{quote.projectTitle || proj?.title || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#E3E8ED] text-[#1B3A4C]">
                          {STATUS_ICONS[quote.status] || <Clock size={14} />}
                          {STATUS_LABELS[quote.status] || quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#5B7A8E]">{quote.lineItems.length} items</td>
                      <td className="px-4 py-3 text-[#1B3A4C] font-semibold">£{quote.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#5B7A8E] text-xs">
                        {quote.paymentTermsLabel || PAYMENT_TERMS_MAP[quote.paymentTermsType || ''] || quote.paymentTermsType || 'Net 30'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openView(quote)}
                            className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#6B8FAB] hover:text-[#1B3A4C]"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#A3B5C4] hover:text-red-500"
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
        title={selectedQuote ? `Edit Quote #${selectedQuote.id}` : 'New Quote'}
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

      {/* View Modal with Status Workflow */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Quote #${selectedQuote?.id}`}
        maxWidth="max-w-2xl"
      >
        {selectedQuote && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#E3E8ED] text-[#1B3A4C]">
                {STATUS_ICONS[selectedQuote.status]}
                {STATUS_LABELS[selectedQuote.status] || selectedQuote.status}
              </span>
              {selectedQuote.paymentTermsType && (
                <span className="text-xs text-[#5B7A8E] bg-white border border-[#A3B5C4]/30 px-2 py-1 rounded">
                  {selectedQuote.paymentTermsLabel || PAYMENT_TERMS_MAP[selectedQuote.paymentTermsType] || selectedQuote.paymentTermsType}
                </span>
              )}
              {selectedQuote.paymentMethod && (
                <span className="text-xs text-[#5B7A8E] bg-white border border-[#A3B5C4]/30 px-2 py-1 rounded capitalize">
                  {selectedQuote.paymentMethod.replace('-', ' ')}
                </span>
              )}
            </div>

            {/* Client info */}
            {(selectedQuote.clientName || selectedQuote.projectTitle) && (
              <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#E3E8ED] space-y-1">
                {selectedQuote.clientName && (
                  <div className="text-sm text-[#1B3A4C] font-semibold">{selectedQuote.clientName}</div>
                )}
                {selectedQuote.clientCompany && (
                  <div className="text-xs text-[#5B7A8E]">{selectedQuote.clientCompany}</div>
                )}
                {selectedQuote.clientEmail && (
                  <div className="text-xs text-[#6B8FAB]">{selectedQuote.clientEmail}</div>
                )}
                {selectedQuote.projectTitle && (
                  <div className="text-xs text-[#5B7A8E] pt-1 border-t border-[#E3E8ED] mt-1">{selectedQuote.projectTitle}</div>
                )}
              </div>
            )}

            {/* Line items table */}
            <div className="bg-white border border-[#A3B5C4]/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#A3B5C4]/30">
                    <th className="px-4 py-2 text-left font-semibold text-[#1B3A4C]">Service</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">Price</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8ED]">
                  {selectedQuote.lineItems.map((item, idx) => {
                    const isOldFormat = !!item.description
                    const name = isOldFormat ? item.description : item.serviceName
                    const category = item.serviceCategory
                    const qty = isOldFormat ? item.quantity : (item.quantity || 1)
                    const rate = isOldFormat ? item.rate : item.price
                    const amount = isOldFormat ? item.amount : ((item.price || 0) * (item.quantity || 1))
                    return (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-[#1B3A4C]">
                        <div className="font-medium">{name}</div>
                        {category && (
                          <div className="text-xs text-[#6B8FAB]">{category}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-[#5B7A8E]">{qty}</td>
                      <td className="px-4 py-2 text-right text-[#5B7A8E]">£{Number(rate).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">
                        £{Number(amount).toLocaleString()}
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[#5B7A8E] text-sm">Tax: {selectedQuote.taxRate}%</span>
              <span className="text-xl font-black text-[#111] tracking-[-1px]">
                Total: £{selectedQuote.total.toLocaleString()}
              </span>
            </div>

            {/* Notes */}
            {selectedQuote.notes && (
              <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#E3E8ED]">
                <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Notes</p>
                <p className="text-sm text-[#5B7A8E] whitespace-pre-wrap">{selectedQuote.notes}</p>
              </div>
            )}

            {/* Status Workflow Buttons */}
            <div className="border-t border-[#A3B5C4]/30 pt-4">
              <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {selectedQuote.status === 'draft' && (
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'sent')}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#1B3A4C] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:bg-[#1B3A4C] hover:text-white transition"
                  >
                    <Send size={14} />
                    Send Quote
                  </button>
                )}
                {selectedQuote.status === 'sent' && (
                  <>
                    <button
                      onClick={() => updateQuoteStatus(selectedQuote.id, 'accepted')}
                      className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#2d6a2d] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#2d6a2d] hover:bg-[#2d6a2d] hover:text-white transition"
                    >
                      <CheckCircle size={14} />
                      Mark Accepted
                    </button>
                    <button
                      onClick={() => updateQuoteStatus(selectedQuote.id, 'declined')}
                      className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-300 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-red-600 hover:bg-red-50 transition"
                    >
                      <XCircle size={14} />
                      Mark Declined
                    </button>
                  </>
                )}
                {selectedQuote.status === 'accepted' && (
                  <Link
                    href={`/admin/invoices?projectId=${selectedQuote.projectId || ''}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#6B8FAB] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#6B8FAB] hover:bg-[#6B8FAB] hover:text-white transition"
                  >
                    <ArrowRight size={14} />
                    Create Invoice
                  </Link>
                )}
                {selectedQuote.status === 'declined' && (
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'draft')}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#A3B5C4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition"
                  >
                    <RotateCcw size={14} />
                    Reopen as Draft
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
