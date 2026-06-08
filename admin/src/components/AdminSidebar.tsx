'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const mainMenuItems = [
  { label: 'Overview', href: '/admin', icon: LayoutIcon },
  { label: 'Submissions', href: '/admin/submissions', icon: MessageIcon },
  { label: 'Projects', href: '/admin/projects', icon: FolderIcon },
  { label: 'Quotes', href: '/admin/quotes', icon: QuoteIcon },
  { label: 'Invoices', href: '/admin/invoices', icon: ReceiptIcon },
  { label: 'Clients', href: '/admin/clients', icon: UsersIcon },
];

const bottomMenuItems = [
  { label: 'Content', href: '/admin/content', icon: PenIcon },
  { label: 'Shows', href: '/admin/shows', icon: VideoIcon },
  { label: 'Tracks', href: '/admin/tracks', icon: MusicIcon },
  { label: 'Settings', href: '/admin/settings', icon: GearIcon },
];

export default function AdminSidebar({ isOpen, onClose, isMobile }: {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}) {
  const pathname = usePathname();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: -280 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial="closed"
          animate="open"
          exit="closed"
          variants={sidebarVariants}
          transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
          className={`${
            isMobile
              ? 'fixed left-0 top-0 bottom-0 z-50 w-[280px] h-screen overflow-y-auto'
              : 'relative h-screen overflow-y-auto w-[280px] flex-shrink-0'
          } bg-[#0a0a0a] border-r border-white/10 p-6 flex flex-col`}
        >
          {/* Logo */}
          <Link href="/admin" className="mb-10" onClick={isMobile ? onClose : undefined}>
            <div className="text-center">
              <p className="font-serif text-xl tracking-tight">Late Night Ricky</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="w-6 h-px bg-white/30" />
                <p className="text-[10px] uppercase tracking-[3px] text-white/40">Admin Portal</p>
                <div className="w-6 h-px bg-white/30" />
              </div>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="flex-1">
            <div className="space-y-1 mb-8">
              {mainMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 ${
                        isActive
                          ? 'bg-white text-black font-medium'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="tracking-wide">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom section */}
            <div className="bg-white/5 border border-white/10 p-3 space-y-1">
              {bottomMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (mainMenuItems.length + index) * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      className={`flex items-center gap-3 px-3 py-2 text-sm transition-all duration-300 ${
                        isActive
                          ? 'bg-white text-black font-medium'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="tracking-wide">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-white/10" />

          {/* Logout */}
          <motion.button
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <LogoutIcon size={18} />
            <span className="tracking-wide">Logout</span>
          </motion.button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ─── Icons ─────────────────────────────────────────────── */

function LayoutIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function MessageIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FolderIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function QuoteIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v7c0 1.25.75 2 2 2zm10 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 2v7c0 1.25.75 2 2 2z" />
    </svg>
  );
}

function ReceiptIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UsersIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><circle cx="16.5" cy="7.5" r="2.5" />
    </svg>
  );
}

function PenIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function VideoIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}

function MusicIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function GearIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon({ size }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
