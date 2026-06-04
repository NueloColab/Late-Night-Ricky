"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Mail,
  Quote,
  Receipt,
  Users,
  Image as ImageIcon,
  PenTool,
  Settings,
  LogOut,
  Music,
  FolderOpen,
} from "lucide-react";

const mainMenuItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Submissions", href: "/admin/submissions", icon: Mail },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Quotes", href: "/admin/quotes", icon: Quote },
  { label: "Invoices", href: "/admin/invoices", icon: Receipt },
  { label: "Clients", href: "/admin/clients", icon: Users },
];

const bottomMenuItems = [
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Shows", href: "/admin/shows", icon: Music },
  { label: "Content", href: "/admin/content", icon: PenTool },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto flex-shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <Link href="/admin" className="mb-8 pt-6 px-6" onClick={() => setMobileOpen(false)}>
          <h2 className="font-serif text-2xl font-light text-[#1a1a1a] tracking-tight">Late Night Ricky</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-6 h-px bg-black"></div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Admin Portal</p>
            <div className="w-6 h-px bg-black"></div>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 px-4">
          <div className="space-y-1 mb-8">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-black text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom section in separated box - matching Nuelo */}
          <div className="bg-gray-50 border border-gray-200 p-3 space-y-1">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-black text-white font-medium"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={16} />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Divider */}
        <div className="px-6 my-4 border-t border-gray-200" />

        {/* Logout */}
        <div className="px-4 mb-4">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0 z-30 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <MenuIcon className="w-5 h-5 text-gray-700" />
            </button>
            <span className="font-serif font-semibold text-sm text-[#1a1a1a]">Late Night Ricky</span>
            <div className="w-9" />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            <div className="p-6 md:p-8 lg:p-10">{children}</div>
          </div>
        </div>
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