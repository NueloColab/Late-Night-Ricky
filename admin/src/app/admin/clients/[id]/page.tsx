'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  FileText,
  Receipt,
  FolderOpen,
  DollarSign,
  Trash2,
  Save,
} from 'lucide-react'

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  lead: { bg: 'bg-[#5c7a94]/10', text: 'text-[#5c7a94]', border: 'border-[#5c7a94]/30' },
  active: { bg: 'bg-[#91715c]/10', text: 'text-[#91715c]', border: 'border-[#91715c]/30' },
  completed: { bg: 'bg-[#2d6a2d]/10', text: 'text-[#2d6a2d]', border: 'border-[#2d6a2d]/30' },
  inactive: { bg: 'bg-[#f8f7f6]', text: 'text-[#999]', border: 'border-[#e5e5e5]' },
}

const QUOTE_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-[#f8f7f6]', text: 'text-[#666]' },
  sent: { bg: 'bg-[#5c7a94]/10', text: 'text-[#5c7a94]' },
  accepted: { bg: 'bg-[#91715c]/10', text: 'text-[#91715c]' },
  declined: { bg: 'bg-[#c4632e]/10', text: 'text-[#c4632e]' },
}

const INVOICE_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-[#f8f7f6]', text: 'text-[#666]' },
  sent: { bg: 'bg-[#5c7a94]/10', text: 'text-[#5c7a94]' },
  paid: { bg: 'bg-[#2d6a2d]/10', text: 'text-[#2d6a2d]' },
  overdue: { bg: 'bg-[#c4632e]/10', text: 'text-[#c4632e]' },
}

const fmt = (n: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n)

interface ClientData {
  id: number
  name: string
  email: string | null
  phone: string | null
  instagram: string | null
  totalBookings: number | null
  totalRevenue: number | null
  createdAt: string
}

interface QuoteData {
  id: number
  lineItems: { description: string; quantity: number; rate: number; amount: number }[]
  subtotal: number
  taxRate: number
  total: number
  status: string
  createdAt: string
}

interface InvoiceData {
  id: number
  invoiceNumber: string
  lineItems: any
  subtotal: number
  taxRate: number
  total: number
  status: string
  dueDate: string | null
  createdAt: string
}

interface ProjectData {
  id: number
  title: string
  type: string
  status: string
  venue: string | null
  eventDate: string | null
  fee: number | null
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [quotes, setQuotes] = useState<QuoteData[]>([])
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', instagram: '', notes: '',
  })

  useEffect(() => {
    if (params.id) fetchClientDetail()
  }, [params.id])

  async function fetchClientDetail() {
    setLoading(true)
    try {
      const [clientRes, quotesRes, invoicesRes, projectsRes] = await Promise.all([
        fetch(`/api/clients/${params.id}`),
        fetch(`/api/quotes?clientId=${params.id}`),
        fetch(`/api/invoices?clientId=${params.id}`),
        fetch(`/api/projects?clientId=${params.id}`),
      ])
      const clientData = await clientRes.json()
      const quotesData = await quotesRes.json()
      const invoicesData = await invoicesRes.json()
      const projectsData = await projectsRes.json()

      setClient(clientData.client || clientData)
      setQuotes(quotesData.quotes || [])
      setInvoices(invoicesData.invoices || [])
      setProjects(projectsData.projects || [])
      if (clientData.client || clientData) {
        const c = clientData.client || clientData
        setFormData({
          name: c.name || '',
          email: c.email || '',
          phone: c.phone || '',
          instagram: c.instagram || '',
          notes: '',
        })
      }
    } catch (err) {
      console.error('Failed to load client:', err)
    }
    setLoading(false)
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault()
    if (!client) return
    setSaving(true)
    try {
      await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setEditing(false)
      fetchClientDetail()
    } catch (err) {
      console.error('Save failed:', err)
    }
    setSaving(false)
  }

  async function deleteClient() {
    if (!client || !confirm('Delete this client and all their data?')) return
    try {
      await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
      router.push('/admin/clients')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-black mx-auto mb-4" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="text-sm uppercase tracking-widest text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-[#666]">Client not found.</p>
        <Link href="/admin/clients" className="text-[#5c7a94] hover:underline mt-2 inline-block">Back to Clients</Link>
      </div>
    )
  }

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-[#5c7a94] hover:text-[#91715c] transition-colors mb-4">
          <ArrowLeft size={16} />
          Back to Clients
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-px bg-[#91715c]"></div>
              <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Client Profile</p>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-[#1a1a1a]">{client.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit3 size={14} />
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={deleteClient}
              className="px-4 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <form onSubmit={saveClient} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8 space-y-5">
          <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
            <div className="w-12 h-px bg-[#91715c]"></div>
            <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Edit Client</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Instagram</label>
              <input type="text" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-6 py-3 bg-[#5c7a94] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity flex items-center gap-2">
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1a1a1a] text-white rounded-lg"><DollarSign size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#1a1a1a]">{fmt(totalRevenue)}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Revenue</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#91715c] text-white rounded-lg"><FileText size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#91715c]">{quotes.length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Quotes</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#5c7a94] text-white rounded-lg"><Receipt size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#5c7a94]">{invoices.length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Invoices</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#5c7a94]/60 text-white rounded-lg"><FolderOpen size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#5c7a94]">{projects.length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium">Projects</p>
        </div>
      </div>

      {/* Contact Info + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Contact Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-serif font-light text-[#1a1a1a] mb-4">Contact</h3>
          <div className="space-y-3">
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-3 text-sm text-[#1a1a1a] hover:text-[#5c7a94] transition-colors">
                <Mail size={16} className="text-[#5c7a94]" />
                {client.email}
              </a>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 text-sm text-[#1a1a1a]">
                <Phone size={16} className="text-[#5c7a94]" />
                {client.phone}
              </div>
            )}
            {client.instagram && (
              <div className="flex items-center gap-3 text-sm text-[#1a1a1a]">
                <span className="text-[#5c7a94] text-xs font-bold w-4 text-center">@</span>
                {client.instagram}
              </div>
            )}
            {!client.email && !client.phone && !client.instagram && (
              <p className="text-sm text-[#999]">No contact info</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-[#999] uppercase tracking-wider">Client since</p>
            <p className="text-sm text-[#1a1a1a]">{new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-serif font-light text-[#1a1a1a] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {quotes.slice(0, 3).map(q => {
              const style = QUOTE_STATUS_STYLES[q.status] || QUOTE_STATUS_STYLES.draft
              return (
                <Link key={q.id} href="/admin/quotes" className="flex items-center gap-3 p-3 rounded-md bg-[#f8f7f6] hover:bg-[#f0efed] transition group">
                  <FileText size={16} className="text-[#5c7a94]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">Quote #{q.id}</p>
                    <p className="text-xs text-[#666]">{fmt(q.total)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}>
                    {q.status}
                  </span>
                </Link>
              )
            })}
            {invoices.slice(0, 3).map(i => {
              const style = INVOICE_STATUS_STYLES[i.status] || INVOICE_STATUS_STYLES.draft
              return (
                <Link key={i.id} href="/admin/invoices" className="flex items-center gap-3 p-3 rounded-md bg-[#f8f7f6] hover:bg-[#f0efed] transition group">
                  <Receipt size={16} className="text-[#91715c]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{i.invoiceNumber}</p>
                    <p className="text-xs text-[#666]">{fmt(i.total)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}>
                    {i.status}
                  </span>
                </Link>
              )
            })}
            {quotes.length === 0 && invoices.length === 0 && (
              <p className="text-sm text-[#999] text-center py-4">No activity yet</p>
            )}
          </div>
          {(quotes.length > 3 || invoices.length > 3) && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4">
              {quotes.length > 3 && <Link href="/admin/quotes" className="text-xs text-[#5c7a94] hover:underline">View all quotes →</Link>}
              {invoices.length > 3 && <Link href="/admin/invoices" className="text-xs text-[#91715c] hover:underline">View all invoices →</Link>}
            </div>
          )}
        </div>
      </div>

      {/* Quotes Section */}
      {quotes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-light text-[#1a1a1a]">Quotes</h3>
            <Link href="/admin/quotes" className="text-xs text-[#5c7a94] hover:underline">View all →</Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">Quote</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">Status</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">Total</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.slice(0, 5).map(q => {
                  const style = QUOTE_STATUS_STYLES[q.status] || QUOTE_STATUS_STYLES.draft
                  return (
                    <tr key={q.id} className="hover:bg-[#f8f7f6] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1a1a1a]">#{q.id}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a] font-semibold">{fmt(q.total)}</td>
                      <td className="px-4 py-3 text-[#666]">{new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Section */}
      {invoices.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-light text-[#1a1a1a]">Invoices</h3>
            <Link href="/admin/invoices" className="text-xs text-[#91715c] hover:underline">View all →</Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">Invoice</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">Status</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">Total</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.slice(0, 5).map(i => {
                  const style = INVOICE_STATUS_STYLES[i.status] || INVOICE_STATUS_STYLES.draft
                  return (
                    <tr key={i.id} className="hover:bg-[#f8f7f6] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#1a1a1a]">{i.invoiceNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#1a1a1a] font-semibold">{fmt(i.total)}</td>
                      <td className="px-4 py-3 text-[#666]">{i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-light text-[#1a1a1a]">Projects</h3>
            <Link href="/admin/projects" className="text-xs text-[#5c7a94] hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 5).map(p => {
              const statusStyle = (() => {
                switch (p.status) {
                  case 'inquiry': return STATUS_STYLES.lead
                  case 'quoted': return STATUS_STYLES.sent || STATUS_STYLES.lead
                  case 'approved': return STATUS_STYLES.active
                  case 'in-progress': return STATUS_STYLES.active
                  case 'completed': return STATUS_STYLES.completed
                  case 'invoiced': return STATUS_STYLES.completed
                  case 'paid': return STATUS_STYLES.completed
                  default: return STATUS_STYLES.lead
                }
              })()
              return (
                <Link key={p.id} href={`/admin/projects/${p.id}`} className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{p.title}</p>
                      <p className="text-xs text-[#666]">{p.venue || 'No venue'} {p.fee ? `· £${Number(p.fee).toLocaleString()}` : ''}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text}`}>
                      {p.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}