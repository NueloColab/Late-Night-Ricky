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

const statusLabels: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
};

const statusColors: Record<string, string> = {
  new: 'bg-[#8FA8BE]',
  reviewed: 'bg-[#6B8FAB]',
  shortlisted: 'bg-[#1B3A4C]',
  rejected: 'bg-[#A3B5C4]',
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
    } catch (err) {
      console.error('Failed to load submissions', err);
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
    } catch (err) {
      console.error('Update failed', err);
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
    } catch (err) {
      console.error('Notes update failed', err);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => updateStatus(id, status)));
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} submission(s)?`)) return;
    try {
      const ids = Array.from(selected).join(',');
      await fetch(`/api/submissions?ids=${ids}`, { method: 'DELETE' });
      setSubmissions((prev) => prev.filter((s) => !selected.has(s.id)));
      setSelected(new Set());
    } catch (err) {
      console.error('Bulk delete failed', err);
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-white tracking-tight">Music Submissions</h1>
          <p className="text-[#8FA3B3] mt-2 text-sm font-medium tracking-wide uppercase">Review, listen, and download submitted tracks</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[#A3B5C4] bg-[#111318] text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1B3A4C]"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium">{selected.size} selected</span>
            <button
              onClick={() => bulkUpdateStatus('reviewed')}
              className="px-3 py-1.5 rounded-md bg-[#6B8FAB] text-white text-xs font-medium hover:bg-[#1B3A4C] transition"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => bulkUpdateStatus('shortlisted')}
              className="px-3 py-1.5 rounded-md bg-[#1B3A4C] text-white text-xs font-medium hover:bg-[#0f2330] transition"
            >
              Shortlist
            </button>
            <button
              onClick={() => bulkUpdateStatus('rejected')}
              className="px-3 py-1.5 rounded-md bg-[#A3B5C4] text-white text-xs font-medium hover:bg-[#8FA8BE] transition"
            >
              Reject
            </button>
            <button
              onClick={bulkDelete}
              className="px-3 py-1.5 rounded-md bg-[#0A0A0A] text-white text-xs font-medium hover:bg-[#d0d8e0] transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#8FA3B3]">Loading submissions…</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 text-[#8FA3B3]">No submissions found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#2A2E36]">
          <table className="w-full text-sm">
            <thead className="bg-[#1B3A4C] text-white">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === submissions.length}
                    onChange={selectAll}
                    className="accent-white"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Artist</th>
                <th className="px-4 py-3 text-left font-medium">Track</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Size</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Player</th>
                <th className="px-4 py-3 text-left font-medium">Notes</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E36]">
              {submissions.map((s) => (
                <tr key={s.id} className="bg-[#111318] hover:bg-[#111318]">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="accent-[#1B3A4C]"
                    />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-white">{s.artistName || '-'}</td>
                  <td className="px-4 py-3 text-white">{s.trackTitle || '-'}</td>
                  <td className="px-4 py-3 text-[#8FA3B3]">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-[#8FA3B3]">{formatSize(s.fileSize)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={s.status}
                      onChange={(e) => updateStatus(s.id, e.target.value)}
                      disabled={updating.has(s.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold text-white border-none cursor-pointer ${statusColors[s.status]} disabled:opacity-50`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value} className="bg-[#111318] text-white">
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {s.filePath ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePlay(s.id, s.filePath!)}
                          className="w-9 h-9 rounded-full border-2 border-[#1B3A4C] flex items-center justify-center text-white hover:bg-[#1B3A4C] hover:text-white transition"
                          title={playingId === s.id ? 'Pause' : 'Play'}
                        >
                          {playingId === s.id ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5,3 19,12 5,21" />
                            </svg>
                          )}
                        </button>
                        <a
                          href={s.filePath}
                          download
                          className="w-9 h-9 rounded-full border-2 border-[#8FA8BE] flex items-center justify-center text-[#8FA3B3] hover:bg-[#8FA8BE] hover:text-white transition"
                          title="Download"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      <span className="text-[#8FA3B3] text-xs">No file</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      value={s.notes || ''}
                      onChange={(e) => updateNotes(s.id, e.target.value)}
                      placeholder="Add notes…"
                      rows={2}
                      className="w-full min-w-[160px] px-2 py-1 rounded-md border border-[#2A2E36] text-xs text-white bg-[#111318] focus:outline-none focus:ring-1 focus:ring-[#1B3A4C] resize-y"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={async () => {
                        if (confirm('Delete this submission?')) {
                          try {
                            await fetch(`/api/submissions?ids=${s.id}`, { method: 'DELETE' });
                            setSubmissions((prev) => prev.filter((x) => x.id !== s.id));
                          } catch (err) {
                            console.error('Delete failed', err);
                          }
                        }
                      }}
                      className="text-xs text-[#8FA3B3] hover:text-white transition"
                    >
                      Delete
                    </button>
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
