'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainMenuItems = [
  { label: 'Overview', href: '/admin' },
  { label: 'Submissions', href: '/admin/submissions' },
  { label: 'Enquiries', href: '/admin/enquiries' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Quotes', href: '/admin/quotes' },
  { label: 'Invoices', href: '/admin/invoices' },
  { label: 'Clients', href: '/admin/clients' },
];

const bottomMenuItems = [
  { label: 'Content', href: '/admin/content' },
  { label: 'Shows', href: '/admin/shows' },
  { label: 'Show Pages', href: '/admin/show-pages' },
  { label: 'Tracks', href: '/admin/tracks' },
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
            ? 'fixed left-0 top-0 bottom-0 z-50 w-[280px] h-screen overflow-y-auto'
            : 'h-screen overflow-y-auto w-[280px] flex-shrink-0'
        } bg-[#8a8a8a] border-r border-[#b0b0b0]/30 flex flex-col`}
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
              className="p-2 hover:bg-[#7a7a7a]/10 rounded transition"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Logo */}
        <Link href="/admin" className="mb-8 pt-4 px-6" onClick={isMobile ? onClose : undefined}>
          <div className="text-center">
            <img
              src="/assets/ricky-logo.png"
              alt="Late Night Ricky"
              className="h-12 w-auto mx-auto brightness-0 invert-[#7a7a7a]"
              style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(18%) saturate(1620%) hue-rotate(163deg)' }}
            />
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="w-6 h-px bg-[#b0b0b0]" />
              <p className="text-[10px] uppercase tracking-[3px] text-[#b0b0b0] font-semibold">Admin Portal</p>
              <div className="w-6 h-px bg-[#b0b0b0]" />
            </div>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="flex-1 px-4">
          <div className="space-y-1 mb-8">
            {mainMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center gap-3 px-4 py-3 text-[13px] transition-all duration-300 tracking-[1.5px] uppercase font-semibold ${
                    isActive
                      ? 'bg-[#7a7a7a] text-white'
                      : 'text-[#7a7a7a] hover:bg-[#7a7a7a]/10'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom section */}
          <div className="bg-white border border-[#b0b0b0]/30 p-3 space-y-1">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center gap-3 px-3 py-2 text-[13px] transition-all duration-300 tracking-[1.5px] uppercase font-semibold ${
                    isActive
                      ? 'bg-[#7a7a7a] text-white'
                      : 'text-[#7a7a7a] hover:bg-[#7a7a7a]/10'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Divider */}
        <div className="px-6 my-4 border-t border-[#b0b0b0]/30" />

        {/* Logout */}
        <div className="px-4 mb-4">
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-semibold uppercase tracking-[1.5px] border-2 border-[#7a7a7a] text-[#7a7a7a] hover:bg-[#7a7a7a] hover:text-white transition-all duration-300"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
