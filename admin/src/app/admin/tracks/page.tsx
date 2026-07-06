'use client'

import { useEffect, useState, useRef, FormEvent } from 'react'
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, Play, Pause, Upload, Music, Image } from 'lucide-react'
import Modal from '@/components/Modal'

interface Track {
  id: number
  order: number
  title: string
  filePath: string | null
  coverPath: string | null
  duration: string
  spotifyUrl: string | null
  appleMusicUrl: string | null
  youtubeUrl: string | null
  isActive: boolean
  createdAt: string
}

const emptyTrack = {
  title: '',
  filePath: null as string | null,
  coverPath: null as string | null,
  duration: '0:30',
  spotifyUrl: null as string | null,
  appleMusicUrl: null as string | null,
  youtubeUrl: null as string | null,
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
  const [uploadingCover, setUploadingCover] = useState(false)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

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

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setForm(f => ({ ...f, coverPath: data.url }))
      }
    } catch { console.error('Cover upload failed') }
    setUploadingCover(false)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Audio Library</p>
          <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#0d1f3d] tracking-[-2px] uppercase leading-[0.95]">Tracks</h1>
        </div>
        <button
          onClick={() => { setEditTrack(null); setForm(emptyTrack); setIsModalOpen(true) }}
          className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#0d1f3d] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#0d1f3d] hover:bg-[#1B3A4C] hover:text-white transition"
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
        <div className="space-y-3">
          {trackList.map((track, i) => (
            <div key={track.id} className="bg-white border border-[#E3E8ED] p-4 flex items-center gap-4 hover:border-[#1B3A4C]/30 transition">
              {/* Cover image */}
              <div className="w-12 h-12 rounded overflow-hidden bg-[#E3E8ED] flex-shrink-0">
                {track.coverPath ? (
                  <img src={track.coverPath} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music size={18} className="text-[#6B8FAB]" />
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1B3A4C] text-sm truncate">{track.title}</p>
                <p className="text-xs text-[#8a9bac]">{track.filePath ? 'Audio uploaded' : 'No audio'}{track.duration ? ` · ${track.duration}` : ''}</p>
              </div>

              {/* Play button */}
              <div className="flex-shrink-0">
                {track.filePath ? (
                  <button
                    onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-[#1B3A4C] text-[#1B3A4C] hover:bg-[#1B3A4C] hover:text-white transition"
                  >
                    {playingId === track.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#E3E8ED]">
                    <Music size={14} className="text-[#6B8FAB]" />
                  </div>
                )}
              </div>

              {/* Active toggle */}
              <button
                onClick={() => toggleActive(track.id, track.isActive)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[1px] transition ${track.isActive ? 'bg-[#2d6a2d]/10 text-[#2d6a2d]' : 'bg-[#E3E8ED] text-[#6B8FAB]'}`}
              >
                {track.isActive ? 'Active' : 'Inactive'}
              </button>

              {/* Reorder */}
              <div className="flex items-center gap-0.5">
                <button onClick={() => moveOrder(track.id, 'up')} className="p-1.5 hover:bg-[#E3E8ED] rounded text-[#6B8FAB]" disabled={i === 0}>
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => moveOrder(track.id, 'down')} className="p-1.5 hover:bg-[#E3E8ED] rounded text-[#6B8FAB]" disabled={i === trackList.length - 1}>
                  <ArrowDown size={14} />
                </button>
              </div>

              {/* Edit/Delete */}
              <div className="flex items-center gap-0.5">
                <button onClick={() => { setEditTrack(track); setForm({ ...track }); setIsModalOpen(true) }} className="p-1.5 hover:bg-[#E3E8ED] rounded text-[#6B8FAB] hover:text-[#1B3A4C]">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteTrack(track.id)} className="p-1.5 hover:bg-red-50 text-[#6B8FAB] hover:text-red-500 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline audio player */}
      {playingId && trackList.find(t => t.id === playingId)?.filePath && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1B3A4C] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4 z-50">
          <button onClick={() => setPlayingId(null)} className="text-white/80 hover:text-white">
            <Pause size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{trackList.find(t => t.id === playingId)?.title}</p>
          </div>
          <audio src={trackList.find(t => t.id === playingId)?.filePath || ''} autoPlay controls className="h-8" />
          <button onClick={() => setPlayingId(null)} className="text-white/60 hover:text-white text-xs uppercase tracking-wider">Close</button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editTrack ? 'Edit Track' : 'Add Track'}>
        <form onSubmit={saveTrack} className="space-y-4">
          {/* Cover image */}
          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Album Cover</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#E3E8ED] flex-shrink-0">
                {form.coverPath ? (
                  <img src={form.coverPath} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={24} className="text-[#6B8FAB]" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}
                  className="px-4 py-2 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#0d1f3d] hover:text-[#0d1f3d] transition">
                  {uploadingCover ? 'Uploading...' : form.coverPath ? 'Replace Cover' : 'Upload Cover'}
                </button>
                {form.coverPath && <span className="ml-2 text-xs text-[#2d6a2d]">✓ Uploaded</span>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              placeholder="Late Night Ricky — Midnight in London" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Duration</label>
              <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
                placeholder="0:30" />
              <p className="text-[10px] text-[#8a9bac] mt-1">e.g. 0:30 for preview, 3:45 for full track</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Order</label>
              <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Audio File</label>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="audio/mp3,audio/mpeg,audio/wav,audio/flac,audio/aac,audio/x-m4a" className="hidden" onChange={handleFileUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#0d1f3d] hover:text-[#0d1f3d] transition">
                <Upload size={14} />
                {uploading ? 'Uploading...' : form.filePath ? 'Replace Audio' : 'Upload Audio'}
              </button>
              {form.filePath && <span className="text-xs text-[#2d6a2d]">✓ Uploaded</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">YouTube URL</label>
            <input type="url" value={form.youtubeUrl || ''} onChange={e => setForm({ ...form, youtubeUrl: e.target.value || null })}
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              placeholder="https://youtube.com/watch?v=..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Spotify URL</label>
            <input type="url" value={form.spotifyUrl || ''} onChange={e => setForm({ ...form, spotifyUrl: e.target.value || null })}
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              placeholder="https://open.spotify.com/..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Apple Music URL</label>
            <input type="url" value={form.appleMusicUrl || ''} onChange={e => setForm({ ...form, appleMusicUrl: e.target.value || null })}
              className="w-full px-4 py-2.5 bg-white border border-[#6B8FAB]/30 rounded-lg text-[#1B3A4C] text-sm focus:outline-none focus:border-[#1B3A4C]"
              placeholder="https://music.apple.com/..." />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} id="trackActive" className="accent-[#1B3A4C]" />
            <label htmlFor="trackActive" className="text-sm text-[#1B3A4C]">Active (visible on site)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-[#6B8FAB]/50 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:border-[#0d1f3d] hover:text-[#0d1f3d] transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2 border-2 border-[#0d1f3d] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#0d1f3d] hover:bg-[#1B3A4C] hover:text-white transition">
              {editTrack ? 'Save Changes' : 'Add Track'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}