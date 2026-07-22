'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Trash2, Eye, Phone, Mail, Globe, Pencil } from 'lucide-react'
import Modal from '@/components/Modal'

interface Client {
  id: number
  name: string
  email: string | null
  phone: string | null
  instagram: string | null
  totalBookings: number | null
  totalRevenue: number | null
  createdAt: string
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', instagram: '', notes: '' })

  useEffect(() => {
    fetchClients()
  }, [search])

  async function fetchClients() {
    setLoading(true)
    try {
      let url = '/api/clients'
      if (search) url += `?search=${encodeURIComponent(search)}`
      const res = await fetch(url)
      const data = await res.json()
      setClients(data.clients || [])
    } catch (err) {
      console.error('Failed to load clients', err)
    }
    setLoading(false)
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingId) {
        await fetch(`/api/clients/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      setForm({ name: '', email: '', phone: '', instagram: '', notes: '' })
      setEditingId(null)
      setShowForm(false)
      fetchClients()
    } catch (err) {
      console.error('Save failed', err)
    }
  }

  async function deleteClient(id: number) {
    if (!confirm('Delete this client?')) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    fetchClients()
  }

  function openEdit(client: Client) {
    setForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      instagram: client.instagram || '',
      notes: '',
    })
    setEditingId(client.id)
    setShowForm(true)
  }

  const filteredClients = clients.filter((c) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.instagram && c.instagram.toLowerCase().includes(term))
    )
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Client Management</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Clients</h1>
            <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Manage contacts, venues and partners.</p>
          </div>
          <button
            onClick={() => {
              setForm({ name: '', email: '', phone: '', instagram: '', notes: '' })
              setEditingId(null)
              setShowForm(true)
            }}
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition"
          >
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#6B8FAB]/30 p-6 mb-6">
        <label className="block text-xs uppercase tracking-[3px] font-semibold text-[#6B8FAB] mb-3">Search Clients</label>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#6B8FAB]/30">
            <Search className="w-4 h-4 text-[#6B8FAB]" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or Instagram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#6B8FAB]/30 text-[#1B3A4C] placeholder-[#6B8FAB] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[#6B8FAB] text-center py-8">Loading...</p>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white border border-[#6B8FAB]/30 p-8 text-center">
          <p className="text-[#6B8FAB]">No clients found. Add your first client above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#6B8FAB]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#6B8FAB]/30">
                  {['Name', 'Contact', 'Bookings', 'Revenue', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#6B8FAB]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#F8FAFB] transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1B3A4C]">{client.name}</div>
                      <div className="text-xs text-[#6B8FAB] mt-0.5">Added {new Date(client.createdAt).toLocaleDateString('en-GB')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-xs text-[#a0a0a0]">
                            <Mail size={12} /> {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-[#a0a0a0]">
                            <Phone size={12} /> {client.phone}
                          </div>
                        )}
                        {client.instagram && (
                          <div className="flex items-center gap-1.5 text-xs text-[#a0a0a0]">
                            <Globe size={12} /> {client.instagram}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#1B3A4C] font-semibold">{client.totalBookings || 0}</td>
                    <td className="px-4 py-3 text-[#1B3A4C] font-semibold">
                      {client.totalRevenue ? `£${Number(client.totalRevenue).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/admin/clients/${client.id}`)
                          }}
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#6B8FAB] hover:text-[#1B3A4C]"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(client)
                          }}
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#6B8FAB] hover:text-[#1B3A4C]"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteClient(client.id)
                          }}
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#6B8FAB] hover:text-red-500"
                          title="Delete"
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

      {/* Add Client Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingId(null); }} title={editingId ? 'Edit Client' : 'Add Client'} maxWidth="max-w-lg">
        <form onSubmit={saveClient} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Instagram</label>
            <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-5 py-2.5 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition">Cancel</button>
            <button type="submit"
              className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition">{editingId ? 'Save Changes' : 'Save Client'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
