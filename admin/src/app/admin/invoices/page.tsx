'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Receipt, Send, CheckCircle, Clock, Trash2, Eye, Download, RotateCcw, DollarSign, Loader2 } from 'lucide-react'
import Modal from '@/components/Modal'
import InvoiceForm from '@/components/InvoiceForm'

interface Invoice {
  id: number
  projectId: number | null
  invoiceNumber: string
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
  dueDate: string | null
  paidAt: string | null
  paymentTermsType: string | null
  paymentTermsLabel: string | null
  paymentMethod: string | null
  notes: string | null
  createdAt: string
  paymentToken: string | null
}

interface Project {
  id: number
  title: string
  clientId: number | null
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
  const [sendingId, setSendingId] = useState<number | null>(null)

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
        (inv.clientName && inv.clientName.toLowerCase().includes(term)) ||
        (inv.projectTitle && inv.projectTitle.toLowerCase().includes(term)) ||
        inv.lineItems.some((i) => (i.serviceName || i.description || '').toLowerCase().includes(term))
      )
    }
    return true
  })

  async function updateInvoiceStatus(id: number, status: string) {
    const body: Record<string, string | null> = { status }
    if (status === 'paid') body.paidAt = new Date().toISOString()
    if (status !== 'paid') body.paidAt = null

    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      fetchInvoices()
      const res = await fetch(`/api/invoices/${id}`)
      const data = await res.json()
      if (data.invoice) setSelectedInvoice(data.invoice)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  async function sendInvoice(id: number) {
    if (!confirm('Send this invoice via email to the client?')) return
    setSendingId(id)
    try {
      const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to send invoice')
      } else {
        alert('Invoice sent successfully')
      }
      fetchInvoices()
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice({ ...selectedInvoice, status: 'sent' })
      }
    } catch (err) {
      console.error('Send failed:', err)
      alert('Failed to send invoice')
    } finally {
      setSendingId(null)
    }
  }

  async function deleteInvoice(id: number) {
    if (!confirm('Delete this invoice?')) return
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    fetchInvoices()
  }

  function openView(invoice: Invoice) {
    setSelectedInvoice(invoice)
    setIsViewOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#8b7ab4] tracking-[3px] uppercase font-semibold mb-4">Invoice Management</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Invoices</h1>
            <p className="text-sm text-[#7a6a9e] mt-4 font-semibold uppercase tracking-[0.5px]">Create, send and track payments.</p>
          </div>
          <button
            onClick={() => {
              setSelectedInvoice(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#0f0518] hover:text-white transition"
          >
            <Plus size={16} />
            New Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-[#8b7ab4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d1b4e] text-white rounded-lg"><Receipt size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">{loading ? '–' : stats.total}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8b7ab4] font-medium mt-2">Total Invoices</p>
        </div>
        <div className="bg-white border border-[#8b7ab4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d1b4e] text-white rounded-lg"><Send size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#2d1b4e] leading-none tracking-[-1px]">{loading ? '–' : stats.sent}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8b7ab4] font-medium mt-2">Sent</p>
        </div>
        <div className="bg-white border border-[#8b7ab4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d6a2d] text-white rounded-lg"><CheckCircle size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#2d6a2d] leading-none tracking-[-1px]">{loading ? '–' : stats.paid}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8b7ab4] font-medium mt-2">Paid</p>
        </div>
        <div className="bg-white border border-[#8b7ab4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#8b7ab4] text-white rounded-lg"><DollarSign size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#8b7ab4] leading-none tracking-[-1px]">
            {loading
              ? '–'
              : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
                  stats.outstanding
                )}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8b7ab4] font-medium mt-2">Outstanding</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#8b7ab4]/30 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[3px] font-semibold text-[#8b7ab4] mb-3">Search Invoices</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#8b7ab4]/30">
                <Search className="w-4 h-4 text-[#8b7ab4]" />
              </div>
              <input
                type="text"
                placeholder="Search by number, client, or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#8b7ab4]/30 text-[#2d1b4e] placeholder-[#8b7ab4] text-sm focus:outline-none focus:border-[#2d1b4e] transition-colors rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[3px] font-semibold text-[#8b7ab4] mb-3">Filter by Status</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#8b7ab4]/30">
                <Filter className="w-4 h-4 text-[#8b7ab4]" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#8b7ab4]/30 text-[#2d1b4e] text-sm focus:outline-none focus:border-[#2d1b4e] transition-colors rounded-lg appearance-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'all' ? 'All Invoices' : STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[#8b7ab4] text-center py-8">Loading...</p>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white border border-[#8b7ab4]/30 p-8 text-center">
          <p className="text-[#8b7ab4]">No invoices found. Create your first invoice above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#8b7ab4]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#8b7ab4]/30">
                  {['Invoice #', 'Client', 'Project', 'Status', 'Due Date', 'Total', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8b7ab4]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a0a2e]">
                {filteredInvoices.map((inv) => {
                  const proj = projects.find((p) => p.id === inv.projectId)
                  return (
                    <tr key={inv.id} className="hover:bg-[#F8FAFB] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#2d1b4e]">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-[#7a6a9e]">
                        {inv.clientName || '—'}
                        {inv.clientCompany && (
                          <div className="text-xs text-[#8b7ab4]">{inv.clientCompany}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#7a6a9e]">{inv.projectTitle || proj?.title || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            inv.status === 'paid'
                              ? 'bg-[#2d6a2d]/10 text-[#2d6a2d]'
                              : inv.status === 'overdue'
                                ? 'bg-red-50 text-red-600'
                                : inv.status === 'sent'
                                  ? 'bg-[#2d1b4e]/10 text-[#2d1b4e]'
                                  : 'bg-[#1a0a2e] text-[#7a6a9e]'
                          }`}
                        >
                          {STATUS_ICONS[inv.status]}
                          {STATUS_LABELS[inv.status] || inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#7a6a9e]">{inv.dueDate || '—'}</td>
                      <td className="px-4 py-3 text-[#2d1b4e] font-semibold">£{inv.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openView(inv)}
                            className="p-1.5 hover:bg-[#1a0a2e] rounded-lg transition-colors text-[#8b7ab4] hover:text-[#2d1b4e]"
                          >
                            <Eye size={16} />
                          </button>
                          {inv.status === 'draft' && (
                            <button
                              onClick={() => sendInvoice(inv.id)}
                              disabled={sendingId === inv.id}
                              className="p-1.5 hover:bg-[#1a0a2e] rounded-lg transition-colors text-[#8b7ab4] hover:text-[#2d1b4e] disabled:opacity-50"
                            >
                              {sendingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                          )}
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            download
                            className="p-1.5 hover:bg-[#1a0a2e] rounded-lg transition-colors text-[#8b7ab4] hover:text-[#2d1b4e] inline-flex"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => deleteInvoice(inv.id)}
                            className="p-1.5 hover:bg-[#1a0a2e] rounded-lg transition-colors text-[#8b7ab4] hover:text-red-500"
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
        title={selectedInvoice ? `Edit Invoice ${selectedInvoice.invoiceNumber}` : 'New Invoice'}
        maxWidth="max-w-4xl"
      >
        <InvoiceForm
          invoice={selectedInvoice}
          projects={projects}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchInvoices()
            setIsModalOpen(false)
          }}
        />
      </Modal>

      {/* View Modal with Payment Confirmation */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Invoice ${selectedInvoice?.invoiceNumber}`}
        maxWidth="max-w-2xl"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                    selectedInvoice.status === 'paid'
                      ? 'bg-[#2d6a2d]/10 text-[#2d6a2d]'
                      : selectedInvoice.status === 'overdue'
                        ? 'bg-red-50 text-red-600'
                        : selectedInvoice.status === 'sent'
                          ? 'bg-[#2d1b4e]/10 text-[#2d1b4e]'
                          : 'bg-[#1a0a2e] text-[#7a6a9e]'
                  }`}
                >
                  {STATUS_ICONS[selectedInvoice.status]}
                  {STATUS_LABELS[selectedInvoice.status] || selectedInvoice.status}
                </span>
                {selectedInvoice.paidAt && (
                  <span className="text-xs text-[#2d6a2d]">
                    Paid on{' '}
                    {new Date(selectedInvoice.paidAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <span className="text-sm text-[#7a6a9e]">Due: {selectedInvoice.dueDate || '—'}</span>
            </div>

            {/* Client info */}
            {(selectedInvoice.clientName || selectedInvoice.projectTitle) && (
              <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#1a0a2e] space-y-1">
                {selectedInvoice.clientName && (
                  <div className="text-sm text-[#2d1b4e] font-semibold">{selectedInvoice.clientName}</div>
                )}
                {selectedInvoice.clientCompany && (
                  <div className="text-xs text-[#7a6a9e]">{selectedInvoice.clientCompany}</div>
                )}
                {selectedInvoice.clientEmail && (
                  <div className="text-xs text-[#8b7ab4]">{selectedInvoice.clientEmail}</div>
                )}
                {selectedInvoice.projectTitle && (
                  <div className="text-xs text-[#7a6a9e] pt-1 border-t border-[#1a0a2e] mt-1">{selectedInvoice.projectTitle}</div>
                )}
              </div>
            )}

            <div className="bg-white border border-[#8b7ab4]/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#8b7ab4]/30">
                    <th className="px-4 py-2 text-left font-semibold text-[#2d1b4e]">Service</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#2d1b4e]">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#2d1b4e]">Price</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#2d1b4e]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a0a2e]">
                  {selectedInvoice.lineItems.map((item, idx) => {
                    const isOldFormat = !!item.description
                    const name = isOldFormat ? item.description : item.serviceName
                    const category = item.serviceCategory
                    const qty = isOldFormat ? item.quantity : (item.quantity || 1)
                    const rate = isOldFormat ? item.rate : item.price
                    const amount = isOldFormat ? item.amount : ((item.price || 0) * (item.quantity || 1))
                    return (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-[#2d1b4e]">
                        <div className="font-medium">{name}</div>
                        {category && (
                          <div className="text-xs text-[#8b7ab4]">{category}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-[#7a6a9e]">{qty}</td>
                      <td className="px-4 py-2 text-right text-[#7a6a9e]">£{Number(rate).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-semibold text-[#2d1b4e]">
                        £{Number(amount).toLocaleString()}
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[#7a6a9e] text-sm">Tax: {selectedInvoice.taxRate}%</span>
              <span className="text-xl font-black text-[#111] tracking-[-1px]">
                Total: £{selectedInvoice.total.toLocaleString()}
              </span>
            </div>

            {/* Notes */}
            {selectedInvoice.notes && (
              <div className="bg-[#F8FAFB] p-4 rounded-lg border border-[#1a0a2e]">
                <p className="text-xs font-semibold text-[#8b7ab4] uppercase tracking-[3px] mb-2">Notes</p>
                <p className="text-sm text-[#7a6a9e] whitespace-pre-wrap">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Status Workflow Buttons */}
            <div className="border-t border-[#8b7ab4]/30 pt-4">
              <p className="text-xs font-semibold text-[#8b7ab4] uppercase tracking-[3px] mb-3">Actions</p>
              <div className="flex flex-wrap gap-2">
                {selectedInvoice.status === 'draft' && (
                  <button
                    onClick={() => sendInvoice(selectedInvoice.id)}
                    disabled={sendingId === selectedInvoice.id}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#2d1b4e] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#2d1b4e] hover:bg-[#2d1b4e] hover:text-white transition disabled:opacity-50"
                  >
                    {sendingId === selectedInvoice.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Send Invoice
                  </button>
                )}
                {selectedInvoice.status === 'sent' && (
                  <>
                    <button
                      onClick={() => updateInvoiceStatus(selectedInvoice.id, 'paid')}
                      className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#2d6a2d] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#2d6a2d] hover:bg-[#2d6a2d] hover:text-white transition"
                    >
                      <CheckCircle size={14} />
                      Mark as Paid
                    </button>
                    <button
                      onClick={() => updateInvoiceStatus(selectedInvoice.id, 'overdue')}
                      className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-300 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-red-600 hover:bg-red-50 transition"
                    >
                      <Clock size={14} />
                      Mark Overdue
                    </button>
                  </>
                )}
                {selectedInvoice.status === 'paid' && (
                  <button
                    onClick={() => updateInvoiceStatus(selectedInvoice.id, 'sent')}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#8b7ab4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#2d1b4e] hover:border-[#111] hover:text-[#111] transition"
                  >
                    <RotateCcw size={14} />
                    Mark Unpaid
                  </button>
                )}
                {selectedInvoice.status === 'overdue' && (
                  <>
                    <button
                      onClick={() => updateInvoiceStatus(selectedInvoice.id, 'paid')}
                      className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#2d6a2d] rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#2d6a2d] hover:bg-[#2d6a2d] hover:text-white transition"
                    >
                      <CheckCircle size={14} />
                      Mark as Paid
                    </button>
                    <button
                      onClick={() => updateInvoiceStatus(selectedInvoice.id, 'draft')}
                      className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#8b7ab4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#2d1b4e] hover:border-[#111] hover:text-[#111] transition"
                    >
                      <RotateCcw size={14} />
                      Reopen as Draft
                    </button>
                  </>
                )}
                <a
                  href={`/api/invoices/${selectedInvoice.id}/pdf`}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#8b7ab4]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#2d1b4e] hover:border-[#111] hover:text-[#111] transition"
                >
                  <Download size={14} />
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
