"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navGroups = [
  {
    label: "Content",
    items: [
      { label: "Home Page", href: "/admin/pages/home" },
      { label: "About Page", href: "/admin/pages/about" },
      { label: "Showreel", href: "/admin/pages/showreel" },
      { label: "Contact", href: "/admin/pages/contact" },
    ],
  },
  {
    label: "Global",
    items: [
      { label: "Nav & Logo", href: "/admin/global/nav" },
      { label: "SEO", href: "/admin/global/seo" },
    ],
  },
  {
    label: "Media",
    items: [
      { label: "Media Library", href: "/admin/media" },
      { label: "Submissions", href: "/admin/submissions" },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Clients", href: "/admin/clients" },
      { label: "Projects", href: "/admin/projects" },
      { label: "Quotes", href: "/admin/quotes" },
      { label: "Invoices", href: "/admin/invoices" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Login page is NOT wrapped in this layout — handled by conditional below
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#1B3A4C]/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#1B3A4C] text-white flex-shrink-0 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-[#2A2E36] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight font-serif">Late Night Ricky</h2>
            <p className="text-xs text-[#8FA3B3] mt-0.5 font-medium uppercase tracking-widest">Admin Panel</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[#8FA3B3] hover:text-white"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors ${
              pathname === "/admin"
                ? "bg-[#111318]/10 text-white"
                : "text-[#8FA3B3] hover:text-white hover:bg-[#111318]/5"
            }`}
          >
            Dashboard
          </Link>
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5A6A7A] mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors ${
                      pathname === item.href
                        ? "bg-[#111318]/10 text-white"
                        : "text-[#8FA3B3] hover:text-white hover:bg-[#111318]/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-[#2A2E36]">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="w-full px-3 py-2 text-sm font-semibold text-[#8FA3B3] hover:text-white uppercase tracking-wide transition-colors text-left rounded-lg hover:bg-[#111318]/5"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-[#1B3A4C] text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-white">
            <MenuIcon className="w-6 h-6" />
          </button>
          <span className="font-serif font-semibold text-sm">Late Night Ricky</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
