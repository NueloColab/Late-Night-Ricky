'use client'

import { useEffect, useState } from 'react'
import { Plus, Music, Eye, GripVertical } from 'lucide-react'
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Show Cards</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Shows</h1>
            <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Manage show cards displayed on the front end.</p>
          </div>
          <button onClick={openNew}
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition"
          >
            <Plus size={16} />
            Add Show
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-[#6B8FAB]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#E3E8ED] text-white rounded-lg"><Music size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">{loading ? '–' : cards.length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Total Shows</p>
        </div>
        <div className="bg-white border border-[#6B8FAB]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d6a2d] text-white rounded-lg"><Eye size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#2d6a2d] leading-none tracking-[-1px]">{loading ? '–' : cards.filter(c => c.isActive).length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Active</p>
        </div>
        <div className="bg-white border border-[#6B8FAB]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#6B8FAB] text-white rounded-lg"><GripVertical size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#6B8FAB] leading-none tracking-[-1px]">{loading ? '–' : cards.filter(c => !c.isActive).length}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Hidden</p>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <p className="text-[#6B8FAB] text-center py-8">Loading...</p>
      ) : cards.length === 0 ? (
        <div className="bg-white border border-[#6B8FAB]/30 p-8 text-center">
          <p className="text-[#6B8FAB]">No show cards yet. Add your first show above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className={`bg-white border overflow-hidden transition-opacity ${card.isActive ? 'border-[#6B8FAB]/30' : 'border-[#6B8FAB]/20 opacity-60'}`}>
              {card.imagePath && (
                <div className="aspect-video bg-[#E3E8ED] overflow-hidden">
                  <img src={card.imagePath} alt={card.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1B3A4C]">{card.title || 'Untitled'}</h3>
                    <p className="text-xs text-[#a0a0a0] mt-0.5">{card.venue}{card.location ? ` · ${card.location}` : ''}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(card.id, !card.isActive)}
                    className={`text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide ${card.isActive ? 'bg-[#2d6a2d]/10 text-[#2d6a2d]' : 'bg-[#E3E8ED] text-[#6B8FAB]'}`}
                  >
                    {card.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>
                {card.season && <p className="text-xs text-[#6B8FAB] mt-1">{card.season}</p>}
                {card.description && <p className="text-xs text-[#a0a0a0] mt-2 line-clamp-2">{card.description}</p>}
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#6B8FAB]/20">
                  <button onClick={() => openEdit(card)} className="text-xs text-[#1B3A4C] hover:underline font-semibold">Edit</button>
                  <button onClick={() => deleteCard(card.id)} className="text-xs text-[#6B8FAB] hover:text-red-500">Delete</button>
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
            <p className="text-xs uppercase tracking-[3px] text-[#6B8FAB] font-semibold">Show Details</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title <span className="text-red-400">*</span></label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" placeholder="Show name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Venue</label>
              <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" placeholder="Venue name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" placeholder="City, Country" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Season</label>
              <input type="text" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" placeholder="e.g. Summer 2026" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Link URL</label>
              <input type="text" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]" placeholder="https://" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-none" placeholder="Brief description of the show..." />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition"
            >
              {editCard ? 'Update Show' : 'Add Show'}
            </button>
            <button type="button" onClick={() => { setIsModalOpen(false); setEditCard(null) }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
