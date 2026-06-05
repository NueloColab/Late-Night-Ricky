'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, FileText, Send, CheckCircle, XCircle, Clock, Trash2, Eye, ArrowRight, RotateCcw } from 'lucide-react'
import Modal from '@/components/Modal'

interface Quote {
  id: number
  projectId: number | null
  lineItems: { description: string; quantity: number; rate: number; amount: number }[]
  subtotal: number
  taxRate: number
  total: number
  status: string
  paymentTerms: string | null
  createdAt: string
}

interface Project {
  id: number
  title: string
  clientId: number | null
}

interface Client {
  id: number
  name: string
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

const PAYMENT_TERMS: Record<string, string> = {
  'due-on-receipt': 'Due on Receipt',
  'net-15': 'Net 15',
  'net-30': 'Net 30',
  'net-60': 'Net 60',
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Form state
  const [items, setItems] = useState([{ description: '', quantity: 1, rate: 0 }])
  const [projectId, setProjectId] = useState<number | null>(null)
  const [taxRate, setTaxRate] = useState(20)
  const [paymentTerms, setPaymentTerms] = useState('net-30')

  useEffect(() => {
    fetchQuotes()
    fetchProjects()
    fetchClients()
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

  async function fetchClients() {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data.clients || [])
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    }
  }

  function getClientName(clientId: number | null): string {
    if (!clientId) return ''
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : ''
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
        (q.lineItems.some((i) => i.description.toLowerCase().includes(term)))
      )
    }
    return true
  })

  async function saveQuote(e: React.FormEvent) {
    e.preventDefault()
    const lineItems = items.map((i) => ({
      description: i.description,
      quantity: Number(i.quantity),
      rate: Number(i.rate),
      amount: Number(i.quantity) * Number(i.rate),
    }))
    const subtotal = lineItems.reduce((s, i) => s + i.amount, 0)
    const tax = subtotal * (taxRate / 100)

    try {
      await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems,
          subtotal,
          taxRate,
          total: subtotal + tax,
          status: 'draft',
          paymentTerms,
          projectId: projectId || undefined,
        }),
      })
      setItems([{ description: '', quantity: 1, rate: 0 }])
      setProjectId(null)
      setTaxRate(20)
      setPaymentTerms('net-30')
      setIsModalOpen(false)
      fetchQuotes()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  async function updateQuoteStatus(id: number, status: string) {
    try {
      await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchQuotes()
      // Also update the selected quote if viewing
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

  function addItem() {
    setItems([...items, { description: '', quantity: 1, rate: 0 }])
  }

  function updateItem(idx: number, field: string, value: string | number) {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.rate), 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  function openView(quote: Quote) {
    setSelectedQuote(quote)
    setIsViewOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#1B3A4C]"></div>
          <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Quote Management</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1a1a] tracking-tight">Quotes</h1>
            <p className="text-sm text-[#666] mt-1">Create, send and track client quotes.</p>
          </div>
          <button
            onClick={() => {
              setSelectedQuote(null)
              setItems([{ description: '', quantity: 1, rate: 0 }])
              setProjectId(null)
              setTaxRate(20)
              setPaymentTerms('net-30')
              setIsModalOpen(true)
            }}
            className="px-5 py-2.5 bg-[#5c7a94] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={16} />
            New Quote
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1a1a1a] text-white rounded-lg"><FileText size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#1a1a1a]">{loading ? '–' : stats.total}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Total Quotes</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#5c7a94] text-white rounded-lg"><Send size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#5c7a94]">{loading ? '–' : stats.sent}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Sent</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d6a2d] text-white rounded-lg"><CheckCircle size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#2d6a2d]">{loading ? '–' : stats.accepted}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Accepted</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#91715c] text-white rounded-lg"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#91715c]">
            {loading ? '–' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats.totalValue)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Total Value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-6 mb-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#1a1a1a] mb-3">Search Quotes</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-gray-200">
                <Search className="w-4 h-4 text-[#999]" />
              </div>
              <input
                type="text"
                placeholder="Search by description or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-gray-200 text-[#1a1a1a] placeholder-gray-400 text-sm focus:outline-none focus:border-[#5c7a94] transition-colors rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#1a1a1a] mb-3">Filter by Status</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-gray-200">
                <Filter className="w-4 h-4 text-[#999]" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-gray-200 text-[#1a1a1a] text-sm focus:outline-none focus:border-[#5c7a94] transition-colors rounded-lg appearance-none"
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
        <p className="text-[#999] text-center py-8">Loading...</p>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-[#999]">No quotes found. Create your first quote above.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Quote #', 'Project', 'Status', 'Items', 'Total', 'Terms', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#666]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote) => {
                  const proj = projects.find(p => p.id === quote.projectId)
                  const clientName = proj?.clientId ? getClientName(proj.clientId) : ''
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1a1a1a]">#{quote.id}</td>
                      <td className="px-4 py-3 text-[#666]">
                        {proj ? (clientName ? `${proj.title} — ${clientName}` : proj.title) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gray-100 text-[#1a1a1a]">
                          {STATUS_ICONS[quote.status] || <Clock size={14} />}
                          {STATUS_LABELS[quote.status] || quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#666]">{quote.lineItems.length} items</td>
                      <td className="px-4 py-3 text-[#1a1a1a] font-semibold">£{quote.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#666] text-xs">{PAYMENT_TERMS[quote.paymentTerms || 'net-30'] || quote.paymentTerms || 'Net 30'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openView(quote)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#666] hover:text-[#1a1a1a]"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-[#999] hover:text-red-500"
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

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Quote"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={saveQuote} className="space-y-6">
          {/* Project Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-2">Project (Optional)</label>
              <select
                value={projectId ?? ''}
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#5c7a94] transition-colors"
              >
                <option value="">No project</option>
                {projects.map((p) => {
                  const cn = p.clientId ? getClientName(p.clientId) : ''
                  return (
                    <option key={p.id} value={p.id}>{cn ? `${p.title} — ${cn}` : p.title}</option>
                  )
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-2">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#5c7a94] transition-colors"
              >
                {Object.entries(PAYMENT_TERMS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-24 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#5c7a94] transition-colors"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest">Line Items</p>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#5c7a94] transition-colors"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#5c7a94] transition-colors text-center"
                  />
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    placeholder="Rate £"
                    value={item.rate}
                    onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[#1a1a1a] text-sm focus:outline-none focus:border-[#5c7a94] transition-colors"
                  />
                </div>
                <div className="w-20 text-sm text-[#666] pt-2.5 text-right">
                  £{(Number(item.quantity) * Number(item.rate)).toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[#999] hover:text-red-500 text-sm pt-2.5 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="text-sm text-[#5c7a94] hover:underline underline-offset-2 transition-colors"
          >
            + Add line item
          </button>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Subtotal</span>
              <span className="text-[#1a1a1a] font-semibold">£{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Tax ({taxRate}%)</span>
              <span className="text-[#1a1a1a] font-semibold">£{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span className="text-[#1a1a1a]">Total</span>
              <span className="text-[#1a1a1a]">£{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#5c7a94] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save Quote
            </button>
          </div>
        </form>
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gray-100 text-[#1a1a1a]">
                {STATUS_ICONS[selectedQuote.status]}
                {STATUS_LABELS[selectedQuote.status] || selectedQuote.status}
              </span>
              {selectedQuote.paymentTerms && (
                <span className="text-xs text-[#666] bg-gray-50 px-2 py-1 rounded">
                  {PAYMENT_TERMS[selectedQuote.paymentTerms] || selectedQuote.paymentTerms}
                </span>
              )}
            </div>

            {/* Line items table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left font-semibold text-[#1a1a1a]">Description</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1a1a1a]">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1a1a1a]">Rate</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1a1a1a]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedQuote.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-[#1a1a1a]">{item.description}</td>
                      <td className="px-4 py-2 text-right text-[#666]">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-[#666]">£{item.rate.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-semibold text-[#1a1a1a]">£{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[#666] text-sm">Tax: {selectedQuote.taxRate}%</span>
              <span className="text-xl font-serif font-semibold text-[#1a1a1a]">
                Total: £{selectedQuote.total.toLocaleString()}
              </span>
            </div>

            {/* Status Workflow Buttons */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {selectedQuote.status === 'draft' && (
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'sent')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5c7a94] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Send size={14} />
                    Send Quote
                  </button>
                )}
                {selectedQuote.status === 'sent' && (
                  <>
                    <button
                      onClick={() => updateQuoteStatus(selectedQuote.id, 'accepted')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2d6a2d] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle size={14} />
                      Mark Accepted
                    </button>
                    <button
                      onClick={() => updateQuoteStatus(selectedQuote.id, 'declined')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      <XCircle size={14} />
                      Mark Declined
                    </button>
                  </>
                )}
                {selectedQuote.status === 'accepted' && (
                  <Link
                    href={`/admin/invoices?projectId=${selectedQuote.projectId || ''}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#91715c] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ArrowRight size={14} />
                    Create Invoice
                  </Link>
                )}
                {selectedQuote.status === 'declined' && (
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'draft')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-[#1a1a1a] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
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