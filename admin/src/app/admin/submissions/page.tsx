'use client';

import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, Download, Trash2, ChevronDown, ChevronUp, Music, Mail, User, Calendar, FileAudio, Gauge } from 'lucide-react'

interface Submission {
  id: number
  email: string
  artistName: string | null
  trackTitle: string | null
  genre: string | null
  bpm: number | null
  filePath: string | null
  fileSize: number | null
  fileName: string | null
  instagramHandle: string | null
  status: 'new' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'
  notes: string | null
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new:        { label: 'New', color: '#1B3A4C', bg: '#E3E8ED' },
  reviewed:   { label: 'Reviewed', color: '#6B8FAB', bg: '#F0F4F8' },
  shortlisted:{ label: 'Shortlisted', color: '#fff', bg: '#1B3A4C' },
  accepted:   { label: 'Accepted', color: '#2d6a2d', bg: '#e8f5e8' },
  rejected:   { label: 'Rejected', color: '#999', bg: '#f5f5f5' },
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 20
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Submission>>({})
  const [pendingNotes, setPendingNotes] = useState<Record<number, string>>({})
  const notesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      params.set('page', String(page))
      params.set('limit', String(perPage))
      const res = await fetch(`/api/submissions?${params.toString()}`)
      const data = await res.json()
      setSubmissions(data.submissions || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      console.error('Failed to load submissions', err)
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const handleFilterChange = (status: string) => {
    setFilter(status)
    setPage(1)
  }

  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id)

  const togglePlay = (submission: Submission) => {
    if (!submission.filePath) return
    if (playingId === submission.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      if (progressInterval.current) clearInterval(progressInterval.current)
    } else {
      audioRef.current?.pause()
      const audio = new Audio(submission.filePath)
      audio.play().catch(() => {})
      audio.onended = () => { setPlayingId(null); setAudioProgress(0); if (progressInterval.current) clearInterval(progressInterval.current) }
      audio.onloadedmetadata = () => setAudioDuration(audio.duration)
      audio.ontimeupdate = () => setAudioProgress(audio.currentTime)
      audioRef.current = audio
      setPlayingId(submission.id)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch('/api/submissions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: status as any } : s))
    } catch (err) { console.error('Update failed', err) }
  }

  const debouncedSaveNotes = (id: number, notes: string) => {
    setPendingNotes(prev => ({ ...prev, [id]: notes }))
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current)
    notesTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, notes }),
        })
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, notes } : s))
        setPendingNotes(prev => { const next = { ...prev }; delete next[id]; return next })
      } catch (err) {
        console.error('Notes update failed', err)
        alert('Failed to save notes')
      }
    }, 600)
  }

  const startEdit = (s: Submission) => {
    setEditingId(s.id)
    setEditForm({
      artistName: s.artistName || '',
      trackTitle: s.trackTitle || '',
      genre: s.genre || '',
      bpm: s.bpm || null,
      instagramHandle: s.instagramHandle || '',
      email: s.email || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (id: number) => {
    try {
      const payload: any = { id }
      if (editForm.artistName !== undefined) payload.artistName = editForm.artistName
      if (editForm.trackTitle !== undefined) payload.trackTitle = editForm.trackTitle
      if (editForm.genre !== undefined) payload.genre = editForm.genre
      if (editForm.bpm !== undefined) payload.bpm = editForm.bpm
      if (editForm.instagramHandle !== undefined) payload.instagramHandle = editForm.instagramHandle
      if (editForm.email !== undefined) payload.email = editForm.email

      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...editForm } : s))
      setEditingId(null)
      setEditForm({})
    } catch (err) {
      console.error('Edit save failed', err)
      alert('Failed to save changes')
    }
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download failed', err)
      window.open(url, '_blank')
    }
  }

  const createTrackFromSubmission = async (s: Submission) => {
    try {
      const title = s.trackTitle && s.artistName
        ? `${s.artistName} — ${s.trackTitle}`
        : s.trackTitle || s.artistName || 'Untitled Track'

      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          filePath: s.filePath || '/assets/snippet-1.mp3',
          duration: '0:30',
          order: 999,
        }),
      })
      if (!res.ok) throw new Error('Failed to create track')
      alert('Track created! Go to Tracks page to manage it.')
    } catch (err: any) {
      console.error('Create track failed', err)
      alert(err.message || 'Failed to create track')
    }
  }

  const deleteSubmission = async (id: number) => {
    if (!confirm('Delete this submission?')) return
    try {
      await fetch(`/api/submissions?ids=${id}`, { method: 'DELETE' })
      setSubmissions(prev => prev.filter(s => s.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) { console.error('Delete failed', err) }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const formatTime = (seconds: number) => { if (!seconds || isNaN(seconds)) return '0:00'; const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60); return `${m}:${s.toString().padStart(2, '0')}` }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-2">Music Submissions</p>
        <h1 className="text-2xl font-black text-[#111] uppercase tracking-[-1px]">Submissions</h1>
        <p className="text-sm text-[#a0a0a0] mt-1">Review, listen, and manage submitted tracks</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'new', 'reviewed', 'shortlisted', 'accepted', 'rejected'] as const).map((status) => {
          const count = status === 'all' ? total : 0
          const config = status !== 'all' ? statusConfig[status] : null
          return (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[1px] transition-all ${
                filter === status
                  ? 'bg-[#1B3A4C] text-white shadow-sm'
                  : 'bg-white text-[#6B8FAB] border border-[#6B8FAB]/30 hover:border-[#1B3A4C] hover:text-[#1B3A4C]'
              }`}
            >
              {status === 'all' ? 'All' : config?.label || status}
              {count > 0 && <span className="ml-1.5 opacity-60">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Submissions */}
      {loading ? (
        <div className="text-center py-20 text-[#6B8FAB]">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20">
          <Music size={48} className="mx-auto text-[#6B8FAB]/30 mb-4" />
          <p className="text-[#6B8FAB]">No submissions yet</p>
          <p className="text-sm text-[#a0a0a0] mt-1">Tracks submitted through the Share Your Music form will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const isExpanded = expandedId === s.id
            const isPlaying = playingId === s.id
            const isEditing = editingId === s.id
            const config = statusConfig[s.status] || statusConfig.new

            return (
              <div key={s.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-[#1B3A4C] shadow-sm' : 'border-[#6B8FAB]/20 hover:border-[#6B8FAB]/40'}`}>
                {/* Collapsed Row */}
                <div onClick={() => toggleExpand(s.id)} className="flex items-center gap-4 px-5 py-4 cursor-pointer">
                  {/* Play/Status indicator */}
                  <div className="flex-shrink-0">
                    {s.filePath ? (
                      <button onClick={(e) => { e.stopPropagation(); togglePlay(s) }} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isPlaying ? 'bg-[#1B3A4C] text-white' : 'bg-[#E3E8ED] text-[#1B3A4C] hover:bg-[#1B3A4C] hover:text-white'}`}>
                        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                      </button>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Music size={16} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1B3A4C] text-sm truncate">{s.trackTitle || 'Untitled Track'}</span>
                      <span className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: config.bg, color: config.color }}>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[#6B8FAB]">
                      <span className="flex items-center gap-1"><User size={11} /> {s.artistName || 'Unknown'}</span>
                      {s.instagramHandle && <span className="flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg> {s.instagramHandle}</span>}
                      {s.genre && <span className="flex items-center gap-1"><Music size={11} /> {s.genre}</span>}
                      {s.bpm && <span className="flex items-center gap-1"><Gauge size={11} /> {s.bpm} BPM</span>}
                      <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(s.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.filePath && (
                      <button onClick={(e) => { e.stopPropagation(); downloadFile(s.filePath!, s.fileName || `${s.trackTitle || 'track'}.mp3`) }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B8FAB] hover:text-[#1B3A4C] hover:bg-[#E3E8ED] transition" title="Download">
                        <Download size={14} />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteSubmission(s.id) }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B8FAB]/50 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                      <Trash2 size={14} />
                    </button>
                    <div className="w-5 flex items-center justify-center text-[#6B8FAB]/40">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-[#E3E8ED] bg-[#FAFBFC]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
                      {/* Left: Audio Player */}
                      <div>
                        {s.filePath ? (
                          <div className="bg-[#1B3A4C] rounded-lg p-5">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                <Music size={20} className="text-[#C5E5F8]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{s.trackTitle || 'Untitled Track'}</p>
                                <p className="text-xs text-[#C5E5F8]">{s.artistName || 'Unknown Artist'}</p>
                              </div>
                              <button onClick={() => togglePlay(s)} className="w-10 h-10 rounded-full bg-white text-[#1B3A4C] flex items-center justify-center hover:bg-[#C5E5F8] transition">
                                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#C5E5F8]">{formatTime(audioProgress)}</span>
                              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }} />
                              </div>
                              <span className="text-xs text-[#C5E5F8]">{formatTime(audioDuration)}</span>
                            </div>
                            <button onClick={() => downloadFile(s.filePath!, s.fileName || `${s.trackTitle || 'track'}.mp3`)} className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-xs text-white font-semibold uppercase tracking-wider transition w-full">
                              <Download size={12} /> Download
                            </button>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                            <Music size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400">No audio file</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Status & Details */}
                      <div className="space-y-4">
                        {/* Edit / Save / Create Track buttons */}
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(s.id)} className="px-3 py-1.5 bg-[#1B3A4C] text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#2a5068] transition">Save</button>
                              <button onClick={cancelEdit} className="px-3 py-1.5 bg-white border border-gray-200 text-[#6B8FAB] rounded text-xs font-semibold uppercase tracking-wider hover:border-[#6B8FAB] hover:text-[#1B3A4C] transition">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(s)} className="px-3 py-1.5 bg-white border border-gray-200 text-[#6B8FAB] rounded text-xs font-semibold uppercase tracking-wider hover:border-[#6B8FAB] hover:text-[#1B3A4C] transition">✎ Edit</button>
                              {s.filePath && <button onClick={() => createTrackFromSubmission(s)} className="px-3 py-1.5 bg-[#1B3A4C] text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#2a5068] transition">+ Create Track</button>}
                            </>
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-[10px] text-[#6B8FAB] uppercase tracking-[2px] font-semibold mb-2">Status</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(statusConfig).map(([value, cfg]) => (
                              <button key={value} onClick={() => updateStatus(s.id, value)} className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border transition ${s.status === value ? `bg-[${cfg.bg}] text-[${cfg.color}] border-[${cfg.color}]/30` : 'bg-white text-[#999] border-gray-200 hover:border-[#6B8FAB] hover:text-[#6B8FAB]'}`} style={s.status === value ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + '40' } : {}}>
                                {cfg.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <p className="text-[10px] text-[#6B8FAB] uppercase tracking-[2px] font-semibold mb-2">Notes</p>
                          <textarea
                            value={pendingNotes[s.id] !== undefined ? pendingNotes[s.id] : (s.notes || '')}
                            onChange={(e) => debouncedSaveNotes(s.id, e.target.value)}
                            placeholder="Add review notes..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-[#E3E8ED] rounded text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-none"
                          />
                          {pendingNotes[s.id] !== undefined && <span className="text-[10px] text-[#6B8FAB]">Saving...</span>}
                        </div>

                        {/* Details */}
                        <div className="bg-white border border-[#E3E8ED] rounded p-3 space-y-2">
                          <p className="text-[10px] text-[#6B8FAB] uppercase tracking-[2px] font-semibold">Details</p>
                          {isEditing ? (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <span className="text-[#6B8FAB] self-center">Email</span>
                              <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))} className="px-2 py-1 border border-[#E3E8ED] rounded text-[#111] text-right text-sm focus:outline-none focus:border-[#1B3A4C]" />
                              <span className="text-[#6B8FAB] self-center">Artist</span>
                              <input type="text" value={editForm.artistName || ''} onChange={(e) => setEditForm(prev => ({ ...prev, artistName: e.target.value }))} className="px-2 py-1 border border-[#E3E8ED] rounded text-[#111] text-right text-sm focus:outline-none focus:border-[#1B3A4C]" />
                              <span className="text-[#6B8FAB] self-center">Instagram</span>
                              <input type="text" value={editForm.instagramHandle || ''} onChange={(e) => setEditForm(prev => ({ ...prev, instagramHandle: e.target.value }))} className="px-2 py-1 border border-[#E3E8ED] rounded text-[#111] text-right text-sm focus:outline-none focus:border-[#1B3A4C]" />
                              <span className="text-[#6B8FAB] self-center">Track</span>
                              <input type="text" value={editForm.trackTitle || ''} onChange={(e) => setEditForm(prev => ({ ...prev, trackTitle: e.target.value }))} className="px-2 py-1 border border-[#E3E8ED] rounded text-[#111] text-right text-sm focus:outline-none focus:border-[#1B3A4C]" />
                              <span className="text-[#6B8FAB] self-center">Genre</span>
                              <input type="text" value={editForm.genre || ''} onChange={(e) => setEditForm(prev => ({ ...prev, genre: e.target.value }))} className="px-2 py-1 border border-[#E3E8ED] rounded text-[#111] text-right text-sm focus:outline-none focus:border-[#1B3A4C]" />
                              <span className="text-[#6B8FAB] self-center">BPM</span>
                              <input type="number" value={editForm.bpm || ''} onChange={(e) => setEditForm(prev => ({ ...prev, bpm: e.target.value ? parseInt(e.target.value, 10) : null }))} className="px-2 py-1 border border-[#E3E8ED] rounded text-[#111] text-right text-sm focus:outline-none focus:border-[#1B3A4C]" />
                              <span className="text-[#6B8FAB] self-center">Date</span><span className="text-[#111] text-right">{formatDate(s.createdAt)}</span>
                              <span className="text-[#6B8FAB] self-center">Size</span><span className="text-[#111] text-right">{formatSize(s.fileSize)}</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                              <span className="text-[#6B8FAB]">Email</span><span className="text-[#111] text-right truncate">{s.email}</span>
                              <span className="text-[#6B8FAB]">Artist</span><span className="text-[#111] text-right">{s.artistName || '-'}</span>
                              {s.instagramHandle && <><span className="text-[#6B8FAB]">Instagram</span><span className="text-[#111] text-right">{s.instagramHandle}</span></>}
                              <span className="text-[#6B8FAB]">Track</span><span className="text-[#111] text-right">{s.trackTitle || '-'}</span>
                              <span className="text-[#6B8FAB]">Genre</span><span className="text-[#111] text-right">{s.genre || '-'}</span>
                              <span className="text-[#6B8FAB]">BPM</span><span className="text-[#111] text-right">{s.bpm || '-'}</span>
                              <span className="text-[#6B8FAB]">Date</span><span className="text-[#111] text-right">{formatDate(s.createdAt)}</span>
                              <span className="text-[#6B8FAB]">Size</span><span className="text-[#111] text-right">{formatSize(s.fileSize)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E3E8ED]">
              <div className="text-xs text-[#6B8FAB]">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total} submissions
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] transition disabled:opacity-30 disabled:cursor-not-allowed bg-white text-[#1B3A4C] border border-[#6B8FAB]/30 hover:border-[#1B3A4C]"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce((acc: (number | string)[], p, i, arr) => {
                    if (i > 0 && typeof arr[i - 1] === 'number' && p - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`gap-${i}`} className="text-xs text-[#6B8FAB] px-1">{p}</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded text-xs font-semibold transition ${
                          page === p
                            ? 'bg-[#1B3A4C] text-white'
                            : 'bg-white text-[#1B3A4C] border border-[#6B8FAB]/30 hover:border-[#1B3A4C]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] transition disabled:opacity-30 disabled:cursor-not-allowed bg-white text-[#1B3A4C] border border-[#6B8FAB]/30 hover:border-[#1B3A4C]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}