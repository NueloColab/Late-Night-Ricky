'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainMenuItems = [
  { label: 'Overview', href: '/admin' },
  { label: 'Tracks', href: '/admin/tracks' },
  { label: 'Music Submissions', href: '/admin/submissions' },
  { label: 'Enquiries', href: '/admin/enquiries' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Clients', href: '/admin/clients' },
  { label: 'Quotes', href: '/admin/quotes' },
  { label: 'Invoices', href: '/admin/invoices' },
];

const bottomMenuItems = [
  { label: 'Content', href: '/admin/content' },
  { label: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar({ isOpen, onClose, isMobile }: {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`${
          isMobile
            ? 'fixed left-0 top-0 bottom-0 z-50 w-[280px] h-screen'
            : 'h-screen w-[280px] flex-shrink-0 sticky top-0'
        } bg-[#FAFAF7] border-r border-[#91715c]/30 flex flex-col`}
        style={{
          transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Mobile close button */}
        {isMobile && (
          <div className="flex justify-end px-4 pt-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2a1a0a]/10 rounded transition"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Logo */}
        <Link href="/admin" className="pt-6 pb-4 px-6" onClick={isMobile ? onClose : undefined}>
          <div className="text-center">
            <img
              src="/assets/ricky-logo.png"
              alt="Late Night Ricky"
              className="h-12 w-auto mx-auto opacity-80"
              style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(18%) saturate(1620%) hue-rotate(163deg)' }}
            />
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="w-6 h-px bg-[#91715c]" />
              <p className="text-[10px] uppercase tracking-[3px] text-[#91715c] font-semibold">Admin Portal</p>
              <div className="w-6 h-px bg-[#91715c]" />
            </div>
          </div>
        </Link>

        {/* Main Navigation - scrollable if needed */}
        <nav className="flex-1 overflow-y-auto px-4">
          <div className="space-y-1 mb-6">
            {mainMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center gap-3 px-4 py-3 text-[13px] transition-all duration-300 tracking-[1.5px] uppercase font-semibold ${
                    isActive
                      ? 'bg-[#2a1a0a] text-white'
                      : 'text-[#2a1a0a] hover:bg-[#2a1a0a]/10'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom section (Content + Settings) */}
          <div className="bg-white border border-[#91715c]/30 p-3 space-y-1 mb-6">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center gap-3 px-3 py-2 text-[13px] transition-all duration-300 tracking-[1.5px] uppercase font-semibold ${
                    isActive
                      ? 'bg-[#2a1a0a] text-white'
                      : 'text-[#2a1a0a] hover:bg-[#2a1a0a]/10'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout - pinned to bottom */}
        <div className="px-4 pb-6 pt-4 border-t border-[#91715c]/30">
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-[12px] font-semibold uppercase tracking-[2px] border-2 border-[#2a1a0a] text-[#2a1a0a] hover:bg-[#2a1a0a] hover:text-white transition-all duration-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}