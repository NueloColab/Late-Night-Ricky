'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  MailOpen,
  Search,
  Filter,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Send,
  Reply,
  Archive,
  FileText,
  Receipt,
  Building2,
  Calendar,
  MapPin,
} from 'lucide-react'
import { showToast } from '@/components/Toast'

interface Enquiry {
  id: number
  type: 'booking' | 'private_message'
  name: string
  email: string
  clubName: string | null
  city: string | null
  fee: string | null
  eventDate: string | null
  message: string | null
  status: 'new' | 'read' | 'replied' | 'archived'
  notes: string | null
  replies: any[]
  createdAt: string
}

const statusStyles: Record<string, string> = {
  new: 'bg-[#1B3A4C] text-white border-[#1B3A4C]',
  read: 'bg-[#6B8FAB] text-white border-[#6B8FAB]',
  replied: 'bg-[#1B3A4C] text-white border-[#1B3A4C]',
  archived: 'bg-gray-400 text-white border-gray-400',
}

export default function EnquiriesPage() {
  const router = useRouter()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [pipelineLoading, setPipelineLoading] = useState<string>('')

  const fetchEnquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      const url = '/api/enquiries' + (params.toString() ? '?' + params.toString() : '')
      const res = await fetch(url)
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setEnquiries(data.enquiries || [])
    } catch (err) {
      console.error('Failed to load enquiries', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, router])

  useEffect(() => {
    fetchEnquiries()
  }, [fetchEnquiries])

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        await fetchEnquiries()
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: status as any })
        }
      }
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleViewEnquiry = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setShowModal(true)
    setReplyText('')
    setReplySubject(`Re: ${enquiry.type === 'booking' ? 'Your Booking Enquiry' : 'Your Message'}`)
    if (enquiry.status === 'new') {
      updateStatus(enquiry.id, 'read')
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedEnquiry) return
    try {
      setSendingReply(true)
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: replySubject, message: replyText }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setReplyText('')
        showToast('success', 'Reply sent successfully')
        await fetchEnquiries()
        const fresh = enquiries.find((e) => e.id === selectedEnquiry.id)
        if (fresh) setSelectedEnquiry(fresh)
      } else {
        showToast('error', data.error || 'Failed to send reply')
      }
    } catch {
      showToast('error', 'Failed to send reply')
    } finally {
      setSendingReply(false)
    }
  }

  const confirmDelete = (id: number) => {
    setMessageToDelete(id)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!messageToDelete) return
    try {
      setIsDeleting(true)
      await fetch(`/api/enquiries?ids=${messageToDelete}`, { method: 'DELETE' })
      await fetchEnquiries()
      if (selectedEnquiry && selectedEnquiry.id === messageToDelete) {
        setSelectedEnquiry(null)
        setShowModal(false)
      }
      setShowDeleteModal(false)
      setMessageToDelete(null)
      showToast('success', 'Enquiry deleted')
    } catch {
      showToast('error', 'Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredEnquiries = enquiries.filter((e) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      e.name.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term) ||
      (e.clubName && e.clubName.toLowerCase().includes(term)) ||
      (e.message && e.message.toLowerCase().includes(term))
    )
  })

  const stats = {
    total: enquiries.length,
    unread: enquiries.filter((e) => e.status === 'new').length,
    replied: enquiries.filter((e) => e.status === 'replied').length,
    archived: enquiries.filter((e) => e.status === 'archived').length,
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#6B8FAB]" />
          <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">Inbox</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
              Enquiries
            </h1>
            <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Manage booking requests and messages</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: Mail, color: '#1B3A4C' },
          { label: 'Unread', value: stats.unread, icon: MailOpen, color: '#6B8FAB' },
          { label: 'Replied', value: stats.replied, icon: Reply, color: '#1B3A4C' },
          { label: 'Archived', value: stats.archived, icon: Archive, color: '#6B8FAB' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E3E8ED] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 text-white" style={{ backgroundColor: stat.color }}>
                <stat.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#111] mb-1">{loading ? '—' : stat.value}</p>
            <p className="text-xs uppercase tracking-widest text-[#6B8FAB]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E3E8ED] p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#6B8FAB] mb-3">Search Enquiries</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#E3E8ED]">
                <Search className="w-4 h-4 text-[#6B8FAB]" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border border-[#E3E8ED] text-[#111] placeholder-[#6B8FAB] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold text-[#6B8FAB] mb-3">Filter by Status</label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-[#E3E8ED]">
                <Filter className="w-4 h-4 text-[#6B8FAB]" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-4 py-3 bg-white border border-[#E3E8ED] text-[#111] text-sm focus:outline-none focus:border-[#1B3A4C] transition-colors appearance-none"
              >
                <option value="all">All Enquiries</option>
                <option value="new">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E3E8ED] overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-[#6B8FAB]">Loading enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="text-center py-12 text-[#6B8FAB]">No enquiries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFB] border-b border-[#E3E8ED]">
                  {['Name', 'Type', 'Preview', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-[#6B8FAB] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {filteredEnquiries.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => handleViewEnquiry(e)}
                    className={`hover:bg-[#F8FAFB] cursor-pointer transition-colors ${
                      e.status === 'new' ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {e.status === 'new' && <div className="w-2 h-2 bg-[#1B3A4C] rounded-full flex-shrink-0" />}
                        <span className={`text-sm ${e.status === 'new' ? 'font-semibold text-[#111]' : 'text-[#1B3A4C]'}`}>
                          {e.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        e.type === 'booking' ? 'bg-[#1B3A4C] text-white' : 'bg-[#6B8FAB] text-white'
                      }`}>
                        {e.type === 'booking' ? 'Booking' : 'Message'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#a0a0a0] max-w-xs truncate block">
                        {e.message?.substring(0, 60)}{e.message && e.message.length > 60 ? '...' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-3 py-1 border capitalize ${statusStyles[e.status] || statusStyles.new}`}>
                        {e.status === 'new' ? 'unread' : e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B8FAB]">
                      {formatDate(e.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2" onClick={(ev) => ev.stopPropagation()}>
                        <button
                          onClick={() => handleViewEnquiry(e)}
                          className="p-2 hover:bg-[#E3E8ED] transition-colors text-[#6B8FAB] hover:text-[#1B3A4C]"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(e.id)}
                          className="p-2 hover:bg-red-50 transition-colors text-[#6B8FAB] hover:text-red-500"
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
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <>
          <div
            onClick={() => !isDeleting && setShowDeleteModal(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E3E8ED] max-w-md w-full p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-red-100 p-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-light text-[#111] mb-2">Delete Enquiry?</h3>
                  <p className="text-sm text-[#a0a0a0]">This action cannot be undone. The enquiry will be permanently deleted.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-6 py-3 border border-[#E3E8ED] text-xs uppercase tracking-wider text-[#1B3A4C] hover:bg-[#F8FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-600 text-white text-xs uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showModal && selectedEnquiry && (
        <>
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-[#E3E8ED] max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-[#E3E8ED] p-6 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-light text-[#111] mb-2">{selectedEnquiry.name}</h3>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-sm text-[#1B3A4C] hover:text-[#111] transition-colors"
                  >
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-3 py-1 border capitalize ${statusStyles[selectedEnquiry.status] || statusStyles.new}`}>
                    {selectedEnquiry.status === 'new' ? 'unread' : selectedEnquiry.status}
                  </span>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[#F8FAFB] transition-colors">
                    <X className="w-5 h-5 text-[#6B8FAB]" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEnquiry.clubName && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-1">Club/Venue</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#6B8FAB]" />
                        <p className="text-sm text-[#111]">{selectedEnquiry.clubName}</p>
                      </div>
                    </div>
                  )}
                  {selectedEnquiry.city && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-1">City</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#6B8FAB]" />
                        <p className="text-sm text-[#111]">{selectedEnquiry.city}</p>
                      </div>
                    </div>
                  )}
                  {selectedEnquiry.fee && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-1">Fee</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[#6B8FAB] text-sm font-bold">£</span>
                        <p className="text-sm text-[#111]">{selectedEnquiry.fee}</p>
                      </div>
                    </div>
                  )}
                  {selectedEnquiry.eventDate && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-1">Event Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#6B8FAB]" />
                        <p className="text-sm text-[#111]">{selectedEnquiry.eventDate}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-1">Received</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6B8FAB]" />
                      <p className="text-sm text-[#111]">{formatDateTime(selectedEnquiry.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="pt-4 border-t border-[#E3E8ED]">
                  <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-3">Message</p>
                  <div className="bg-[#F8FAFB] border border-[#E3E8ED] p-4">
                    <p className="text-sm text-[#111] leading-relaxed whitespace-pre-wrap">{selectedEnquiry.message || 'No message provided.'}</p>
                  </div>
                </div>

                {/* Replies */}
                {Array.isArray(selectedEnquiry.replies) && selectedEnquiry.replies.length > 0 && (
                  <div className="pt-4 border-t border-[#E3E8ED]">
                    <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-3">Replies ({selectedEnquiry.replies.length})</p>
                    <div className="space-y-3">
                      {selectedEnquiry.replies.map((reply: any, i: number) => (
                        <div key={i} className="bg-blue-50/50 border border-blue-100 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-[#1B3A4C]">{reply.sentBy || 'Late Night Ricky'}</p>
                            <p className="text-xs text-[#6B8FAB]">
                              {new Date(reply.sentAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <p className="text-xs text-[#6B8FAB] mb-1">Subject: {reply.subject}</p>
                          <p className="text-sm text-[#111] leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Box */}
                <div className="pt-4 border-t border-[#E3E8ED]">
                  <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-3">Reply via Email</p>
                  <input
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full px-4 py-2 bg-white border border-[#E3E8ED] text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C] mb-2"
                  />
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    placeholder="Type your reply..."
                    className="w-full px-4 py-3 bg-white border border-[#E3E8ED] text-sm text-[#111] placeholder-[#6B8FAB] focus:outline-none focus:border-[#1B3A4C] resize-none mb-3"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3A4C] text-white text-xs uppercase tracking-wider hover:bg-[#E3E8ED] transition-colors disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{sendingReply ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t border-[#E3E8ED] p-6 space-y-4">
                {/* Status Actions */}
                <div className="grid grid-cols-3 gap-3">
                  {selectedEnquiry.status === 'new' ? (
                    <button
                      onClick={() => updateStatus(selectedEnquiry.id, 'read')}
                      className="px-4 py-2.5 border border-[#E3E8ED] text-xs uppercase tracking-wider text-[#1B3A4C] hover:bg-[#F8FAFB] transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={14} />
                      <span>Mark Read</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(selectedEnquiry.id, 'new')}
                      className="px-4 py-2.5 border border-[#E3E8ED] text-xs uppercase tracking-wider text-[#1B3A4C] hover:bg-[#F8FAFB] transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail size={14} />
                      <span>Mark Unread</span>
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(selectedEnquiry.id, 'replied')}
                    className="px-4 py-2.5 border border-[#E3E8ED] text-xs uppercase tracking-wider text-[#1B3A4C] hover:bg-[#F8FAFB] transition-colors flex items-center justify-center gap-2"
                  >
                    <Reply size={14} />
                    <span>Replied</span>
                  </button>
                  <button
                    onClick={() => updateStatus(selectedEnquiry.id, 'archived')}
                    className="px-4 py-2.5 border border-[#E3E8ED] text-xs uppercase tracking-wider text-[#1B3A4C] hover:bg-[#F8FAFB] transition-colors flex items-center justify-center gap-2"
                  >
                    <Archive size={14} />
                    <span>Archive</span>
                  </button>
                </div>

                {/* Pipeline */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#6B8FAB] mb-2">Pipeline</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={pipelineLoading === 'quote'}
                      onClick={async () => {
                        setPipelineLoading('quote')
                        try {
                          const res = await fetch(`/api/enquiries/${selectedEnquiry.id}/convert-to-quote`, { method: 'POST' })
                          const data = await res.json()
                          if (res.ok) {
                            showToast('success', `Quote ${data.quoteNumber} created`)
                            setShowModal(false)
                            router.push(`/admin/quotes/${data.quoteId}`)
                          } else {
                            showToast('error', data.error || 'Failed to create quote')
                          }
                        } catch {
                          showToast('error', 'Failed to create quote')
                        } finally {
                          setPipelineLoading('')
                        }
                      }}
                      className="px-4 py-2.5 bg-[#1B3A4C] text-white text-xs uppercase tracking-wider hover:bg-[#E3E8ED] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FileText size={14} />
                      <span>{pipelineLoading === 'quote' ? 'Creating...' : 'Create Quote'}</span>
                    </button>
                    <button
                      disabled={pipelineLoading === 'invoice'}
                      onClick={async () => {
                        setPipelineLoading('invoice')
                        try {
                          const res = await fetch(`/api/enquiries/${selectedEnquiry.id}/convert-to-invoice`, { method: 'POST' })
                          const data = await res.json()
                          if (res.ok) {
                            showToast('success', `Invoice ${data.invoiceNumber} created`)
                            setShowModal(false)
                            router.push(`/admin/invoices/${data.invoiceId}`)
                          } else {
                            showToast('error', data.error || 'Failed to create invoice')
                          }
                        } catch {
                          showToast('error', 'Failed to create invoice')
                        } finally {
                          setPipelineLoading('')
                        }
                      }}
                      className="px-4 py-2.5 bg-[#E3E8ED] text-white text-xs uppercase tracking-wider hover:bg-[#1B3A4C] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Receipt size={14} />
                      <span>{pipelineLoading === 'invoice' ? 'Creating...' : 'Create Invoice'}</span>
                    </button>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => {
                    setShowModal(false)
                    confirmDelete(selectedEnquiry.id)
                  }}
                  className="w-full text-xs uppercase tracking-wider text-[#6B8FAB] hover:text-red-600 transition-colors flex items-center justify-center gap-2 py-2"
                >
                  <Trash2 size={12} />
                  <span>Delete Enquiry</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
