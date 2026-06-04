'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, FileText, Send, CheckCircle, XCircle, Clock, Trash2, Eye } from 'lucide-react'
import Modal from '@/components/Modal'

interface Quote {
  id: number
  projectId: number | null
  lineItems: { description: string; quantity: number; rate: number; amount: number }[]
  subtotal: number
  taxRate: number
  total: number
  status: string
  createdAt: string
}

interface Project {
  id: number
  title: string
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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
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
          projectId: projectId || undefined,
        }),
      })
      setItems([{ description: '', quantity: 1, rate: 0 }])
      setProjectId(null)
      setTaxRate(20)
      setIsModalOpen(false)
      fetchQuotes()
    } catch (err) {
      console.error('Save failed:', err)
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#1B3A4C]"></div>
          <p className="text-xs uppercase tracking-widest text-[#8FA8BE] font-medium">Quote Management</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1B3A4C] tracking-tight">Quotes</h1>
            <p className="text-sm text-[#8FA8BE] mt-1">Create, send and track client quotes.</p>
          </div>
          <button
            onClick={() => {
              setSelectedQuote(null)
              setItems([{ description: '', quantity: 1, rate: 0 }])
              setProjectId(null)
              setTaxRate(20)
              setIsModalOpen(true)
            }}
            className="px-5 py-2.5 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-[#2a4a5c] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Quote
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E3E8ED] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1B3A4C] text-white rounded-lg">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#1B3A4C]">{loading ? '–' : stats.total}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Total Quotes</p>
        </div>

        <div className="bg-white border border-[#E3E8ED] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#8FA8BE] text-white rounded-lg">
              <Send size={16} />
            </div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#8FA8BE]">{loading ? '–' : stats.sent}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Sent</p>
        </div>

        <div className="bg-white border border-[#E3E8ED] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#6B8FAB] text-white rounded-lg">
              <CheckCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#6B8FAB]">{loading ? '–' : stats.accepted}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Accepted</p>
        </div>

        <div className="bg-white border border-[#E3E8ED] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#5B7A8E] text-white rounded-lg">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#5B7A8E]">
            {loading ? '–' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats.totalValue)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Total Value</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E3E8ED] rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#1B3A4C] mb-3">Search Quotes</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#E3E8ED]">
                <Search className="w-4 h-4 text-[#8FA8BE]" />
              </div>
              <input
                type="text"
                placeholder="Search by description or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#E3E8ED] text-[#1B3A4C] placeholder-[#A3B5C4] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#1B3A4C] mb-3">Filter by Status</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#E3E8ED]">
                <Filter className="w-4 h-4 text-[#8FA8BE]" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#E3E8ED] text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors rounded-lg appearance-none"
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

      {/* Summary Bar */}
      {!loading && quotes.length > 0 && (
        <div className="bg-white border border-[#E3E8ED] rounded-xl px-5 py-3 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#8FA8BE]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1B3A4C] inline-block"></span>
            {stats.total} quote{stats.total !== 1 ? 's' : ''}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8FA8BE] inline-block"></span>
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats.totalValue)} total
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6B8FAB] inline-block"></span>
            {stats.sent} sent
          </span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-[#8FA8BE] text-center py-8">Loading...</p>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white border border-[#E3E8ED] rounded-xl p-8 text-center">
          <p className="text-[#8FA8BE]">No quotes found. Create your first quote above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E3E8ED] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E3E8ED]">
                  {['Quote #', 'Status', 'Line Items', 'Subtotal', 'Tax', 'Total', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-[#F8FAFB] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#1B3A4C]">#{quote.id}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#E3E8ED] text-[#1B3A4C]">
                        {STATUS_ICONS[quote.status] || <Clock size={14} />}
                        {STATUS_LABELS[quote.status] || quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8FA8BE]">{quote.lineItems.length} items</td>
                    <td className="px-4 py-3 text-[#8FA8BE]">£{quote.subtotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#8FA8BE]">{quote.taxRate}%</td>
                    <td className="px-4 py-3 text-[#1B3A4C] font-semibold">£{quote.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedQuote(quote)
                            setIsViewOpen(true)
                          }}
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#8FA8BE] hover:text-[#1B3A4C]"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => deleteQuote(quote.id)}
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#8FA8BE] hover:text-[#5A6A7A]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Quote"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={saveQuote} className="space-y-6">
          {/* Project Link */}
          <div>
            <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Project (Optional)</label>
            <select
              value={projectId ?? ''}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors"
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Tax Rate */}
          <div>
            <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-24 px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest">Line Items</p>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors text-center"
                  />
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    placeholder="Rate £"
                    value={item.rate}
                    onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors"
                  />
                </div>
                <div className="w-20 text-sm text-[#8FA8BE] pt-2.5 text-right">
                  £{(Number(item.quantity) * Number(item.rate)).toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[#8FA8BE] hover:text-[#5A6A7A] text-sm pt-2.5 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="text-sm text-[#8FA8BE] hover:text-[#1B3A4C] underline underline-offset-2 transition-colors"
          >
            + Add line item
          </button>

          {/* Totals */}
          <div className="border-t border-[#E3E8ED] pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#8FA8BE]">Subtotal</span>
              <span className="text-[#1B3A4C] font-semibold">£{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8FA8BE]">Tax ({taxRate}%)</span>
              <span className="text-[#1B3A4C] font-semibold">£{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[#E3E8ED]">
              <span className="text-[#1B3A4C]">Total</span>
              <span className="text-[#1B3A4C]">£{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors"
            >
              Save Quote
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
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
            </div>

            <div className="bg-white border border-[#E3E8ED] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E3E8ED]">
                    <th className="px-4 py-2 text-left font-semibold text-[#1B3A4C]">Description</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">Rate</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8ED]">
                  {selectedQuote.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-[#1B3A4C]">{item.description}</td>
                      <td className="px-4 py-2 text-right text-[#8FA8BE]">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-[#8FA8BE]">£{item.rate.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">£{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[#8FA8BE] text-sm">Tax: {selectedQuote.taxRate}%</span>
              <span className="text-xl font-serif font-semibold text-[#1B3A4C]">
                Total: £{selectedQuote.total.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
