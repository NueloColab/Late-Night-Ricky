'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

interface ShowCard {
  id: number
  order: number
  title: string
  venue: string
  location: string
  season: string
  description: string
  imagePath: string | null
  href: string
  isActive: boolean
}

const emptyCard = {
  title: '',
  venue: '',
  location: '',
  season: '',
  description: '',
  href: '',
  isActive: true,
  order: 0,
}

export default function ShowsPage() {
  const [cards, setCards] = useState<ShowCard[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editCard, setEditCard] = useState<ShowCard | null>(null)
  const [form, setForm] = useState(emptyCard)

  useEffect(() => { fetchCards() }, [])

  async function fetchCards() {
    setLoading(true)
    try {
      const res = await fetch('/api/show-cards')
      const data = await res.json()
      setCards(data.cards || [])
    } catch (err) { console.error('Failed to load show cards:', err) }
    setLoading(false)
  }

  async function saveCard(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editCard ? `/api/show-cards/${editCard.id}` : '/api/show-cards'
      const method = editCard ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setForm(emptyCard)
      setEditCard(null)
      setIsModalOpen(false)
      fetchCards()
    } catch (err) { console.error('Save failed:', err) }
  }

  async function deleteCard(id: number) {
    if (!confirm('Delete this show card?')) return
    await fetch(`/api/show-cards/${id}`, { method: 'DELETE' })
    fetchCards()
  }

  async function toggleActive(id: number, isActive: boolean) {
    try {
      await fetch(`/api/show-cards/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive }) })
      fetchCards()
    } catch (err) { console.error('Toggle failed:', err) }
  }

  function openEdit(card: ShowCard) {
    setForm({
      title: card.title,
      venue: card.venue,
      location: card.location,
      season: card.season,
      description: card.description,
      href: card.href,
      isActive: card.isActive,
      order: card.order,
    })
    setEditCard(card)
    setIsModalOpen(true)
  }

  function openNew() {
    setForm({ ...emptyCard, order: cards.length })
    setEditCard(null)
    setIsModalOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#91715c]"></div>
          <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Show Cards</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1a1a] tracking-tight">Shows</h1>
            <p className="text-sm text-[#666] mt-1">Manage show cards displayed on the front end.</p>
          </div>
          <button onClick={openNew} className="px-5 py-2.5 bg-[#5c7a94] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus size={16} />
            Add Show
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1a1a1a] text-white rounded-lg"><Music size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#1a1a1a]">{loading ? '–' : cards.length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Total Shows</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d6a2d] text-white rounded-lg"><Eye size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#2d6a2d]">{loading ? '–' : cards.filter(c => c.isActive).length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Active</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#999] text-white rounded-lg"><GripVertical size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#999]">{loading ? '–' : cards.filter(c => !c.isActive).length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Hidden</p>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <p className="text-[#666] text-center py-8">Loading...</p>
      ) : cards.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-[#666]">No show cards yet. Add your first show above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className={`bg-white border rounded-lg overflow-hidden transition-opacity ${card.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              {card.imagePath && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img src={card.imagePath} alt={card.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1a1a1a]">{card.title || 'Untitled'}</h3>
                    <p className="text-xs text-[#666] mt-0.5">{card.venue}{card.location ? ` · ${card.location}` : ''}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(card.id, !card.isActive)}
                    className={`text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide ${card.isActive ? 'bg-[#2d6a2d]/10 text-[#2d6a2d]' : 'bg-gray-100 text-[#999]'}`}
                  >
                    {card.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>
                {card.season && <p className="text-xs text-[#8FA8BE] mt-1">{card.season}</p>}
                {card.description && <p className="text-xs text-[#999] mt-2 line-clamp-2">{card.description}</p>}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(card)} className="text-xs text-[#5c7a94] hover:underline">Edit</button>
                  <button onClick={() => deleteCard(card.id)} className="text-xs text-[#999] hover:text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditCard(null) }} title={editCard ? 'Edit Show' : 'Add Show'} maxWidth="max-w-xl">
        <form onSubmit={saveCard} className="space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-px bg-[#91715c]"></div>
            <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Show Details</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#666] mb-1.5">Title <span className="text-red-400">*</span></label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" placeholder="Show name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666] mb-1.5">Venue</label>
              <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" placeholder="Venue name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666] mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" placeholder="City, Country" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666] mb-1.5">Season</label>
              <input type="text" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" placeholder="e.g. Summer 2026" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666] mb-1.5">Link URL</label>
              <input type="text" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent" placeholder="https://" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#666] mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent resize-none" placeholder="Brief description of the show..." />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5c7a94] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
              {editCard ? 'Update Show' : 'Add Show'}
            </button>
            <button type="button" onClick={() => { setIsModalOpen(false); setEditCard(null) }} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}