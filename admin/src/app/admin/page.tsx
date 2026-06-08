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
      <div className="mb-10">
        <h1 className="font-serif text-4xl tracking-tight mb-2">Overview</h1>
        <p className="text-white/40 text-sm">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Shows" value={stats.shows} href="/admin/projects" />
        <StatCard label="Tracks" value={stats.tracks} href="/admin/tracks" />
        <StatCard label="Submissions" value={stats.submissions} href="/admin/submissions" />
        <StatCard label="Invoices" value={stats.invoices} href="/admin/invoices" />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="font-serif text-xl mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickAction href="/admin/projects/new" label="New Project" />
            <QuickAction href="/admin/quotes/new" label="New Quote" />
            <QuickAction href="/admin/invoices/new" label="New Invoice" />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="font-serif text-xl mb-4">Recent Submissions</h2>
          <p className="text-white/40 text-sm">Fan uploads awaiting review</p>
          <Link href="/admin/submissions" className="inline-block mt-4 text-sm text-white/60 hover:text-white transition">
            View all →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition group">
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-white/40">{label}</p>
    </Link>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition group"
    >
      <span className="text-sm">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40 group-hover:text-white transition">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
