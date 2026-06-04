'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Receipt, Send, CheckCircle, Clock, Trash2, Eye, Download } from 'lucide-react'
import Modal from '@/components/Modal'

interface Invoice {
  id: number
  projectId: number | null
  invoiceNumber: string
  lineItems: { description: string; amount: number }[]
  subtotal: number
  taxRate: number
  total: number
  status: string
  dueDate: string | null
  createdAt: string
}

interface Project {
  id: number
  title: string
}

const STATUS_OPTIONS = ['all', 'draft', 'sent', 'paid', 'overdue']

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <Clock size={14} />,
  sent: <Send size={14} />,
  paid: <CheckCircle size={14} />,
  overdue: <Clock size={14} />,
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Form state
  const [items, setItems] = useState([{ description: '', amount: 0 }])
  const [projectId, setProjectId] = useState<number | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [taxRate, setTaxRate] = useState(20)

  useEffect(() => {
    fetchInvoices()
    fetchProjects()
  }, [statusFilter, search])

  async function fetchInvoices() {
    setLoading(true)
    try {
      let url = '/api/invoices'
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (search) params.append('search', search)
      if (params.toString()) url += '?' + params.toString()

      const res = await fetch(url)
      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
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
    total: invoices.length,
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
    totalValue: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
    outstanding: invoices
      .filter((i) => ['draft', 'sent', 'overdue'].includes(i.status))
      .reduce((sum, i) => sum + (i.total || 0), 0),
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    if (search) {
      const term = search.toLowerCase()
      return (
        inv.invoiceNumber.toLowerCase().includes(term) ||
        inv.lineItems.some((i) => i.description.toLowerCase().includes(term))
      )
    }
    return true
  })

  async function saveInvoice(e: React.FormEvent) {
    e.preventDefault()
    const lineItems = items.map((i) => ({
      description: i.description,
      amount: Number(i.amount),
    }))
    const subtotal = lineItems.reduce((s, i) => s + i.amount, 0)
    const tax = subtotal * (taxRate / 100)

    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems,
          subtotal,
          taxRate,
          total: subtotal + tax,
          status: 'draft',
          projectId: projectId || undefined,
          dueDate: dueDate || undefined,
        }),
      })
      setItems([{ description: '', amount: 0 }])
      setProjectId(null)
      setDueDate('')
      setTaxRate(20)
      setIsModalOpen(false)
      fetchInvoices()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchInvoices()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  async function deleteInvoice(id: number) {
    if (!confirm('Delete this invoice?')) return
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    fetchInvoices()
  }

  function addItem() {
    setItems([...items, { description: '', amount: 0 }])
  }

  function updateItem(idx: number, field: string, value: string | number) {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    setItems(updated)
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx))
  }

  const subtotal = items.reduce((s, i) => s + Number(i.amount), 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#1B3A4C]"></div>
          <p className="text-xs uppercase tracking-widest text-[#8FA8BE] font-medium">Invoice Management</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1B3A4C] tracking-tight">Invoices</h1>
            <p className="text-sm text-[#8FA8BE] mt-1">Create, send and track payments.</p>
          </div>
          <button
            onClick={() => {
              setItems([{ description: '', amount: 0 }])
              setProjectId(null)
              setDueDate('')
              setTaxRate(20)
              setIsModalOpen(true)
            }}
            className="px-5 py-2.5 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-[#2a4a5c] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E3E8ED] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1B3A4C] text-white rounded-lg"><Receipt size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#1B3A4C]">{loading ? '–' : stats.total}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Total Invoices</p>
        </div>
        <div className="bg-white border border-[#E3E8ED] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#8FA8BE] text-white rounded-lg"><Send size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#8FA8BE]">{loading ? '–' : stats.sent}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Sent</p>
        </div>
        <div className="bg-white border border-[#E3E8ED] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#6B8FAB] text-white rounded-lg"><CheckCircle size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#6B8FAB]">{loading ? '–' : stats.paid}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Paid</p>
        </div>
        <div className="bg-white border border-[#E3E8ED] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#5B7A8E] text-white rounded-lg"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#5B7A8E]">
            {loading ? '–' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats.outstanding)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Outstanding</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E3E8ED] rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#1B3A4C] mb-3">Search Invoices</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#E3E8ED]"><Search className="w-4 h-4 text-[#8FA8BE]" /></div>
              <input type="text" placeholder="Search by number or description..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#E3E8ED] text-[#1B3A4C] placeholder-[#A3B5C4] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#1B3A4C] mb-3">Filter by Status</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#E3E8ED]"><Filter className="w-4 h-4 text-[#8FA8BE]" /></div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#E3E8ED] text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors rounded-lg appearance-none"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Invoices' : STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[#8FA8BE] text-center py-8">Loading...</p>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white border border-[#E3E8ED] rounded-xl p-8 text-center">
          <p className="text-[#8FA8BE]">No invoices found. Create your first invoice above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E3E8ED] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E3E8ED]">
                  {['Invoice #', 'Status', 'Due Date', 'Subtotal', 'Total', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8FAFB] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#1B3A4C]">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <select
                        value={inv.status}
                        onChange={(e) => updateStatus(inv.id, e.target.value)}
                        className="text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border-none cursor-pointer bg-[#E3E8ED] text-[#1B3A4C]"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[#8FA8BE]">{inv.dueDate || '—'}</td>
                    <td className="px-4 py-3 text-[#8FA8BE]">£{inv.subtotal.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#1B3A4C] font-semibold">£{inv.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedInvoice(inv); setIsViewOpen(true) }}
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#8FA8BE] hover:text-[#1B3A4C]">
                          <Eye size={16} />
                        </button>
                        <a href={`/api/invoices/${inv.id}/pdf`} download
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#8FA8BE] hover:text-[#1B3A4C] inline-flex">
                          <Download size={16} />
                        </a>
                        <button onClick={() => deleteInvoice(inv.id)}
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#8FA8BE] hover:text-[#5A6A7A]">
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

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Invoice" maxWidth="max-w-4xl">
        <form onSubmit={saveInvoice} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Project (Optional)</label>
              <select value={projectId ?? ''} onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              >
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Tax Rate (%)</label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-24 px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest">Line Items</p>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
                </div>
                <div className="w-32">
                  <input type="number" placeholder="Amount £" value={item.amount} onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
                </div>
                <button type="button" onClick={() => removeItem(idx)} className="text-[#8FA8BE] hover:text-[#5A6A7A] text-sm pt-2.5 px-2">×</button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addItem}
            className="text-sm text-[#8FA8BE] hover:text-[#1B3A4C] underline underline-offset-2">+ Add line item</button>

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
            <button type="submit"
              className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors">Save Invoice</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Invoice ${selectedInvoice?.invoiceNumber}`} maxWidth="max-w-2xl">
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#E3E8ED] text-[#1B3A4C]">
                {STATUS_ICONS[selectedInvoice.status]}
                {STATUS_LABELS[selectedInvoice.status] || selectedInvoice.status}
              </span>
              <span className="text-sm text-[#8FA8BE]">Due: {selectedInvoice.dueDate || '—'}</span>
            </div>
            <div className="bg-white border border-[#E3E8ED] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E3E8ED]">
                    <th className="px-4 py-2 text-left font-semibold text-[#1B3A4C]">Description</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8ED]">
                  {selectedInvoice.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-[#1B3A4C]">{item.description}</td>
                      <td className="px-4 py-2 text-right font-semibold text-[#1B3A4C]">£{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[#8FA8BE] text-sm">Tax: {selectedInvoice.taxRate}%</span>
              <span className="text-xl font-serif font-semibold text-[#1B3A4C]">Total: £{selectedInvoice.total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
