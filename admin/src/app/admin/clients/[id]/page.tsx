'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Mail,
  FileText,
  Receipt,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface Client {
  id: number
  name: string
  email: string | null
  phone: string | null
  instagram: string | null
  notes: string | null
  totalBookings: number | null
  totalRevenue: number | null
  createdAt: string
}

interface Quote {
  id: number
  quoteNumber: string | null
  projectTitle: string | null
  total: number
  status: string
  sentAt: string | null
}

interface Invoice {
  id: number
  invoiceNumber: string | null
  projectTitle: string | null
  total: number
  status: string
  sentAt: string | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0)
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Client>>({})

  useEffect(() => {
    if (!id) return
    fetchClient()
  }, [id])

  async function fetchClient() {
    setLoading(true)
    try {
      const res = await fetch(`/api/clients/${id}/history`)
      if (!res.ok) {
        router.push('/admin/clients')
        return
      }
      const data = await res.json()
      setClient(data.client)
      setQuotes(data.quotes || [])
      setInvoices(data.invoices || [])
      setForm(data.client)
    } catch {
      router.push('/admin/clients')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!client || !form) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setClient(data.client)
        setIsEditing(false)
      }
    } catch {
      alert('Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <Loader2 size={32} className="animate-spin mx-auto text-[#6B8FAB] mb-4" />
        <p className="text-[#6B8FAB] text-sm">Loading client...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <AlertCircle size={32} className="mx-auto text-red-400 mb-4" />
        <p className="text-[#5B7A8E] text-sm">Client not found.</p>
      </div>
    )
  }

  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-50 text-blue-700',
    accepted: 'bg-green-50 text-green-700',
    declined: 'bg-red-50 text-red-700',
    paid: 'bg-green-50 text-green-700',
    pending: 'bg-yellow-50 text-yellow-700',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Back Link */}
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-2 text-sm text-[#1B3A4C] hover:text-[#111] transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Clients</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-px bg-[#A3B5C4]" />
            <p className="text-xs uppercase tracking-widest text-[#5B7A8E]">Client Details</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-[#111] mb-2">{client.name}</h1>
          <p className="text-sm text-[#5B7A8E]">
            Added {new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-[#1B3A4C] text-white hover:bg-[#0f1923]"
              >
                <Save size={14} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={() => {
                  setForm(client)
                  setIsEditing(false)
                }}
                className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-white border border-[#A3B5C4] text-[#111] hover:border-[#1B3A4C]"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 bg-white border border-[#A3B5C4] text-[#111] hover:border-[#1B3A4C]"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E3E8ED] p-6 text-center">
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">
            {quotes.length}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Quotes</p>
        </div>
        <div className="bg-white border border-[#E3E8ED] p-6 text-center">
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">
            {invoices.length}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Invoices</p>
        </div>
        <div className="bg-white border border-[#E3E8ED] p-6 text-center">
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">
            {client.totalRevenue ? formatCurrency(client.totalRevenue) : '—'}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Revenue</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="bg-white border border-[#E3E8ED] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-[#1B3A4C] text-white">
            <Mail size={16} />
          </div>
          <h3 className="text-lg font-light text-[#111]">Contact Information</h3>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Name</label>
              <input
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E3E8ED] text-[#111] text-sm focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E3E8ED] text-[#111] text-sm focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Phone</label>
              <input
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E3E8ED] text-[#111] text-sm focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Instagram</label>
              <input
                value={form.instagram || ''}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E3E8ED] text-[#111] text-sm focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Notes</label>
              <textarea
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-[#E3E8ED] text-[#111] text-sm focus:outline-none focus:border-[#1B3A4C] resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Email</p>
              <p className="text-base text-[#111]">{client.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Phone</p>
              <p className="text-base text-[#111]">{client.phone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Instagram</p>
              <p className="text-base text-[#111]">{client.instagram || '—'}</p>
            </div>
            {client.notes && (
              <div className="md:col-span-2">
                <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-1">Notes</p>
                <p className="text-sm text-[#5B7A8E] whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quotes */}
      <div className="bg-white border border-[#E3E8ED] overflow-hidden">
        <div className="p-6 border-b border-[#E3E8ED]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1B3A4C] text-white">
              <FileText size={16} />
            </div>
            <h3 className="text-lg font-light text-[#111]">Quotes</h3>
            <span className="ml-2 text-xs px-2.5 py-1 rounded-full bg-[#1B3A4C1a] text-[#1B3A4C] font-medium">
              {quotes.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {quotes.length === 0 ? (
            <p className="p-6 text-sm text-[#6B8FAB]">No quotes yet.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F8FAFB] border-b border-[#E3E8ED]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Quote</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Project</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#111] uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-[#F8FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/quotes/${q.id}`} className="text-sm font-medium text-[#1B3A4C] hover:underline">
                        {q.quoteNumber || `QT-${String(q.id).padStart(3, '0')}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5B7A8E]">{q.projectTitle || '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111] text-right">{formatCurrency(q.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[q.status] || 'bg-gray-100 text-gray-600'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5B7A8E]">
                      {q.sentAt ? new Date(q.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white border border-[#E3E8ED] overflow-hidden">
        <div className="p-6 border-b border-[#E3E8ED]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1B3A4C] text-white">
              <Receipt size={16} />
            </div>
            <h3 className="text-lg font-light text-[#111]">Invoices</h3>
            <span className="ml-2 text-xs px-2.5 py-1 rounded-full bg-[#1B3A4C1a] text-[#1B3A4C] font-medium">
              {invoices.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <p className="p-6 text-sm text-[#6B8FAB]">No invoices yet.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F8FAFB] border-b border-[#E3E8ED]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Project</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#111] uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#111] uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/invoices/${inv.id}`} className="text-sm font-medium text-[#1B3A4C] hover:underline">
                        {inv.invoiceNumber || `INV-${String(inv.id).padStart(3, '0')}`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5B7A8E]">{inv.projectTitle || '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111] text-right">{formatCurrency(inv.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#5B7A8E]">
                      {inv.sentAt ? new Date(inv.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
