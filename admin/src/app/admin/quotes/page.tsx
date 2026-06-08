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
              setItems([{ description: '', quantity: 1, rate: 0 }])
              setProjectId(null)
              setTaxRate(20)
              setPaymentTerms('net-30')
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
            {loading ? '–' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats.totalValue)}
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
                placeholder="Search by description or ID..."
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
                  {['Quote #', 'Project', 'Status', 'Items', 'Total', 'Terms', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#6B8FAB]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {filteredQuotes.map((quote) => {
                  const proj = projects.find(p => p.id === quote.projectId)
                  const clientName = proj?.clientId ? getClientName(proj.clientId) : ''
                  return (
                    <tr key={quote.id} className="hover:bg-[#F8FAFB] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1B3A4C]">#{quote.id}</td>
                      <td className="px-4 py-3 text-[#5B7A8E]">
                        {proj ? (clientName ? `${proj.title} — ${clientName}` : proj.title) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#E3E8ED] text-[#1B3A4C]">
                          {STATUS_ICONS[quote.status] || <Clock size={14} />}
                          {STATUS_LABELS[quote.status] || quote.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#5B7A8E]">{quote.lineItems.length} items</td>
                      <td className="px-4 py-3 text-[#1B3A4C] font-semibold">£{quote.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#5B7A8E] text-xs">{PAYMENT_TERMS[quote.paymentTerms || 'net-30'] || quote.paymentTerms || 'Net 30'}</td>
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
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Project (Optional)</label>
              <select
                value={projectId ?? ''}
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
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
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              >
                {Object.entries(PAYMENT_TERMS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-24 px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px]">Line Items</p>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] text-center"
                  />
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    placeholder="Rate £"
                    value={item.rate}
                    onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
                  />
                </div>
                <div className="w-20 text-sm text-[#5B7A8E] pt-2.5 text-right">
                  £{(Number(item.quantity) * Number(item.rate)).toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[#A3B5C4] hover:text-red-500 text-sm pt-2.5 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="text-sm text-[#1B3A4C] hover:underline underline-offset-2 font-semibold"
          >
            + Add line item
          </button>

          {/* Totals */}
          <div className="border-t border-[#A3B5C4]/30 pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#5B7A8E]">Subtotal</span>
              <span className="text-[#1B3A4C] font-semibold">£{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#5B7A8E]">Tax ({taxRate}%)</span>
              <span className="text-[#1B3A4C] font-semibold">£{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[#A3B5C4]/30">
              <span className="text-[#111]">Total</span>
              <span className="text-[#111]">£{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#E3E8ED] text-[#1B3A4C]">
                {STATUS_ICONS[selectedQuote.status]}
                {STATUS_LABELS[selectedQuote.status] || selectedQuote.status}
              </span>
              {selectedQuote.paymentTerms && (
                <span className="text-xs text-[#5B7A8E] bg-white border border-[#A3B5C4]/30 px-2 py-1 rounded">
                  {PAYMENT_TERMS[selectedQuote.paymentTerms] || selectedQuote.paymentTerms}
                </span>
              )}
            </div>

            {/* Line items table */}
            <div className="bg-white border border-[#A3B5C4]/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#A3B5C4]/30">
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
                      <td className="px-4 py-2 text-right text-[#5B7A8E]">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-[#5B7A8E]">£{item.rate.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">£{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[#5B7A8E] text-sm">Tax: {selectedQuote.taxRate}%</span>
              <span className="text-xl font-black text-[#111] tracking-[-1px]">
                Total: £{selectedQuote.total.toLocaleString()}
              </span>
            </div>

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
