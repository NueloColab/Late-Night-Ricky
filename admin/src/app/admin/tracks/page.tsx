'use client'

import { useEffect, useState, useRef, FormEvent } from 'react'
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, Play, Pause, Upload } from 'lucide-react'
import Modal from '@/components/Modal'

interface Track {
  id: number
  order: number
  title: string
  filePath: string | null
  duration: string
  spotifyUrl: string | null
  appleMusicUrl: string | null
  isActive: boolean
  createdAt: string
}

const emptyTrack = {
  title: '',
  filePath: null as string | null,
  duration: '0:30',
  spotifyUrl: null as string | null,
  appleMusicUrl: null as string | null,
  isActive: true,
  order: 0,
}

export default function TracksPage() {
  const [trackList, setTrackList] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTrack, setEditTrack] = useState<Track | null>(null)
  const [form, setForm] = useState(emptyTrack)
  const [uploading, setUploading] = useState(false)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchTracks() }, [])

  async function fetchTracks() {
    setLoading(true)
    try {
      const res = await fetch('/api/tracks')
      const data = await res.json()
      setTrackList(data.tracks || [])
    } catch { console.error('Failed to load tracks') }
    setLoading(false)
  }

  async function saveTrack(e: FormEvent) {
    e.preventDefault()
    try {
      const url = editTrack ? `/api/tracks/${editTrack.id}` : '/api/tracks'
      const method = editTrack ? 'PUT' : 'POST'
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      setForm(emptyTrack)
      setEditTrack(null)
      setIsModalOpen(false)
      fetchTracks()
    } catch { console.error('Save failed') }
  }

  async function deleteTrack(id: number) {
    if (!confirm('Delete this track?')) return
    try {
      await fetch(`/api/tracks/${id}`, { method: 'DELETE' })
      fetchTracks()
    } catch { console.error('Delete failed') }
  }

  async function toggleActive(id: number, isActive: boolean) {
    try {
      await fetch(`/api/tracks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      fetchTracks()
    } catch { console.error('Toggle failed') }
  }

  async function moveOrder(id: number, direction: 'up' | 'down') {
    const idx = trackList.findIndex(t => t.id === id)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= trackList.length) return
    const updated = [...trackList]
    const temp = updated[idx].order
    updated[idx].order = updated[swapIdx].order
    updated[swapIdx].order = temp
    try {
      await Promise.all([
        fetch(`/api/tracks/${updated[idx].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: updated[idx].order }) }),
        fetch(`/api/tracks/${updated[swapIdx].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: updated[swapIdx].order }) }),
      ])
      fetchTracks()
    } catch { console.error('Reorder failed') }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setForm(f => ({ ...f, filePath: data.url }))
      }
    } catch { console.error('Upload failed') }
    setUploading(false)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Audio Library</p>
          <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Tracks</h1>
        </div>
        <button
          onClick={() => { setEditTrack(null); setForm(emptyTrack); setIsModalOpen(true) }}
          className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition"
        >
          <Plus size={18} />
          Add Track
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B8FAB]">Loading...</p>
      ) : trackList.length === 0 ? (
        <p className="text-sm text-[#6B8FAB]">No tracks yet. Add your first track.</p>
      ) : (
        <div className="bg-white border border-[#6B8FAB]/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#E3E8ED]/50">
              <tr className="border-b border-[#6B8FAB]/30">
                <th className="px-4 py-3 text-left font-semibold text-[#6B8FAB] w-12">#</th>
                <th className="px-4 py-3 text-left font-semibold text-[#6B8FAB]">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-[#6B8FAB]">Duration</th>
                <th className="px-4 py-3 text-left font-semibold text-[#6B8FAB]">Audio</th>
                <th className="px-4 py-3 text-left font-semibold text-[#6B8FAB]">Active</th>
                <th className="px-4 py-3 text-right font-semibold text-[#6B8FAB]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8ED]">
              {trackList.map((track, i) => (
                <tr key={track.id} className="hover:bg-[#F8FAFB]">
                  <td className="px-4 py-3 text-[#6B8FAB]">
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveOrder(track.id, 'up')} className="p-1 hover:bg-[#E3E8ED] rounded text-[#1B3A4C]" disabled={i === 0}>
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveOrder(track.id, 'down')} className="p-1 hover:bg-[#E3E8ED] rounded text-[#1B3A4C]" disabled={i === trackList.length - 1}>
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1B3A4C]">{track.title}</div>
                    <div className="text-xs text-[#6B8FAB]">{track.filePath ? 'Audio uploaded' : 'No audio'}</div>
                  </td>
                  <td className="px-4 py-3 text-[#a0a0a0]">{track.duration}</td>
                  <td className="px-4 py-3">
                    {track.filePath ? (
                      <button
                        onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition"
                      >
                          {playingId === track.id ? <Pause size={14} /> : <Play size={14} />}
                          {playingId === track.id ? 'Pause' : 'Play'}
                        </button>
                    ) : (
                      <span className="text-xs text-[#6B8FAB]">—</span>
                    )}
                    {playingId === track.id && track.filePath && (
                      <audio src={track.filePath} autoPlay controls className="mt-1 w-48" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(track.id, track.isActive)}
                      className={`px-2 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[1px] transition ${track.isActive ? 'bg-[#2d6a2d]/10 text-[#2d6a2d]' : 'bg-[#E3E8ED] text-[#6B8FAB]'}`}
                    >
                      {track.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditTrack(track); setForm({ ...track }); setIsModalOpen(true) }}
                        className="p-2 hover:bg-[#E3E8ED] rounded text-[#6B8FAB] hover:text-[#1B3A4C]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteTrack(track.id)}
                        className="p-2 hover:bg-red-50 text-[#6B8FAB] hover:text-red-500 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editTrack ? 'Edit Track' : 'Add Track'}>
        <form onSubmit={saveTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              placeholder="Late Night Ricky — Midnight in London"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
                placeholder="0:30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Audio File</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/mpeg,audio/wav"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition"
              >
                <Upload size={14} />
                {uploading ? 'Uploading...' : form.filePath ? 'Replace Audio' : 'Upload Audio'}
              </button>
              {form.filePath && <span className="text-xs text-[#2d6a2d]">✓ Uploaded</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Spotify URL</label>
            <input
              type="url"
              value={form.spotifyUrl || ''}
              onChange={e => setForm({ ...form, spotifyUrl: e.target.value || null })}
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              placeholder="https://open.spotify.com/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Apple Music URL</label>
            <input
              type="url"
              value={form.appleMusicUrl || ''}
              onChange={e => setForm({ ...form, appleMusicUrl: e.target.value || null })}
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              placeholder="https://music.apple.com/..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              id="trackActive"
              className="accent-[#1B3A4C]"
            />
            <label htmlFor="trackActive" className="text-sm text-[#1B3A4C]">Active (visible on site)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#111] hover:text-[#111] transition"
            >
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#E3E8ED] hover:text-white transition"
            >
              {editTrack ? 'Save Changes' : 'Add Track'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
