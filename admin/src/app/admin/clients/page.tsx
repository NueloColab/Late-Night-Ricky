'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Users, Trash2, Eye, Phone, Mail, Instagram, Calendar } from 'lucide-react'
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
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

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
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setForm({ name: '', email: '', phone: '', instagram: '', notes: '' })
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
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#1B3A4C]"></div>
          <p className="text-xs uppercase tracking-widest text-[#8FA8BE] font-medium">Client Management</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1B3A4C] tracking-tight">Clients</h1>
            <p className="text-sm text-[#8FA8BE] mt-1">Manage contacts, venues and partners.</p>
          </div>
          <button
            onClick={() => {
              setForm({ name: '', email: '', phone: '', instagram: '', notes: '' })
              setShowForm(true)
            }}
            className="px-5 py-2.5 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-[#2a4a5c] transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#E3E8ED] rounded-xl p-6 mb-6">
        <label className="block text-xs uppercase tracking-widest font-semibold text-[#1B3A4C] mb-3">Search Clients</label>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#E3E8ED]">
            <Search className="w-4 h-4 text-[#8FA8BE]" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or Instagram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 py-3 bg-white border-2 border-[#E3E8ED] text-[#1B3A4C] placeholder-[#A3B5C4] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[#8FA8BE] text-center py-8">Loading...</p>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white border border-[#E3E8ED] rounded-xl p-8 text-center">
          <p className="text-[#8FA8BE]">No clients found. Add your first client above.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E3E8ED] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E3E8ED]">
                  {['Name', 'Contact', 'Bookings', 'Revenue', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#8FA8BE]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#F8FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1B3A4C]">{client.name}</div>
                      <div className="text-xs text-[#8FA8BE] mt-0.5">Added {new Date(client.createdAt).toLocaleDateString('en-GB')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-xs text-[#8FA8BE]">
                            <Mail size={12} /> {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-[#8FA8BE]">
                            <Phone size={12} /> {client.phone}
                          </div>
                        )}
                        {client.instagram && (
                          <div className="flex items-center gap-1.5 text-xs text-[#8FA8BE]">
                            <Instagram size={12} /> {client.instagram}
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
                          onClick={() => {
                            setSelectedClient(client)
                            setIsViewOpen(true)
                          }}
                          className="p-1.5 hover:bg-[#E3E8ED] rounded-lg transition-colors text-[#8FA8BE] hover:text-[#1B3A4C]"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => deleteClient(client.id)}
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

      {/* Add Client Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Client" maxWidth="max-w-lg">
        <form onSubmit={saveClient} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Instagram</label>
            <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full px-4 py-2.5 bg-white border-2 border-[#E3E8ED] rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C] resize-none" />
          </div>
          <div className="flex justify-end">
            <button type="submit"
              className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors">Save Client</button>
          </div>
        </form>
      </Modal>

      {/* View Client Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={selectedClient?.name} maxWidth="max-w-lg">
        {selectedClient && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[#8FA8BE]">
              <Calendar size={14} />
              Added {new Date(selectedClient.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="bg-white border border-[#E3E8ED] rounded-xl p-4 space-y-3">
              {selectedClient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-[#8FA8BE]" />
                  <span className="text-[#1B3A4C]">{selectedClient.email}</span>
                </div>
              )}
              {selectedClient.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-[#8FA8BE]" />
                  <span className="text-[#1B3A4C]">{selectedClient.phone}</span>
                </div>
              )}
              {selectedClient.instagram && (
                <div className="flex items-center gap-2 text-sm">
                  <Instagram size={14} className="text-[#8FA8BE]" />
                  <span className="text-[#1B3A4C]">{selectedClient.instagram}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#E3E8ED] rounded-xl p-4 text-center">
                <p className="text-2xl font-serif font-semibold text-[#1B3A4C]">{selectedClient.totalBookings || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium mt-1">Bookings</p>
              </div>
              <div className="bg-white border border-[#E3E8ED] rounded-xl p-4 text-center">
                <p className="text-2xl font-serif font-semibold text-[#1B3A4C]">
                  {selectedClient.totalRevenue ? `£${Number(selectedClient.totalRevenue).toLocaleString()}` : '—'}
                </p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium mt-1">Revenue</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
