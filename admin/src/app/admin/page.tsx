"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  PoundSterling,
  FileText,
  Music,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Send,
  Edit,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface UpcomingGig {
  id: number;
  title: string;
  venue: string | null;
  eventDate: string | null;
  type: string;
  fee: number | null;
  status: string;
}

interface ActivityItem {
  page: string;
  section: string;
  updatedAt: string | null;
}

interface DashboardData {
  upcomingGigs: number;
  upcomingGigsList: UpcomingGig[];
  revenueThisMonth: number;
  unpaidInvoices: number;
  unpaidTotal: number;
  newSubmissions: number;
  lastUpdated: ActivityItem[];
}

const TYPE_OPTIONS = [
  { value: "dj-booking", label: "DJ Booking" },
  { value: "production", label: "Production" },
  { value: "remix", label: "Remix" },
  { value: "mix-podcast", label: "Mix / Podcast" },
  { value: "partnership", label: "Brand Partnership" },
  { value: "livestream", label: "Live Stream" },
  { value: "consulting", label: "Consulting" },
  { value: "album-release", label: "Album Release" },
  { value: "track-release", label: "Track / Single" },
];

const TYPE_LABELS: Record<string, string> = {
  "dj-booking": "DJ Booking",
  "album-release": "Album Release",
  "track-release": "Track/Single",
  remix: "Remix",
  "mix-podcast": "Mix/Podcast",
  partnership: "Partnership",
  livestream: "Live Stream",
  consulting: "Consulting",
  production: "Production",
};

const STATUS_COLOURS: Record<string, string> = {
  inquiry: "bg-[#f8f7f6] text-[#666]",
  quoted: "bg-[#5c7a94]/10 text-[#5c7a94]",
  approved: "bg-[#91715c]/10 text-[#91715c]",
  "in-progress": "bg-[#5c7a94]/10 text-[#5c7a94]",
  completed: "bg-[#91715c]/10 text-[#91715c]",
  invoiced: "bg-[#5c7a94]/10 text-[#5c7a94]",
  paid: "bg-[#2d6a2d]/10 text-[#2d6a2d]",
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    upcomingGigs: 0,
    upcomingGigsList: [],
    revenueThisMonth: 0,
    unpaidInvoices: 0,
    unpaidTotal: 0,
    newSubmissions: 0,
    lastUpdated: [],
  });
  const [loading, setLoading] = useState(true);
  const [showGigModal, setShowGigModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Gig form state
  const [gigForm, setGigForm] = useState({
    title: "",
    type: "dj-booking",
    venue: "",
    eventDate: "",
    fee: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateGig(e: React.FormEvent) {
    e.preventDefault();
    if (!gigForm.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: gigForm.title,
          type: gigForm.type,
          venue: gigForm.venue || null,
          eventDate: gigForm.eventDate || null,
          fee: gigForm.fee ? Number(gigForm.fee) : null,
          status: "inquiry",
        }),
      });
      if (res.ok) {
        setShowGigModal(false);
        setGigForm({ title: "", type: "dj-booking", venue: "", eventDate: "", fee: "" });
        // Refresh data
        const fresh = await fetch("/api/dashboard/stats").then((r) => r.json());
        setData(fresh);
      }
    } catch (err) {
      console.error("Failed to create gig:", err);
    }
    setSaving(false);
  }

  // Calendar helpers
  function getCalendarDays(year: number, month: number): { date: Date | null; isCurrentMonth: boolean }[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start
    const days: { date: Date | null; isCurrentMonth: boolean }[] = [];

    // Previous month filler
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month filler to complete grid
    const remaining = 42 - days.length; // 6 rows x 7 cols
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }

  function getGigsForDate(date: Date): UpcomingGig[] {
    const dateStr = date.toISOString().split("T")[0];
    return data.upcomingGigsList.filter((g) => {
      if (!g.eventDate) return false;
      return g.eventDate === dateStr;
    });
  }

  const calendarDays = getCalendarDays(calendarMonth.year, calendarMonth.month);
  const today = new Date().toISOString().split("T")[0];

  const statCards = [
    {
      label: "Upcoming Gigs",
      value: loading ? "-" : String(data.upcomingGigs),
      icon: Calendar,
      colour: "bg-[#5c7a94]",
      href: "/admin/projects",
    },
    {
      label: "Revenue This Month",
      value: loading ? "-" : gbp.format(data.revenueThisMonth),
      icon: PoundSterling,
      colour: "bg-[#2d6a2d]",
      href: "/admin/invoices",
    },
    {
      label: "Unpaid Invoices",
      value: loading ? "-" : `${data.unpaidInvoices} (${gbp.format(data.unpaidTotal)})`,
      icon: FileText,
      colour: "bg-[#91715c]",
      href: "/admin/invoices",
    },
    {
      label: "New Submissions",
      value: loading ? "-" : String(data.newSubmissions),
      icon: Music,
      colour: "bg-[#1a1a1a]",
      href: "/admin/submissions",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#91715c]"></div>
          <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Dashboard</p>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1a1a] tracking-tight">
          Welcome back, Ricky
        </h1>
        <p className="text-sm text-[#666] mt-1">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-white border border-gray-200 p-5 rounded-xl hover:border-[#5c7a94] hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 ${stat.colour} text-white rounded-lg`}>
                <stat.icon size={16} />
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-[#5c7a94] transition-colors" />
            </div>
            <p className="text-2xl font-serif font-semibold text-[#1a1a1a]">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Gigs - 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#1a1a1a] tracking-tight">Upcoming Gigs</h2>
              <p className="text-xs text-[#999] mt-0.5">{data.upcomingGigs} upcoming</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGigModal(true)}
                className="px-4 py-2 bg-[#5c7a94] text-white text-xs font-semibold rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Plus size={14} />
                Add Gig
              </button>
              <Link
                href="/admin/projects"
                className="text-xs font-semibold text-[#5c7a94] uppercase tracking-wide hover:underline flex items-center gap-1"
              >
                View Pipeline <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="text-[#999] text-center py-8">Loading...</p>
          ) : data.upcomingGigsList.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-[#999]">No upcoming gigs scheduled</p>
              <button
                onClick={() => setShowGigModal(true)}
                className="inline-block mt-3 px-4 py-2 bg-[#5c7a94] text-white text-xs font-semibold rounded-md uppercase tracking-wide hover:opacity-90 transition-opacity"
              >
                Add a Booking
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingGigsList.map((gig) => (
                <Link
                  key={gig.id}
                  href={`/admin/projects/${gig.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-[#5c7a94]/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[48px]">
                      {gig.eventDate ? (
                        <>
                          <p className="text-xs font-semibold text-[#5c7a94] uppercase">
                            {new Date(gig.eventDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" })}
                          </p>
                          <p className="text-lg font-serif font-semibold text-[#1a1a1a]">
                            {new Date(gig.eventDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric" })}
                          </p>
                          <p className="text-[10px] text-[#999] uppercase">
                            {new Date(gig.eventDate + "T00:00:00").toLocaleDateString("en-GB", { month: "short" })}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-[#999]">TBC</p>
                      )}
                    </div>
                    <div className="border-l border-gray-200 pl-4">
                      <p className="text-sm font-semibold text-[#1a1a1a]">{gig.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {gig.venue && (
                          <span className="text-xs text-[#666] flex items-center gap-1">
                            <MapPin size={11} /> {gig.venue}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${STATUS_COLOURS[gig.status] || "bg-gray-100 text-gray-600"}`}>
                          {TYPE_LABELS[gig.type] || gig.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {gig.fee ? (
                      <p className="text-sm font-serif font-semibold text-[#91715c]">{gbp.format(gig.fee)}</p>
                    ) : (
                      <p className="text-xs text-[#999]">No fee set</p>
                    )}
                    <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-[#5c7a94] transition-colors mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions sidebar - 1/3 width */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-serif text-lg font-semibold text-[#1a1a1a] tracking-tight mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "New Booking", href: "/admin/projects", icon: Plus },
                { label: "Send Quote", href: "/admin/quotes", icon: Send },
                { label: "New Invoice", href: "/admin/invoices", icon: FileText },
                { label: "Check Submissions", href: "/admin/submissions", icon: Music },
                { label: "Edit Home Page", href: "/admin/pages/home", icon: Edit },
                { label: "Manage Shows", href: "/admin/shows", icon: Eye },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl text-sm font-semibold text-[#1a1a1a] hover:bg-[#5c7a94] hover:text-white transition-colors uppercase tracking-wide"
                >
                  <action.icon size={16} />
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-[#1a1a1a] tracking-tight">
                {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const m = calendarMonth.month === 0 ? 11 : calendarMonth.month - 1;
                    const y = calendarMonth.month === 0 ? calendarMonth.year - 1 : calendarMonth.year;
                    setCalendarMonth({ year: y, month: m });
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={16} className="text-[#666]" />
                </button>
                <button
                  onClick={() => {
                    const m = calendarMonth.month === 11 ? 0 : calendarMonth.month + 1;
                    const y = calendarMonth.month === 11 ? calendarMonth.year + 1 : calendarMonth.year;
                    setCalendarMonth({ year: y, month: m });
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={16} className="text-[#666]" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px text-center">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-[10px] uppercase tracking-wider text-[#999] font-medium pb-2">
                  {d}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                if (!day.date) return <div key={idx} />;
                const dateStr = day.date.toISOString().split("T")[0];
                const isToday = dateStr === today;
                const gigs = getGigsForDate(day.date);
                const hasGigs = gigs.length > 0;
                return (
                  <Link
                    key={idx}
                    href={hasGigs ? `/admin/projects/${gigs[0].id}` : "#"}
                    className={`relative p-1.5 min-h-[36px] text-sm rounded-lg transition-colors ${
                      !day.isCurrentMonth
                        ? "text-[#ccc]"
                        : isToday
                        ? "bg-[#5c7a94] text-white font-bold"
                        : hasGigs
                        ? "bg-[#91715c]/10 text-[#91715c] font-semibold hover:bg-[#91715c]/20"
                        : "text-[#1a1a1a] hover:bg-gray-50"
                    } ${!hasGigs && day.isCurrentMonth ? "cursor-default" : ""}`}
                  >
                    {day.date.getDate()}
                    {hasGigs && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {gigs.slice(0, 3).map((_, i) => (
                          <span key={i} className="w-1 h-1 rounded-full bg-[#91715c]" />
                        ))}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            {data.upcomingGigsList.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] uppercase tracking-widest text-[#999] font-medium mb-2">This month</p>
                <div className="space-y-1">
                  {data.upcomingGigsList
                    .filter((g) => {
                      if (!g.eventDate) return false;
                      const d = new Date(g.eventDate + "T00:00:00");
                      return d.getMonth() === calendarMonth.month && d.getFullYear() === calendarMonth.year;
                    })
                    .slice(0, 4)
                    .map((gig) => (
                      <Link
                        key={gig.id}
                        href={`/admin/projects/${gig.id}`}
                        className="flex items-center justify-between py-1 hover:bg-gray-50 rounded px-1 -mx-1 transition-colors"
                      >
                        <span className="text-xs text-[#1a1a1a] truncate">{gig.title}</span>
                        <span className="text-[10px] text-[#999] ml-2 flex-shrink-0">
                          {gig.eventDate ? new Date(gig.eventDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "TBC"}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {data.lastUpdated && data.lastUpdated.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-serif text-lg font-semibold text-[#1a1a1a] tracking-tight mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {data.lastUpdated.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#5c7a94]/10 rounded">
                    <Edit size={14} className="text-[#5c7a94]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      <span className="capitalize">{item.section}</span> on{" "}
                      <span className="capitalize">{item.page}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.updatedAt && (
                    <span className="text-xs text-[#999] flex items-center gap-1">
                      <Clock size={11} /> {timeAgo(item.updatedAt)}
                    </span>
                  )}
                  <Link
                    href={`/admin/pages/${item.page}`}
                    className="text-xs font-semibold text-[#5c7a94] uppercase tracking-wide hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Gig Modal */}
      {showGigModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGigModal(false)}>
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#1a1a1a] tracking-tight">Add Gig</h2>
                  <p className="text-xs text-[#999] mt-1">Quick add a booking to your pipeline</p>
                </div>
                <button onClick={() => setShowGigModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={18} className="text-[#666]" />
                </button>
              </div>

              <form onSubmit={handleCreateGig} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={gigForm.title}
                    onChange={(e) => setGigForm({ ...gigForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c7a94] transition-colors"
                    placeholder="e.g. Private Party at Mahiki"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-1.5">Type</label>
                    <select
                      value={gigForm.type}
                      onChange={(e) => setGigForm({ ...gigForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c7a94] transition-colors"
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-1.5">Event Date</label>
                    <input
                      type="date"
                      value={gigForm.eventDate}
                      onChange={(e) => setGigForm({ ...gigForm, eventDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c7a94] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-1.5">Venue</label>
                    <input
                      type="text"
                      value={gigForm.venue}
                      onChange={(e) => setGigForm({ ...gigForm, venue: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c7a94] transition-colors"
                      placeholder="Club name, city"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] uppercase tracking-widest mb-1.5">Fee (£)</label>
                    <input
                      type="number"
                      value={gigForm.fee}
                      onChange={(e) => setGigForm({ ...gigForm, fee: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c7a94] transition-colors"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowGigModal(false)}
                    className="px-5 py-2.5 border border-gray-200 text-[#1a1a1a] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#5c7a94] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Add Gig"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}