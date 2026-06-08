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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tracks</h1>
        <button
          onClick={() => { setEditTrack(null); setForm(emptyTrack); setIsModalOpen(true) }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#111] text-white rounded-lg hover:bg-[#1B3A4C] transition"
        >
          <Plus size={18} />
          Add Track
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : trackList.length === 0 ? (
        <p className="text-sm text-gray-500">No tracks yet. Add your first track.</p>
      ) : (
        <div className="bg-white rounded-lg border border-[#A3B5C4]/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Duration</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Audio</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Active</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trackList.map((track, i) => (
                <tr key={track.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveOrder(track.id, 'up')} className="p-1 hover:bg-gray-200 rounded" disabled={i === 0}>
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveOrder(track.id, 'down')} className="p-1 hover:bg-gray-200 rounded" disabled={i === trackList.length - 1}>
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{track.title}</div>
                    <div className="text-xs text-gray-400">{track.filePath ? 'Audio uploaded' : 'No audio'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{track.duration}</td>
                  <td className="px-4 py-3">
                    {track.filePath ? (
                      <button
                        onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                      >
                        {playingId === track.id ? <Pause size={14} /> : <Play size={14} />}
                        {playingId === track.id ? 'Pause' : 'Play'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                    {playingId === track.id && track.filePath && (
                      <audio src={track.filePath} autoPlay controls className="mt-1 w-48" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(track.id, track.isActive)}
                      className={`px-2 py-1 rounded text-xs font-medium ${track.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {track.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditTrack(track); setForm({ ...track }); setIsModalOpen(true) }}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteTrack(track.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded"
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
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]"
              placeholder="Late Night Ricky — Midnight in London"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]"
                placeholder="0:30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Audio File</label>
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
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Upload size={14} />
                {uploading ? 'Uploading...' : form.filePath ? 'Replace Audio' : 'Upload Audio'}
              </button>
              {form.filePath && <span className="text-xs text-green-600">✓ Uploaded</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Spotify URL</label>
            <input
              type="url"
              value={form.spotifyUrl || ''}
              onChange={e => setForm({ ...form, spotifyUrl: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]"
              placeholder="https://open.spotify.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Apple Music URL</label>
            <input
              type="url"
              value={form.appleMusicUrl || ''}
              onChange={e => setForm({ ...form, appleMusicUrl: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]"
              placeholder="https://music.apple.com/..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              id="trackActive"
            />
            <label htmlFor="trackActive" className="text-sm">Active (visible on site)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[#111] text-white rounded-lg hover:bg-[#1B3A4C]">
              {editTrack ? 'Save Changes' : 'Add Track'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
