'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    shows: 0,
    tracks: 0,
    submissions: 0,
    invoices: 0,
  });

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Overview</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">
          Dashboard
        </h1>
        <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard label="Shows" value={stats.shows} href="/admin/projects" />
        <StatCard label="Tracks" value={stats.tracks} href="/admin/tracks" />
        <StatCard label="Submissions" value={stats.submissions} href="/admin/submissions" />
        <StatCard label="Invoices" value={stats.invoices} href="/admin/invoices" />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#A3B5C4]/30 p-8">
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Quick Actions</p>
          <div className="space-y-3">
            <QuickAction href="/admin/projects/new" label="New Project" />
            <QuickAction href="/admin/quotes/new" label="New Quote" />
            <QuickAction href="/admin/invoices/new" label="New Invoice" />
          </div>
        </div>

        <div className="bg-white border border-[#A3B5C4]/30 p-8">
          <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Recent Submissions</p>
          <p className="text-sm text-[#5B7A8E] font-semibold uppercase tracking-[0.5px]">Fan uploads awaiting review</p>
          <Link href="/admin/submissions" className="inline-block mt-6 text-[13px] text-[#1B3A4C] font-semibold uppercase tracking-[1.5px] hover:underline">
            View all →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="bg-white border border-[#A3B5C4]/30 p-6 hover:border-[#1B3A4C] transition group">
      <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">{value}</p>
      <p className="text-xs text-[#6B8FAB] mt-2 tracking-[2px] uppercase font-semibold">{label}</p>
    </Link>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-6 py-4 border-2 border-[#1B3A4C]/20 rounded-full text-[13px] text-[#1B3A4C] font-semibold uppercase tracking-[1.5px] hover:border-[#1B3A4C] hover:bg-[#1B3A4C] hover:text-white transition group"
    >
      <span>{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6B8FAB] group-hover:text-white transition">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
