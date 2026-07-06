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
  if (!date) return '—'
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
        <div className="mb-12">
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Overview</p>
          <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Dashboard</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#6B8FAB]/30 p-6 animate-pulse">
              <div className="h-10 bg-[#E3E8ED] rounded mb-2" />
              <div className="h-3 bg-[#E3E8ED] rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const s = stats || {
    shows: 0, tracks: 0, submissions: 0, invoices: 0, enquiries: 0,
    quotes: 0, clients: 0, revenue: 0, pendingEnquiries: 0, draftQuotes: 0, unpaidInvoices: 0,
    recentEnquiries: [], recentQuotes: [],
    siteVisits: { totalViews: 0, totalUnique: 0, todayViews: 0, todayUnique: 0, daily: [] },
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Overview</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Dashboard</h1>
        <p className="text-sm text-[#a0a0a0] mt-4 font-semibold uppercase tracking-[0.5px]">Welcome back bro. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Quotes"
          value={s.quotes}
          href="/admin/quotes"
          icon={FileText}
          color="#1B3A4C"
        />
        <StatCard
          label="Invoices"
          value={s.invoices}
          href="/admin/invoices"
          icon={Receipt}
          color="#E3E8ED"
        />
        <StatCard
          label="Clients"
          value={s.clients}
          href="/admin/clients"
          icon={Users}
          color="#6B8FAB"
        />
        <StatCard
          label="Enquiries"
          value={s.enquiries}
          href="/admin/enquiries"
          icon={Mail}
          color="#1B3A4C"
          badge={s.pendingEnquiries > 0 ? s.pendingEnquiries : undefined}
        />
      </div>

      {/* Site Visits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E3E8ED] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-[#6B8FAB]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Today</p>
          </div>
          <p className="text-[clamp(24px,3vw,36px)] font-black text-[#111] leading-none mb-1">{s.siteVisits.todayViews}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">page views</p>
        </div>
        <div className="bg-white border border-[#E3E8ED] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-[#6B8FAB]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">Today</p>
          </div>
          <p className="text-[clamp(24px,3vw,36px)] font-black text-[#111] leading-none mb-1">{s.siteVisits.todayUnique}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">unique visitors</p>
        </div>
        <div className="bg-white border border-[#E3E8ED] p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-[#1B3A4C]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">30 Days</p>
          </div>
          <p className="text-[clamp(24px,3vw,36px)] font-black text-[#111] leading-none mb-1">{s.siteVisits.totalViews.toLocaleString()}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">total views</p>
        </div>
        <div className="bg-white border border-[#E3E8ED] p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-[#1B3A4C]" />
            <p className="text-[10px] uppercase tracking-[2px] text-[#6B8FAB] font-semibold">30 Days</p>
          </div>
          <p className="text-[clamp(24px,3vw,36px)] font-black text-[#111] leading-none mb-1">{s.siteVisits.totalUnique.toLocaleString()}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">unique visitors</p>
        </div>
      </div>

      {/* Revenue + Pending */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {/* Revenue Card */}
        <Link
          href="/admin/invoices"
          className="bg-[#E3E8ED] p-6 text-white hover:bg-[#1B3A4C] transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/10">
              <TrendingUp size={18} className="text-[#C5E5F8]" />
            </div>
            <ArrowRight size={16} className="text-[#C5E5F8] group-hover:text-white transition" />
          </div>
          <p className="text-[clamp(24px,3vw,36px)] font-black leading-none mb-2">{formatCurrency(s.revenue)}</p>
          <p className="text-xs uppercase tracking-widest text-[#C5E5F8]">Total Revenue</p>
        </Link>

        {/* Pending Enquiries */}
        <Link
          href="/admin/enquiries?status=new"
          className={`p-6 border transition group ${
            s.pendingEnquiries > 0 ? 'bg-white border-[#1B3A4C]' : 'bg-white border-[#E3E8ED]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 ${s.pendingEnquiries > 0 ? 'bg-[#1B3A4C] text-white' : 'bg-[#E3E8ED] text-[#6B8FAB]'}`}>
              <AlertCircle size={18} />
            </div>
            {s.pendingEnquiries > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                {s.pendingEnquiries} new
              </span>
            )}
          </div>
          <p className="text-[clamp(24px,3vw,36px)] font-black text-[#111] leading-none mb-2">{s.pendingEnquiries}</p>
          <p className="text-xs uppercase tracking-widest text-[#6B8FAB]">Pending Enquiries</p>
        </Link>

        {/* Draft Quotes */}
        <Link
          href="/admin/quotes"
          className="bg-white border border-[#E3E8ED] p-6 hover:border-[#1B3A4C] transition group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-[#E3E8ED] text-[#6B8FAB] group-hover:bg-[#1B3A4C] group-hover:text-white transition">
              <Clock size={18} />
            </div>
            <ArrowRight size={16} className="text-[#6B8FAB] group-hover:text-[#1B3A4C] transition" />
          </div>
          <p className="text-[clamp(24px,3vw,36px)] font-black text-[#111] leading-none mb-2">{s.draftQuotes}</p>
          <p className="text-xs uppercase tracking-widest text-[#6B8FAB]">Draft Quotes</p>
        </Link>
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white border border-[#E3E8ED] p-6">
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Quick Actions</p>
          <div className="space-y-3">
            <QuickAction href="/admin/quotes/new" label="New Quote" icon={FileText} />
            <QuickAction href="/admin/invoices/new" label="New Invoice" icon={Receipt} />
            <QuickAction href="/admin/clients" label="Add Client" icon={Users} />
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white border border-[#E3E8ED] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Recent Enquiries</p>
            <Link href="/admin/enquiries" className="text-xs text-[#1B3A4C] hover:underline">View all →</Link>
          </div>
          {s.recentEnquiries.length === 0 ? (
            <p className="text-sm text-[#6B8FAB] py-4">No enquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {s.recentEnquiries.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/enquiries`}
                  className="flex items-center gap-3 p-3 hover:bg-[#F8FAFB] transition group"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.status === 'new' ? 'bg-[#1B3A4C]' : 'bg-[#6B8FAB]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111] truncate">{e.name}</p>
                    <p className="text-xs text-[#6B8FAB] truncate">{e.message?.substring(0, 50) || 'No message'}</p>
                  </div>
                  <span className="text-xs text-[#6B8FAB] flex-shrink-0">{formatDate(e.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Quotes */}
      {s.recentQuotes.length > 0 && (
        <div className="mt-6 bg-white border border-[#E3E8ED] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">Recent Quotes</p>
            <Link href="/admin/quotes" className="text-xs text-[#1B3A4C] hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8ED]">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B8FAB] uppercase tracking-widest">Quote</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B8FAB] uppercase tracking-widest">Client</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B8FAB] uppercase tracking-widest">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B8FAB] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8ED]">
                {s.recentQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-[#F8FAFB]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/quotes/${q.id}`} className="font-medium text-[#1B3A4C] hover:underline">
                        {q.quoteNumber || `QT-${String(q.id).padStart(3, '0')}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#a0a0a0]">{q.clientName || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#111]">{formatCurrency(q.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        q.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        q.status === 'sent' ? 'bg-[#1B3A4C1a] text-[#1B3A4C]' :
                        q.status === 'accepted' ? 'bg-green-50 text-green-700' :
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

function StatCard({ label, value, href, icon: Icon, color, badge }: {
  label: string
  value: number
  href: string
  icon: any
  color: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#E3E8ED] p-6 hover:border-[#1B3A4C] transition group relative"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 text-white" style={{ backgroundColor: color }}>
          <Icon size={18} />
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
            {badge} new
          </span>
        )}
      </div>
      <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">{value}</p>
      <p className="text-xs text-[#6B8FAB] mt-2 tracking-[2px] uppercase font-semibold">{label}</p>
    </Link>
  )
}

function QuickAction({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-6 py-4 border-2 border-[#1B3A4C]/20 rounded-full text-[13px] text-[#1B3A4C] font-semibold uppercase tracking-[1.5px] hover:border-[#1B3A4C] hover:bg-[#1B3A4C] hover:text-white transition group"
    >
      <span className="flex items-center gap-2">
        <Icon size={16} />
        {label}
      </span>
      <ArrowRight size={16} className="text-[#6B8FAB] group-hover:text-white transition" />
    </Link>
  )
}
