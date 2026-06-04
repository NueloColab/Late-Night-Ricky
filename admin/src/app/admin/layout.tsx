"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Home Page", href: "/admin/pages/home" },
  { label: "About Page", href: "/admin/pages/about" },
  { label: "Showreel", href: "/admin/pages/showreel" },
  { label: "Contact", href: "/admin/pages/contact" },
  { label: "Media Library", href: "/admin/media" },
  { label: "Submissions", href: "/admin/submissions" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#E3E8ED] flex">
      <aside className="w-64 bg-[#1B3A4C] text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-bold tracking-tight">Late Night Ricky</h2>
          <p className="text-xs text-[#8FA8BE] mt-1 font-medium uppercase tracking-widest">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors ${
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-[#8FA8BE] hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="w-full px-4 py-2.5 text-sm font-semibold text-[#8FA8BE] hover:text-white uppercase tracking-wide transition-colors text-left"
          >
            Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
