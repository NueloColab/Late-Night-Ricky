"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  sections: number;
  assets: number;
  submissions: number;
  projects: number;
  pendingProjects: number;
  lastUpdated: { page: string; section: string; updatedAt: string } | null;
}

const PAGE_URLS: Record<string, string> = {
  home: "/",
  about: "/about",
  showreel: "/showreel",
  contact: "/contact",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    sections: 0,
    assets: 0,
    submissions: 0,
    projects: 0,
    pendingProjects: 0,
    lastUpdated: null,
  });

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setStats(data));
  }, []);

  const statCards = [
    { label: "Sections", value: stats.sections, href: "/admin/pages/home", icon: LayoutIcon },
    { label: "Assets", value: stats.assets, href: "/admin/media", icon: ImageIcon },
    { label: "Submissions", value: stats.submissions, href: "/admin/submissions", icon: MusicIcon },
    { label: "Projects", value: stats.projects, href: "/admin/projects", icon: BriefcaseIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-white tracking-tight">Dashboard</h1>
        <p className="text-[#8FA3B3] mt-2 text-sm font-medium tracking-wide uppercase">Site overview & quick actions</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-[#111318] p-6 rounded-2xl border border-[#2A2E36] hover:border-[#8FA8BE] hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <stat.icon className="w-6 h-6 text-[#8FA3B3] group-hover:text-white transition-colors" />
              <span className="text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-4xl font-bold text-white">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Last updated + pending */}
        <div className="lg:col-span-2 bg-[#111318] rounded-2xl p-6 border border-[#2A2E36]">
          <h2 className="font-serif text-lg font-semibold text-white mb-4 tracking-tight">Recent Activity</h2>
          <div className="space-y-4">
            {stats.lastUpdated ? (
              <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white">Last updated: <span className="capitalize">{stats.lastUpdated.section}</span> on <span className="capitalize">{stats.lastUpdated.page}</span></p>
                  <p className="text-xs text-[#8FA3B3] mt-0.5">{new Date(stats.lastUpdated.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/pages/${stats.lastUpdated.page}`}
                    className="px-4 py-2 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors"
                  >
                    Edit
                  </Link>
                  {PAGE_URLS[stats.lastUpdated.page] && (
                    <a
                      href={PAGE_URLS[stats.lastUpdated.page]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border-2 border-[#1B3A4C] text-white rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-[#1B3A4C] hover:text-white transition-colors"
                    >
                      View Site
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[#8FA3B3] text-sm">No edits yet.</p>
            )}

            {stats.pendingProjects > 0 && (
              <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white">{stats.pendingProjects} pending project{stats.pendingProjects !== 1 ? "s" : ""}</p>
                  <p className="text-xs text-[#8FA3B3] mt-0.5">Awaiting payment or completion</p>
                </div>
                <Link
                  href="/admin/projects"
                  className="px-4 py-2 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors"
                >
                  View Pipeline
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#111318] rounded-2xl p-6 border border-[#2A2E36]">
          <h2 className="font-serif text-lg font-semibold text-white mb-4 tracking-tight">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Edit Home", href: "/admin/pages/home" },
              { label: "Edit About", href: "/admin/pages/about" },
              { label: "Media Library", href: "/admin/media" },
              { label: "New Project", href: "/admin/projects" },
              { label: "View Submissions", href: "/admin/submissions" },
              { label: "New Quote", href: "/admin/quotes" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="block px-4 py-3 bg-[#0A0A0A] rounded-xl text-sm font-semibold text-white hover:bg-[#1B3A4C] hover:text-white transition-colors uppercase tracking-wide"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}
