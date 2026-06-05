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

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const quickActions = [
    { label: "New Booking", href: "/admin/projects", icon: Plus },
    { label: "Send Quote", href: "/admin/quotes", icon: Send },
    { label: "New Invoice", href: "/admin/invoices", icon: FileText },
    { label: "Check Submissions", href: "/admin/submissions", icon: Music },
    { label: "Edit Home Page", href: "/admin/pages/home", icon: Edit },
    { label: "Manage Shows", href: "/admin/shows", icon: Eye },
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
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-[#5c7a94] uppercase tracking-wide hover:underline flex items-center gap-1"
            >
              View Pipeline <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <p className="text-[#999] text-center py-8">Loading...</p>
          ) : data.upcomingGigsList.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-[#999]">No upcoming gigs scheduled</p>
              <Link
                href="/admin/projects"
                className="inline-block mt-3 px-4 py-2 bg-[#5c7a94] text-white text-xs font-semibold rounded-md uppercase tracking-wide hover:opacity-90 transition-opacity"
              >
                Add a Booking
              </Link>
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
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-serif text-lg font-semibold text-[#1a1a1a] tracking-tight mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
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
    </div>
  );
}