'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  Mail,
  User,
  Calendar,
  MapPin,
  PoundSterling,
  Clock,
  MessageSquare,
  Tag,
  Loader2,
  X,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { showToast } from '@/components/Toast';

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

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  new:      { bg: '#8FA8BE20', text: '#1B3A4C', border: '#8FA8BE40' },
  read:     { bg: '#6B8FAB20', text: '#1B3A4C', border: '#6B8FAB40' },
  replied:  { bg: '#1B3A4C',   text: '#fff',    border: '#1B3A4C' },
  archived: { bg: '#A3B5C420', text: '#5B7A8E', border: '#A3B5C440' },
};

const typeLabels: Record<string, string> = {
  booking: 'Booking',
  private_message: 'Message',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertForm, setConvertForm] = useState({
    clientName: '',
    clientEmail: '',
    projectTitle: '',
    notes: '',
  });

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

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => {
      const next = prev === id ? null : id;
      if (next !== null) {
        const e = enquiries.find((en) => en.id === next);
        if (e) {
          setReplySubject(
            e.type === 'booking' ? 'Re: Your Booking Enquiry' : 'Re: Your Message'
          );
          setReplyBody('');
        }
      }
      return next;
    });
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: status as any } : e))
        );
      } else {
        showToast('error', 'Failed to update status');
      }
    } catch {
      showToast('error', 'Failed to update status');
    }
  };

  const updateNotes = async (id: number, notes: string) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, notes } : e))
        );
        showToast('success', 'Notes saved');
      } else {
        showToast('error', 'Failed to save notes');
      }
    } catch {
      showToast('error', 'Failed to save notes');
    }
  };

  const handleSendReply = async (enquiry: Enquiry) => {
    if (!replySubject.trim() || !replyBody.trim()) {
      showToast('error', 'Subject and message are required');
      return;
    }
    setSendingReply(true);
    try {
      const res = await fetch(`/api/enquiries/${enquiry.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: replySubject, message: replyBody }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', 'Reply sent successfully');
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiry.id ? { ...e, status: 'replied' as any } : e))
        );
        setReplyBody('');
      } else {
        showToast('error', data.error || 'Failed to send reply');
      }
    } catch {
      showToast('error', 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const openConvertModal = (enquiry: Enquiry) => {
    setConvertForm({
      clientName: enquiry.name || '',
      clientEmail: enquiry.email || '',
      projectTitle: enquiry.clubName
        ? `${enquiry.clubName} — ${enquiry.type === 'booking' ? 'Booking' : 'Enquiry'}`
        : (enquiry.type === 'booking' ? 'Booking Enquiry' : 'Enquiry Response'),
      notes: enquiry.message || `Converted from ${enquiry.type} enquiry.\n\nOriginal details:\nClub: ${enquiry.clubName || 'N/A'}\nCity: ${enquiry.city || 'N/A'}\nFee: ${enquiry.fee || 'N/A'}\nEvent Date: ${enquiry.eventDate || 'N/A'}`,
    });
    setConvertModalOpen(true);
  };

  const handleConvertSubmit = async () => {
    if (!convertForm.clientName.trim() || !convertForm.clientEmail.trim()) {
      showToast('error', 'Client name and email are required');
      return;
    }
    setConverting(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: convertForm.clientName,
          clientEmail: convertForm.clientEmail,
          projectTitle: convertForm.projectTitle,
          notes: convertForm.notes,
          status: 'draft',
          subtotal: 0,
          taxRate: 20,
          total: 0,
          lineItems: [],
          paymentTerms: 'net-30',
          paymentTermsType: 'net-30',
          paymentTermsLabel: 'Net 30',
          paymentMethod: 'bank-transfer',
        }),
      });
      const data = await res.json();
      if (res.ok && data.quote) {
        showToast('success', `Quote ${data.quote.quoteNumber || '#' + data.quote.id} created`);
        setConvertModalOpen(false);
        router.push(`/admin/quotes/${data.quote.id}`);
      } else {
        showToast('error', data.error || 'Failed to create quote');
      }
    } catch {
      showToast('error', 'Failed to create quote');
    } finally {
      setConverting(false);
    }
  };

  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === 'new').length,
    replied: enquiries.filter((e) => e.status === 'replied').length,
    archived: enquiries.filter((e) => e.status === 'archived').length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Inbox</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
          Enquiries
        </h1>
        <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">
          Manage booking requests and private messages
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Total</p>
          <p className="text-2xl font-black text-[#111]">{stats.total}</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">New</p>
          <p className="text-2xl font-black text-[#1B3A4C]">{stats.new}</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Replied</p>
          <p className="text-2xl font-black text-[#1B3A4C]">{stats.replied}</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Archived</p>
          <p className="text-2xl font-black text-[#5B7A8E]">{stats.archived}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {['all', 'new', 'read', 'replied', 'archived'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[1px] transition-all border ${
              filter === f
                ? 'bg-[#1B3A4C] text-white border-[#1B3A4C]'
                : 'bg-white text-[#6B8FAB] border-[#A3B5C4]/30 hover:border-[#1B3A4C] hover:text-[#1B3A4C]'
            }`}
          >
            {f === 'all' ? 'All' : statusLabels[f]}
          </button>
        ))}
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="text-center py-20 text-[#6B8FAB]">Loading enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-20 text-[#6B8FAB]">No enquiries found.</div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => {
            const isExpanded = expandedId === e.id;
            const style = statusStyles[e.status] || statusStyles.new;

            return (
              <div
                key={e.id}
                className={`bg-white border transition-all duration-200 ${
                  isExpanded ? 'border-[#1B3A4C]' : 'border-[#A3B5C4]/30 hover:border-[#A3B5C4]'
                }`}
              >
                {/* Collapsed Row — Single Line */}
                <div
                  onClick={() => toggleExpand(e.id)}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer"
                >
                  {/* Status Badge */}
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex-shrink-0"
                    style={{
                      backgroundColor: style.bg,
                      color: style.text,
                      border: `1px solid ${style.border}`,
                    }}
                  >
                    {statusLabels[e.status]}
                  </span>

                  {/* Info Inline */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#1B3A4C] truncate">{e.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex-shrink-0 ${
                        e.type === 'booking' ? 'bg-[#1B3A4C] text-white' : 'bg-[#6B8FAB] text-white'
                      }`}
                    >
                      {typeLabels[e.type]}
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-xs text-[#6B8FAB]">
                      <Mail size={11} /> {e.email}
                    </span>
                    <span className="hidden lg:flex items-center gap-1 text-xs text-[#6B8FAB]">
                      <Calendar size={11} /> {formatDate(e.createdAt)}
                    </span>
                  </div>

                  {/* Chevron */}
                  <div className="w-6 flex items-center justify-center flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-[#6B8FAB]" />
                    ) : (
                      <ChevronDown size={16} className="text-[#6B8FAB]" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-[#E3E8ED] px-5 py-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column — Reply Section */}
                      <div className="space-y-4">
                        <div className="bg-[#0f1923] rounded-lg p-5 text-white">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                              <Send size={18} className="text-[#8FA8BE]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Reply to Enquiry</p>
                              <p className="text-xs text-[#8FA8BE]">{e.email}</p>
                            </div>
                          </div>

                          {e.status === 'replied' && (
                            <div className="flex items-center gap-2 mb-4 text-xs text-[#8FA8BE]">
                              <CheckCircle size={14} />
                              <span>Replied</span>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] text-[#8FA8BE] uppercase tracking-widest mb-1.5">
                                Subject
                              </label>
                              <input
                                type="text"
                                value={replySubject}
                                onChange={(ev) => setReplySubject(ev.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#8FA8BE]"
                                placeholder="Subject..."
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-[#8FA8BE] uppercase tracking-widest mb-1.5">
                                Message
                              </label>
                              <textarea
                                value={replyBody}
                                onChange={(ev) => setReplyBody(ev.target.value)}
                                rows={5}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#8FA8BE] resize-none"
                                placeholder="Type your reply..."
                              />
                            </div>
                            <button
                              onClick={() => handleSendReply(e)}
                              disabled={sendingReply || !replyBody.trim()}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#0f1923] text-sm font-semibold uppercase tracking-[1.5px] hover:bg-[#8FA8BE] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {sendingReply ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send size={16} />
                                  Send Reply
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Column — Details & Actions */}
                      <div className="space-y-4">
                        {/* Status Buttons */}
                        <div className="bg-white border border-[#E3E8ED] p-4">
                          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-3">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(statusLabels).map(([value, label]) => {
                              const sStyle = statusStyles[value];
                              const isActive = e.status === value;
                              return (
                                <button
                                  key={value}
                                  onClick={() => updateStatus(e.id, value)}
                                  className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all"
                                  style={
                                    isActive
                                      ? {
                                          backgroundColor: sStyle.bg,
                                          color: sStyle.text,
                                          border: `1px solid ${sStyle.border}`,
                                        }
                                      : {
                                          backgroundColor: '#fff',
                                          color: '#666',
                                          border: '1px solid #e5e5e5',
                                        }
                                  }
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white border border-[#E3E8ED] p-4">
                          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-3">Notes</p>
                          <textarea
                            value={e.notes || ''}
                            onBlur={(ev) => updateNotes(e.id, ev.target.value)}
                            onChange={(ev) => {
                              setEnquiries((prev) =>
                                prev.map((en) =>
                                  en.id === e.id ? { ...en, notes: ev.target.value } : en
                                )
                              );
                            }}
                            rows={4}
                            placeholder="Add internal notes..."
                            className="w-full px-3 py-2 bg-[#F8FAFB] border border-[#E3E8ED] text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-none"
                          />
                        </div>

                        {/* Convert to Quote */}
                        <div className="bg-white border border-[#E3E8ED] p-4">
                          <button
                            onClick={() => openConvertModal(e)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-[1.5px] hover:bg-[#0f1923] transition"
                          >
                            <FileText size={16} />
                            Convert to Quote
                          </button>
                        </div>

                        {/* Metadata Card */}
                        <div className="bg-[#F8FAFB] border border-[#E3E8ED] p-4">
                          <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-3">Enquiry Details</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#6B8FAB] flex items-center gap-1.5">
                                <User size={12} /> Submitted by
                              </span>
                              <span className="text-[#111] font-medium">{e.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B8FAB] flex items-center gap-1.5">
                                <Tag size={12} /> Type
                              </span>
                              <span className="text-[#111]">{typeLabels[e.type]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B8FAB] flex items-center gap-1.5">
                                <Calendar size={12} /> Date
                              </span>
                              <span className="text-[#111]">{formatDate(e.createdAt)}</span>
                            </div>
                            {e.clubName && (
                              <div className="flex justify-between">
                                <span className="text-[#6B8FAB] flex items-center gap-1.5">
                                  <MapPin size={12} /> Club
                                </span>
                                <span className="text-[#111]">{e.clubName}</span>
                              </div>
                            )}
                            {e.city && (
                              <div className="flex justify-between">
                                <span className="text-[#6B8FAB] flex items-center gap-1.5">
                                  <MapPin size={12} /> City
                                </span>
                                <span className="text-[#111]">{e.city}</span>
                              </div>
                            )}
                            {e.fee && (
                              <div className="flex justify-between">
                                <span className="text-[#6B8FAB] flex items-center gap-1.5">
                                  <PoundSterling size={12} /> Fee
                                </span>
                                <span className="text-[#111]">{e.fee}</span>
                              </div>
                            )}
                            {e.eventDate && (
                              <div className="flex justify-between">
                                <span className="text-[#6B8FAB] flex items-center gap-1.5">
                                  <Clock size={12} /> Event Date
                                </span>
                                <span className="text-[#111]">{e.eventDate}</span>
                              </div>
                            )}
                          </div>

                          {e.message && (
                            <div className="mt-4 pt-3 border-t border-[#E3E8ED]">
                              <p className="text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Original Message</p>
                              <p className="text-sm text-[#1B3A4C] whitespace-pre-wrap leading-relaxed bg-white border border-[#E3E8ED] p-3">
                                {e.message}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Convert to Quote Modal */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConvertModalOpen(false)}
          />
          <div className="relative bg-white border border-[#E3E8ED] w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-light text-[#111]">Convert to Quote</h3>
              <button
                onClick={() => setConvertModalOpen(false)}
                className="p-2 hover:bg-gray-100 transition"
              >
                <X size={18} className="text-[#6B8FAB]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Client Name</label>
                <input
                  type="text"
                  value={convertForm.clientName}
                  onChange={(ev) =>
                    setConvertForm((prev) => ({ ...prev, clientName: ev.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#F8FAFB] border border-[#E3E8ED] text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Client Email</label>
                <input
                  type="email"
                  value={convertForm.clientEmail}
                  onChange={(ev) =>
                    setConvertForm((prev) => ({ ...prev, clientEmail: ev.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#F8FAFB] border border-[#E3E8ED] text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Project Title</label>
                <input
                  type="text"
                  value={convertForm.projectTitle}
                  onChange={(ev) =>
                    setConvertForm((prev) => ({ ...prev, projectTitle: ev.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[#F8FAFB] border border-[#E3E8ED] text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#5B7A8E] uppercase tracking-widest mb-2">Notes</label>
                <textarea
                  value={convertForm.notes}
                  onChange={(ev) =>
                    setConvertForm((prev) => ({ ...prev, notes: ev.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 bg-[#F8FAFB] border border-[#E3E8ED] text-sm text-[#1B3A4C] focus:outline-none focus:border-[#1B3A4C] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConvertModalOpen(false)}
                className="flex-1 px-4 py-3 border border-[#E3E8ED] text-sm font-semibold uppercase tracking-[1px] text-[#5B7A8E] hover:bg-[#F8FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertSubmit}
                disabled={converting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-[1px] hover:bg-[#0f1923] transition disabled:opacity-50"
              >
                {converting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    Create Quote
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
