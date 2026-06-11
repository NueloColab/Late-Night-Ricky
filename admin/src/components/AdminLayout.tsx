'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userToggled = useRef(false);
  const lastWidth = useRef(0);

  const checkMobile = useCallback(() => {
    const width = window.innerWidth;
    const mobile = width < 1024;

    // Only update if crossing the breakpoint (significant change)
    const wasMobile = lastWidth.current < 1024;
    const crossingBreakpoint = wasMobile !== mobile || lastWidth.current === 0;
    lastWidth.current = width;

    // Auto-open on desktop, auto-close on mobile when crossing breakpoint
    if (crossingBreakpoint) {
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    // Debounce resize to avoid iPad URL bar triggering
    let timeout: ReturnType<typeof setTimeout>;
    const debouncedCheck = () => {
      clearTimeout(timeout);
      timeout = setTimeout(checkMobile, 150);
    };

    checkMobile(); // initial check
    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      clearTimeout(timeout);
    };
  }, [checkMobile]);

  const toggleSidebar = () => {
    userToggled.current = true;
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#E3E8ED] text-[#1B3A4C] flex">
      {/* Desktop sidebar — hidden on mobile via CSS, never flashes on hydration */}
      <div
        className="hidden lg:block h-screen flex-shrink-0 overflow-hidden transition-all duration-300"
        style={{ width: sidebarOpen ? 280 : 0 }}
      >
        {sidebarOpen && (
          <AdminSidebar
            isOpen={true}
            onClose={() => setSidebarOpen(false)}
            isMobile={false}
          />
        )}
      </div>

      {/* Mobile sidebar — conditionally rendered to prevent any flash */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMobile={true}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-auto min-h-[4.5rem] md:h-20 border-b border-[#A3B5C4]/30 flex items-center px-4 md:px-6 py-3 md:py-0 sticky top-0 z-30 bg-[#E3E8ED]/95 backdrop-blur-sm overflow-visible">
          <button
            onClick={toggleSidebar}
            className="mr-3 md:mr-4 p-2 hover:bg-[#1B3A4C]/10 rounded transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <span className="font-['Rockybilly'] text-lg md:text-xl text-[#1B3A4C] leading-normal">Late Night Ricky</span>
            <div className="hidden md:block w-px h-4 bg-[#A3B5C4]" />
            <span className="hidden md:block text-[10px] uppercase tracking-[3px] text-[#6B8FAB] font-semibold">Admin</span>
          </div>

          <div className="ml-auto">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-7 py-2 md:py-3 border-2 border-[#1B3A4C] rounded-full text-[#1B3A4C] text-[11px] md:text-[13px] font-semibold uppercase tracking-[1px] md:tracking-[1.5px] hover:bg-[#1B3A4C] hover:text-white transition whitespace-nowrap"
            >
              <span className="hidden md:inline">View Site</span>
              <span className="md:hidden">Site</span>
              <span>→</span>
            </a>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
