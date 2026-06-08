'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Enquiry {
  id: number;
  type: 'booking' | 'private_message';
  name: string;
  email: string;
  clubName: string | null;
  city: string | null;
  fee: string | null;
  eventDate: string | null;
  message: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  notes: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
};

const statusColors: Record<string, string> = {
  new: 'bg-[#8FA8BE]',
  read: 'bg-[#6B8FAB]',
  replied: 'bg-[#1B3A4C]',
  archived: 'bg-[#A3B5C4]',
};

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [updating, setUpdating] = useState<Set<number>>(new Set());

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/enquiries' : `/api/enquiries?status=${filter}`;
      const res = await fetch(url);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  async function updateStatus(id: number, status: string) {
    setUpdating((prev) => new Set(prev).add(id));
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchEnquiries();
    } catch (err) {
      console.error('Failed to update enquiry', err);
    }
    setUpdating((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    const ids = Array.from(selected).join(',');
    try {
      await fetch(`/api/enquiries?ids=${ids}`, { method: 'DELETE' });
      setSelected(new Set());
      fetchEnquiries();
    } catch (err) {
      console.error('Failed to delete enquiries', err);
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === enquiries.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(enquiries.map((e) => e.id)));
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <div className="border-b-2 border-[#111] pt-20 pb-5 px-8">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-1">Inbox</p>
            <h1 className="text-[clamp(32px,4vw,56px)] font-black tracking-[-1px] uppercase leading-[0.9] text-[#111]">Enquiries</h1>
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button
                onClick={deleteSelected}
                className="px-4 py-2 border-2 border-red-300 rounded-full text-[11px] font-semibold uppercase tracking-[1px] text-red-600 hover:bg-red-50 transition"
              >
                Delete {selected.size}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 max-w-[1200px] mx-auto">
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'read', 'replied', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[1px] border-2 transition ${
                filter === f
                  ? 'bg-[#111] text-white border-[#111]'
                  : 'bg-white text-[#1B3A4C] border-[#A3B5C4]/30 hover:border-[#111]'
              }`}
            >
              {f === 'all' ? 'All' : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="px-8 pb-20 max-w-[1200px] mx-auto">
        {loading ? (
          <div className="text-center py-20 text-[#6B8FAB]">Loading enquiries...</div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-20 text-[#6B8FAB]">No enquiries found.</div>
        ) : (
          <div className="bg-white border border-[#A3B5C4]/30 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E3E8ED]">
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.size > 0 && selected.size === enquiries.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-[#1B3A4C]"
                      />
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6B8FAB]">Type</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6B8FAB]">Name</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6B8FAB]">Email</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6B8FAB]">Details</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6B8FAB]">Status</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6B8FAB]">Date</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6B8FAB]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((e) => (
                    <tr key={e.id} className="border-b border-[#E3E8ED] hover:bg-[rgba(227,232,237,0.3)]">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(e.id)}
                          onChange={() => toggleSelect(e.id)}
                          className="w-4 h-4 accent-[#1B3A4C]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[1px] text-white ${
                            e.type === 'booking' ? 'bg-[#1B3A4C]' : 'bg-[#6B8FAB]'
                          }`}
                        >
                          {e.type === 'booking' ? 'Booking' : 'Message'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1B3A4C]">{e.name}</td>
                      <td className="px-4 py-3 text-sm text-[#5B7A8E]">{e.email}</td>
                      <td className="px-4 py-3 text-sm text-[#5B7A8E] max-w-[200px] truncate">
                        {e.type === 'booking'
                          ? `${e.clubName || ''} · ${e.city || ''} · ${e.fee || ''} · ${e.eventDate || ''}`
                          : e.message || ''}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={e.status}
                          onChange={(ev) => updateStatus(e.id, ev.target.value)}
                          disabled={updating.has(e.id)}
                          className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[1px] text-white border-0 outline-none cursor-pointer ${statusColors[e.status] || 'bg-[#A3B5C4]'}`}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value} className="bg-white text-[#111]">{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B8FAB] whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${e.email}?subject=${encodeURIComponent(e.type === 'booking' ? 'Booking Enquiry' : 'Re: Your Message')}`}
                          className="text-[11px] font-semibold uppercase tracking-[1px] text-[#1B3A4C] hover:text-[#111] transition underline"
                        >
                          Reply
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
