'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Receipt,
  Users,
  Mail,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  Eye,
  BarChart3,
  Music,
  MessageSquare,
  Send,
} from 'lucide-react'

interface DashboardStats {
  shows: number
  tracks: number
  submissions: number
  invoices: number
  enquiries: number
  quotes: number
  clients: number
  revenue: number
  pendingEnquiries: number
  draftQuotes: number
  unpaidInvoices: number
  recentEnquiries: any[]
  recentQuotes: any[]
  recentSubmissions: any[]
  siteVisits: {
    totalViews: number
    totalUnique: number
    todayViews: number
    todayUnique: number
    daily: { date: string; views: number; uniqueVisitors: number }[]
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount || 0)
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-2">Overview</p>
          <h1 className="text-2xl font-black text-[#111] uppercase tracking-[-0.5px]">Dashboard</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border border-[#E3E8ED] p-5 animate-pulse">
              <div className="h-4 bg-[#E3E8ED] rounded w-16 mb-3" />
              <div className="h-8 bg-[#E3E8ED] rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const s = stats || {
    shows: 0, tracks: 0, submissions: 0, invoices: 0, enquiries: 0,
    quotes: 0, clients: 0, revenue: 0, pendingEnquiries: 0, draftQuotes: 0, unpaidInvoices: 0,
    recentEnquiries: [], recentQuotes: [], recentSubmissions: [],
    siteVisits: { totalViews: 0, totalUnique: 0, todayViews: 0, todayUnique: 0, daily: [] },
  }

  const siteVisits = s.siteVisits || { totalViews: 0, totalUnique: 0, todayViews: 0, todayUnique: 0, daily: [] }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-2">Overview</p>
        <h1 className="text-2xl font-black text-[#111] uppercase tracking-[-0.5px]">Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* Site Visits Today */}
        <div className="bg-white border border-[#E3E8ED] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} className="text-[#6B8FAB]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Visits Today</p>
          </div>
          <p className="text-2xl font-black text-[#111] leading-none">{siteVisits.todayViews}<span className="text-sm font-semibold text-[#6B8FAB] ml-1">views</span></p>
          <p className="text-xs text-[#a0a0a0] mt-1">{siteVisits.todayUnique} unique</p>
        </div>

        {/* Music Submissions */}
        <Link href="/admin/submissions" className="bg-white border border-[#E3E8ED] p-5 hover:border-[#1B3A4C] transition">
          <div className="flex items-center gap-2 mb-3">
            <Music size={14} className="text-[#1B3A4C]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Submissions</p>
          </div>
          <p className="text-2xl font-black text-[#111] leading-none">{s.submissions}</p>
          <p className="text-xs text-[#a0a0a0] mt-1">music tracks</p>
        </Link>

        {/* Enquiries */}
        <Link href="/admin/enquiries" className="bg-white border border-[#E3E8ED] p-5 hover:border-[#1B3A4C] transition relative">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-[#1B3A4C]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Enquiries</p>
          </div>
          <p className="text-2xl font-black text-[#111] leading-none">{s.enquiries}</p>
          <p className="text-xs text-[#a0a0a0] mt-1">total received</p>
          {s.pendingEnquiries > 0 && (
            <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-[#1B3A4C] text-white font-semibold">
              {s.pendingEnquiries} new
            </span>
          )}
        </Link>

        {/* Revenue */}
        <Link href="/admin/invoices" className="bg-white border border-[#E3E8ED] p-5 hover:border-[#1B3A4C] transition">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-[#1B3A4C]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Revenue</p>
          </div>
          <p className="text-2xl font-black text-[#111] leading-none">{formatCurrency(s.revenue)}</p>
          <p className="text-xs text-[#a0a0a0] mt-1">total paid</p>
        </Link>
      </div>

      {/* 30-Day Visits */}
      <div className="bg-white border border-[#E3E8ED] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-[#1B3A4C]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Last 30 Days</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-black text-[#111]">{siteVisits.totalViews.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">views</p>
            </div>
            <div className="w-px h-8 bg-[#E3E8ED]" />
            <div className="text-right">
              <p className="text-lg font-black text-[#111]">{siteVisits.totalUnique.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">unique</p>
            </div>
          </div>
        </div>
        {/* Mini bar chart */}
        <div className="flex items-end gap-[2px] h-16">
          {(siteVisits.daily || []).slice().reverse().map((d, i) => {
            const maxViews = Math.max(...(siteVisits.daily || []).map(x => x.views), 1)
            const height = (d.views / maxViews) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-[#1B3A4C] rounded-sm min-h-[2px] transition-all"
                  style={{ height: `${Math.max(height, 3)}%` }}
                  title={`${d.views} views`}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Business Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Link href="/admin/quotes" className="bg-white border border-[#E3E8ED] p-4 hover:border-[#1B3A4C] transition">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Quotes</p>
            <FileText size={14} className="text-[#a0a0a0]" />
          </div>
          <p className="text-xl font-black text-[#111] mt-2">{s.quotes}</p>
        </Link>
        <Link href="/admin/invoices" className="bg-white border border-[#E3E8ED] p-4 hover:border-[#1B3A4C] transition">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Invoices</p>
            <Receipt size={14} className="text-[#a0a0a0]" />
          </div>
          <p className="text-xl font-black text-[#111] mt-2">{s.invoices}</p>
        </Link>
        <Link href="/admin/clients" className="bg-white border border-[#E3E8ED] p-4 hover:border-[#1B3A4C] transition">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Clients</p>
            <Users size={14} className="text-[#a0a0a0]" />
          </div>
          <p className="text-xl font-black text-[#111] mt-2">{s.clients}</p>
        </Link>
        <Link href="/admin/tracks" className="bg-white border border-[#E3E8ED] p-4 hover:border-[#1B3A4C] transition">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Tracks</p>
            <Music size={14} className="text-[#a0a0a0]" />
          </div>
          <p className="text-xl font-black text-[#111] mt-2">{s.tracks}</p>
        </Link>
      </div>

      {/* Bottom Row: Recent Enquiries + Submissions */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Recent Enquiries */}
        <div className="bg-white border border-[#E3E8ED] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Recent Enquiries</p>
            <Link href="/admin/enquiries" className="text-[11px] text-[#1B3A4C] font-semibold uppercase tracking-wider hover:underline">View all</Link>
          </div>
          {s.recentEnquiries.length === 0 ? (
            <p className="text-sm text-[#a0a0a0] py-6 text-center">No enquiries yet</p>
          ) : (
            <div className="space-y-2">
              {s.recentEnquiries.slice(0, 5).map((e) => (
                <Link
                  key={e.id}
                  href="/admin/enquiries"
                  className="flex items-center gap-3 p-3 hover:bg-[#FAFBFC] transition"
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.status === 'new' ? 'bg-[#1B3A4C]' : 'bg-[#6B8FAB]/40'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111] truncate">{e.name}</p>
                    <p className="text-xs text-[#a0a0a0] truncate">{e.message?.substring(0, 40) || 'No message'}</p>
                  </div>
                  <span className="text-[10px] text-[#a0a0a0] flex-shrink-0">{formatDate(e.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white border border-[#E3E8ED] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Recent Submissions</p>
            <Link href="/admin/submissions" className="text-[11px] text-[#1B3A4C] font-semibold uppercase tracking-wider hover:underline">View all</Link>
          </div>
          {(s.recentSubmissions || []).length === 0 ? (
            <p className="text-sm text-[#a0a0a0] py-6 text-center">No submissions yet</p>
          ) : (
            <div className="space-y-2">
              {(s.recentSubmissions || []).slice(0, 5).map((sub) => (
                <Link
                  key={sub.id}
                  href="/admin/submissions"
                  className="flex items-center gap-3 p-3 hover:bg-[#FAFBFC] transition"
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sub.status === 'new' ? 'bg-[#1B3A4C]' : 'bg-[#6B8FAB]/40'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111] truncate">{sub.trackTitle || sub.artistName || 'Unknown'}</p>
                    <p className="text-xs text-[#a0a0a0] truncate">{sub.artistName || sub.email}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-[#E3E8ED] text-[#1B3A4C]">{sub.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quotes Table */}
      {s.recentQuotes && s.recentQuotes.length > 0 && (
        <div className="bg-white border border-[#E3E8ED] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Recent Quotes</p>
            <Link href="/admin/quotes" className="text-[11px] text-[#1B3A4C] font-semibold uppercase tracking-wider hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8ED]">
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B8FAB] uppercase tracking-widest">Quote</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B8FAB] uppercase tracking-widest">Client</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold text-[#6B8FAB] uppercase tracking-widest">Total</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B8FAB] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {s.recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-[#FAFBFC]">
                    <td className="px-3 py-3">
                      <Link href={`/admin/quotes/${q.id}`} className="font-medium text-[#1B3A4C] hover:underline">
                        {q.quoteNumber || `QT-${String(q.id).padStart(3, '0')}`}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-[#a0a0a0]">{q.clientName || '-'}</td>
                    <td className="px-3 py-3 text-right font-semibold text-[#111]">{formatCurrency(q.total)}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        q.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        q.status === 'sent' ? 'bg-[#1B3A4C1a] text-[#1B3A4C]' :
                        q.status === 'accepted' ? 'bg-green-50 text-green-700' :
                        q.status === 'approved' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}