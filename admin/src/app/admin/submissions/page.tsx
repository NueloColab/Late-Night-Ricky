'use client';

import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, Download, Trash2, ChevronDown, ChevronUp, Music, Mail, User, Calendar, FileAudio,  } from 'lucide-react'

interface Submission {
  id: number
  email: string
  artistName: string | null
  trackTitle: string | null
  filePath: string | null
  fileSize: number | null
  fileName: string | null
  instagramHandle: string | null
  status: 'new' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'
  notes: string | null
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new:        { label: 'New', color: '#2a1a0a', bg: '#FAFAF7' },
  reviewed:   { label: 'Reviewed', color: '#91715c', bg: '#F0F4F8' },
  shortlisted:{ label: 'Shortlisted', color: '#fff', bg: '#2a1a0a' },
  accepted:   { label: 'Accepted', color: '#5c7a3c', bg: '#e8f5e8' },
  rejected:   { label: 'Rejected', color: '#999', bg: '#f5f5f5' },
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter === 'all' ? '/api/submissions' : `/api/submissions?status=${filter}`
      const res = await fetch(url)
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch (err) {
      console.error('Failed to load submissions', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

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

  const updateNotes = async (id: number, notes: string) => {
    try {
      await fetch('/api/submissions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, notes }) })
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, notes } : s))
    } catch (err) { console.error('Notes update failed', err) }
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
        <p className="text-xs text-[#91715c] tracking-[3px] uppercase font-semibold mb-2">Music Submissions</p>
        <h1 className="text-2xl font-black text-[#2a1a0a] uppercase tracking-[-1px]">Submissions</h1>
        <p className="text-sm text-[#b89a6e] mt-1">Review, listen, and manage submitted tracks</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'new', 'reviewed', 'shortlisted', 'accepted', 'rejected'] as const).map((status) => {
          const count = status === 'all' ? submissions.length : submissions.filter(s => s.status === status).length
          const config = status !== 'all' ? statusConfig[status] : null
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[1px] transition-all ${
                filter === status
                  ? 'bg-[#2a1a0a] text-white shadow-sm'
                  : 'bg-white text-[#91715c] border border-[#91715c]/30 hover:border-[#2a1a0a] hover:text-[#2a1a0a]'
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
        <div className="text-center py-20 text-[#91715c]">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20">
          <Music size={48} className="mx-auto text-[#91715c]/30 mb-4" />
          <p className="text-[#91715c]">No submissions yet</p>
          <p className="text-sm text-[#b89a6e] mt-1">Tracks submitted through the Share Your Music form will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const isExpanded = expandedId === s.id
            const isPlaying = playingId === s.id
            const config = statusConfig[s.status] || statusConfig.new

            return (
              <div key={s.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-[#2a1a0a] shadow-sm' : 'border-[#91715c]/20 hover:border-[#91715c]/40'}`}>
                {/* Collapsed Row */}
                <div onClick={() => toggleExpand(s.id)} className="flex items-center gap-4 px-5 py-4 cursor-pointer">
                  {/* Play/Status indicator */}
                  <div className="flex-shrink-0">
                    {s.filePath ? (
                      <button onClick={(e) => { e.stopPropagation(); togglePlay(s) }} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isPlaying ? 'bg-[#2a1a0a] text-white' : 'bg-[#FAFAF7] text-[#2a1a0a] hover:bg-[#2a1a0a] hover:text-white'}`}>
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
                      <span className="font-semibold text-[#2a1a0a] text-sm truncate">{s.trackTitle || 'Untitled Track'}</span>
                      <span className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider" style={{ backgroundColor: config.bg, color: config.color }}>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[#91715c]">
                      <span className="flex items-center gap-1"><User size={11} /> {s.artistName || 'Unknown'}</span>
                      {s.instagramHandle && <span className="flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg> {s.instagramHandle}</span>}
                      <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(s.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.filePath && (
                      <a href={s.filePath} download onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full flex items-center justify-center text-[#91715c] hover:text-[#2a1a0a] hover:bg-[#FAFAF7] transition" title="Download">
                        <Download size={14} />
                      </a>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); deleteSubmission(s.id) }} className="w-8 h-8 rounded-full flex items-center justify-center text-[#91715c]/50 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                      <Trash2 size={14} />
                    </button>
                    <div className="w-5 flex items-center justify-center text-[#91715c]/40">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-[#FAFAF7] bg-[#FAFBFC]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5">
                      {/* Left: Audio Player */}
                      <div>
                        {s.filePath ? (
                          <div className="bg-[#2a1a0a] rounded-lg p-5">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                <Music size={20} className="text-[#e8d4b8]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{s.trackTitle || 'Untitled Track'}</p>
                                <p className="text-xs text-[#e8d4b8]">{s.artistName || 'Unknown Artist'}</p>
                              </div>
                              <button onClick={() => togglePlay(s)} className="w-10 h-10 rounded-full bg-white text-[#2a1a0a] flex items-center justify-center hover:bg-[#e8d4b8] transition">
                                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#e8d4b8]">{formatTime(audioProgress)}</span>
                              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }} />
                              </div>
                              <span className="text-xs text-[#e8d4b8]">{formatTime(audioDuration)}</span>
                            </div>
                            <a href={s.filePath} download className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-xs text-white font-semibold uppercase tracking-wider transition">
                              <Download size={12} /> Download
                            </a>
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
                        {/* Status */}
                        <div>
                          <p className="text-[10px] text-[#91715c] uppercase tracking-[2px] font-semibold mb-2">Status</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(statusConfig).map(([value, cfg]) => (
                              <button key={value} onClick={() => updateStatus(s.id, value)} className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border transition ${s.status === value ? `bg-[${cfg.bg}] text-[${cfg.color}] border-[${cfg.color}]/30` : 'bg-white text-[#999] border-gray-200 hover:border-[#91715c] hover:text-[#91715c]'}`} style={s.status === value ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + '40' } : {}}>
                                {cfg.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <p className="text-[10px] text-[#91715c] uppercase tracking-[2px] font-semibold mb-2">Notes</p>
                          <textarea value={s.notes || ''} onChange={(e) => updateNotes(s.id, e.target.value)} placeholder="Add review notes..." rows={2} className="w-full px-3 py-2 bg-white border border-[#FAFAF7] rounded text-sm text-[#2a1a0a] focus:outline-none focus:border-[#2a1a0a] resize-none" />
                        </div>

                        {/* Details */}
                        <div className="bg-white border border-[#FAFAF7] rounded p-3 space-y-2">
                          <p className="text-[10px] text-[#91715c] uppercase tracking-[2px] font-semibold">Details</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                            <span className="text-[#91715c]">Email</span><span className="text-[#2a1a0a] text-right truncate">{s.email}</span>
                            <span className="text-[#91715c]">Artist</span><span className="text-[#2a1a0a] text-right">{s.artistName || '-'}</span>
                            {s.instagramHandle && <><span className="text-[#91715c]">Instagram</span><span className="text-[#2a1a0a] text-right">{s.instagramHandle}</span></>}
                            <span className="text-[#91715c]">Track</span><span className="text-[#2a1a0a] text-right">{s.trackTitle || '-'}</span>
                            <span className="text-[#91715c]">Date</span><span className="text-[#2a1a0a] text-right">{formatDate(s.createdAt)}</span>
                            <span className="text-[#91715c]">Size</span><span className="text-[#2a1a0a] text-right">{formatSize(s.fileSize)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}