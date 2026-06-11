'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, Download, Trash2, ChevronDown, ChevronUp, Music, Mail, User, Calendar, FileAudio } from 'lucide-react'

interface Submission {
  id: number
  email: string
  artistName: string | null
  trackTitle: string | null
  filePath: string | null
  fileSize: number | null
  fileName: string | null
  status: 'new' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected'
  notes: string | null
  createdAt: string
}

const statusLabels: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  new:        { bg: '#8FA8BE20', text: '#1B3A4C', border: '#8FA8BE40' },
  reviewed:   { bg: '#6B8FAB20', text: '#1B3A4C', border: '#6B8FAB40' },
  shortlisted:{ bg: '#1B3A4C',   text: '#fff',    border: '#1B3A4C' },
  accepted:   { bg: '#2d6a2d20', text: '#2d6a2d', border: '#2d6a2d40' },
  rejected:   { bg: '#A3B5C420', text: '#5B7A8E', border: '#A3B5C440' },
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

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

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
      audio.onended = () => {
        setPlayingId(null)
        setAudioProgress(0)
        if (progressInterval.current) clearInterval(progressInterval.current)
      }
      audio.onpause = () => {
        setPlayingId(null)
        if (progressInterval.current) clearInterval(progressInterval.current)
      }
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration)
      }
      audio.ontimeupdate = () => {
        setAudioProgress(audio.currentTime)
      }
      audioRef.current = audio
      setPlayingId(submission.id)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: status as any } : s))
      )
    } catch (err) {
      console.error('Update failed', err)
    }
  }

  const updateNotes = async (id: number, notes: string) => {
    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes }),
      })
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, notes } : s))
      )
    } catch (err) {
      console.error('Notes update failed', err)
    }
  }

  const deleteSubmission = async (id: number) => {
    if (!confirm('Delete this submission?')) return
    try {
      await fetch(`/api/submissions?ids=${id}`, { method: 'DELETE' })
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Music Submissions</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
          Submissions
        </h1>
        <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Review, listen, and download submitted tracks</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {['all', 'new', 'reviewed', 'shortlisted', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[1px] transition-all border ${
              filter === status
                ? 'bg-[#1B3A4C] text-white border-[#1B3A4C]'
                : 'bg-white text-[#6B8FAB] border-[#A3B5C4]/30 hover:border-[#1B3A4C] hover:text-[#1B3A4C]'
            }`}
          >
            {status === 'all' ? 'All' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Submissions */}
      {loading ? (
        <div className="text-center py-20 text-[#6B8FAB]">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 text-[#6B8FAB]">No submissions found.</div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const isExpanded = expandedId === s.id
            const isPlaying = playingId === s.id
            const style = statusStyles[s.status] || statusStyles.new

            return (
              <div
                key={s.id}
                className={`bg-white border transition-all duration-200 ${
                  isExpanded ? 'border-[#1B3A4C]' : 'border-[#A3B5C4]/30 hover:border-[#A3B5C4]'
                }`}
              >
                {/* Collapsed Row */}
                <div
                  onClick={() => toggleExpand(s.id)}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer"
                >
                  {/* Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePlay(s)
                    }}
                    disabled={!s.filePath}
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isPlaying
                        ? 'bg-[#1B3A4C] text-white'
                        : s.filePath
                        ? 'bg-[#E3E8ED] text-[#1B3A4C] hover:bg-[#1B3A4C] hover:text-white'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-[#1B3A4C] truncate">
                        {s.trackTitle || 'Untitled Track'}
                      </span>
                      <span
                        className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                          border: `1px solid ${style.border}`,
                        }}
                      >
                        {statusLabels[s.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6B8FAB]">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {s.artistName || 'Unknown Artist'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {s.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(s.createdAt)}
                      </span>
                      {s.fileSize && (
                        <span className="flex items-center gap-1">
                          <FileAudio size={12} /> {formatSize(s.fileSize)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.filePath && (
                      <a
                        href={s.filePath}
                        download={s.fileName || `${s.artistName || 'track'} - ${s.trackTitle || 'demo'}.mp3`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-10 h-10 rounded-full border border-[#A3B5C4]/40 flex items-center justify-center text-[#6B8FAB] hover:bg-[#1B3A4C] hover:text-white hover:border-[#1B3A4C] transition"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSubmission(s.id)
                      }}
                      className="w-10 h-10 rounded-full border border-red-200 flex items-center justify-center text-[#A3B5C4] hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="w-6 flex items-center justify-center">
                      {isExpanded ? <ChevronUp size={16} className="text-[#6B8FAB]" /> : <ChevronDown size={16} className="text-[#6B8FAB]" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-[#E3E8ED] px-5 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Audio Player */}
                      <div className="space-y-4">
                        {s.filePath ? (
                          <>
                            <div className="bg-[#0f1923] rounded-lg p-5 text-white">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                                  <Music size={24} className="text-[#8FA8BE]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{s.trackTitle || 'Untitled Track'}</p>
                                  <p className="text-xs text-[#8FA8BE]">{s.artistName || 'Unknown Artist'}</p>
                                </div>
                                <button
                                  onClick={() => togglePlay(s)}
                                  className="w-12 h-12 rounded-full bg-white text-[#0f1923] flex items-center justify-center hover:bg-[#8FA8BE] transition"
                                >
                                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                              </div>

                              {/* Progress Bar */}
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-[#8FA8BE] w-10 text-right">
                                  {formatTime(audioProgress)}
                                </span>
                                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-white rounded-full transition-all"
                                    style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }}
                                  />
                                </div>
                                <span className="text-xs text-[#8FA8BE] w-10">
                                  {formatTime(audioDuration)}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <a
                                href={s.filePath}
                                download={s.fileName || `${s.artistName || 'track'} - ${s.trackTitle || 'demo'}.mp3`}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-[1.5px] hover:bg-[#0f1923] transition"
                              >
                                <Download size={16} />
                                Download Track
                              </a>
                            </div>
                          </>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <Music size={32} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm text-gray-400">No audio file attached</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Details & Notes */}
                      <div className="space-y-3">
                        {/* Status */}
                        <div className="bg-white border border-[#E3E8ED] p-3">
                          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(statusLabels).map(([value, label]) => {
                              const sStyle = statusStyles[value]
                              const isActive = s.status === value
                              return (
                                <button
                                  key={value}
                                  onClick={() => updateStatus(s.id, value)}
                                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
                                  style={isActive
                                    ? { backgroundColor: sStyle.bg, color: sStyle.text, border: `1px solid ${sStyle.border}` }
                                    : { backgroundColor: '#fff', color: '#666', border: '1px solid #e5e5e5' }
                                  }
                                >
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white border border-[#E3E8ED] p-3">
                          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Notes</p>
                          <textarea
                            value={s.notes || ''}
                            onChange={(e) => updateNotes(s.id, e.target.value)}
                            placeholder="Add your review notes, feedback, or thoughts on this track..."
                            rows={3}
                            className="w-full px-3 py-2 bg-[#F8FAFB] border border-[#E3E8ED] text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-none"
                          />
                        </div>

                        {/* Metadata */}
                        <div className="bg-[#F8FAFB] border border-[#E3E8ED] p-3">
                          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Submission Details</p>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#6B8FAB]">Submitted by</span>
                              <span className="text-[#111]">{s.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B8FAB]">Artist</span>
                              <span className="text-[#111]">{s.artistName || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B8FAB]">Track</span>
                              <span className="text-[#111]">{s.trackTitle || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B8FAB]">Date</span>
                              <span className="text-[#111]">{formatDate(s.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B8FAB]">File Size</span>
                              <span className="text-[#111]">{formatSize(s.fileSize)}</span>
                            </div>
                            {s.fileName && (
                              <div className="flex justify-between">
                                <span className="text-[#6B8FAB]">File Name</span>
                                <span className="text-[#111] truncate max-w-[200px]">{s.fileName}</span>
                              </div>
                            )}
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

