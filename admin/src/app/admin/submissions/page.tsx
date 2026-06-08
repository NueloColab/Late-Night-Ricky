'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Submission {
  id: number;
  email: string;
  artistName: string | null;
  trackTitle: string | null;
  filePath: string | null;
  fileSize: number | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  notes: string | null;
  createdAt: string;
}

const statusOptions = ['all', 'new', 'reviewed', 'shortlisted', 'accepted', 'rejected'];

const statusLabels: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const statusColors: Record<string, string> = {
  new: 'bg-[#8FA8BE] text-[#111]',
  reviewed: 'bg-[#6B8FAB] text-white',
  shortlisted: 'bg-[#1B3A4C] text-white',
  accepted: 'bg-[#2d6a2d] text-white',
  rejected: 'bg-[#A3B5C4] text-[#111]',
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [updating, setUpdating] = useState<Set<number>>(new Set());

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/submissions' : `/api/submissions?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      console.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const togglePlay = (id: number, filePath: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      audioRef.current?.pause();
      const audio = new Audio(filePath);
      audio.play().catch(() => {});
      audio.onended = () => setPlayingId(null);
      audio.onpause = () => setPlayingId(null);
      audioRef.current = audio;
      setPlayingId(id);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdating((prev) => new Set(prev).add(id));
    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: status as any } : s))
      );
    } catch {
      console.error('Update failed');
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const updateNotes = async (id: number, notes: string) => {
    try {
      await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes }),
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, notes } : s))
      );
    } catch {
      console.error('Notes update failed');
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} submission(s)?`)) return;
    try {
      const ids = Array.from(selected).join(',');
      await fetch(`/api/submissions?ids=${ids}`, { method: 'DELETE' });
      setSubmissions((prev) => prev.filter((s) => !selected.has(s.id)));
      setSelected(new Set());
    } catch {
      console.error('Bulk delete failed');
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === submissions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(submissions.map((s) => s.id)));
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Submissions</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
          Music Submissions
        </h1>
        <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Review, listen, and download submitted tracks</p>
      </div>

      {/* Filter + Bulk Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-5 py-3 bg-white border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] focus:outline-none cursor-pointer"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : statusLabels[s]}</option>
          ))}
        </select>

        {selected.size > 0 && (
          <>
            <span className="text-xs text-[#6B8FAB] tracking-[2px] uppercase font-semibold">{selected.size} selected</span>
            <button
              onClick={bulkDelete}
              className="px-7 py-3 border-2 border-red-400 rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-red-600 hover:bg-red-50 transition"
            >
              Delete Selected
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-[#6B8FAB] uppercase tracking-[2px] font-semibold hover:text-[#1B3A4C]">Clear</button>
          </>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[#6B8FAB] text-sm">Loading...</p>
      ) : submissions.length === 0 ? (
        <div className="bg-white border border-[#A3B5C4]/30 p-12 text-center">
          <p className="text-[#6B8FAB] text-sm">No submissions yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#A3B5C4]/30 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#A3B5C4]/30">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === submissions.length && submissions.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 accent-[#1B3A4C]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[3px] font-semibold text-[#6B8FAB]">Artist</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[3px] font-semibold text-[#6B8FAB]">Track</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[3px] font-semibold text-[#6B8FAB]">Date</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[3px] font-semibold text-[#6B8FAB]">Size</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[3px] font-semibold text-[#6B8FAB]">Status</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[3px] font-semibold text-[#6B8FAB]">Player</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[3px] font-semibold text-[#6B8FAB]">Notes</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[3px] font-semibold text-[#6B8FAB]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-[#A3B5C4]/20 hover:bg-[#E3E8ED]/50 transition"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(sub.id)}
                      onChange={() => toggleSelect(sub.id)}
                      className="w-4 h-4 accent-[#1B3A4C]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-[#111] text-sm">{sub.artistName || 'Unknown'}</div>
                    <div className="text-xs text-[#6B8FAB]">{sub.email}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#1B3A4C]">{sub.trackTitle || '-'}</td>
                  <td className="px-4 py-4 text-xs text-[#6B8FAB]">{formatDate(sub.createdAt)}</td>
                  <td className="px-4 py-4 text-xs text-[#6B8FAB]">{formatSize(sub.fileSize)}</td>
                  <td className="px-4 py-4">
                    <select
                      value={sub.status}
                      onChange={(e) => updateStatus(sub.id, e.target.value)}
                      disabled={updating.has(sub.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] border-0 cursor-pointer ${statusColors[sub.status] || 'bg-[#A3B5C4] text-[#111]'}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    {sub.filePath ? (
                      <button
                        onClick={() => togglePlay(sub.id, sub.filePath!)}
                        className="w-8 h-8 rounded-full border-[1.5px] border-[#111] flex items-center justify-center text-[#111] hover:bg-[#111] hover:text-white transition"
                      >
                        {playingId === sub.id ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-[#A3B5C4]">No file</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      defaultValue={sub.notes || ''}
                      onBlur={(e) => updateNotes(sub.id, e.target.value)}
                      placeholder="Add notes..."
                      className="w-full px-3 py-2 bg-white border border-[#A3B5C4]/30 rounded text-xs text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {sub.filePath && (
                        <a
                          href={sub.filePath}
                          download
                          className="text-xs text-[#1B3A4C] font-semibold uppercase tracking-[1.5px] hover:underline"
                        >
                          Download
                        </a>
                      )}
                      <button
                        onClick={() => updateStatus(sub.id, 'accepted')}
                        className="px-3 py-1 bg-[#2d6a2d] text-white text-[11px] font-semibold uppercase tracking-[1.5px] rounded-full hover:bg-[#1a4d1a] transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this submission?')) return;
                          try {
                            await fetch(`/api/submissions?ids=${sub.id}`, { method: 'DELETE' });
                            setSubmissions((prev) => prev.filter((s) => s.id !== sub.id));
                          } catch {}
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
