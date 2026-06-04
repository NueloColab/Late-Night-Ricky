"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    sections: 0,
    assets: 0,
    submissions: 0,
    projects: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => setStats(data));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1B3A4C] tracking-tight">Dashboard</h1>
        <p className="text-[#8FA8BE] mt-1 text-sm font-medium tracking-wide uppercase">Site overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Sections", value: stats.sections, href: "/admin/pages/home" },
          { label: "Assets", value: stats.assets, href: "/admin/media" },
          { label: "Submissions", value: stats.submissions, href: "/admin/submissions" },
          { label: "Projects", value: stats.projects, href: "/admin/projects" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-4xl font-bold text-[#1B3A4C]">{stat.value}</p>
            <p className="text-xs text-[#8FA8BE] mt-2 font-semibold uppercase tracking-widest">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1B3A4C] mb-4 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Edit Home", href: "/admin/pages/home" },
            { label: "Edit About", href: "/admin/pages/about" },
            { label: "Media Library", href: "/admin/media" },
            { label: "New Project", href: "/admin/projects" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="px-4 py-3 bg-[#E3E8ED] rounded-lg text-sm font-semibold text-[#1B3A4C] text-center hover:bg-[#1B3A4C] hover:text-white transition-colors uppercase tracking-wide"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
