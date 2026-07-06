'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AdminSidebar from './AdminSidebar';
import ToastContainer from './Toast';

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
    <div className="min-h-screen bg-[#FAFAF7] text-[#2a1a0a] flex">
      {/* Desktop sidebar — always visible on large screens */}
      <div className="hidden lg:block">
        <AdminSidebar
          isOpen={true}
          onClose={() => {}}
          isMobile={false}
        />
      </div>

      {/* Mobile sidebar — slide-over overlay */}
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
        <header className="h-auto min-h-[4.5rem] md:h-20 border-b border-[#91715c]/30 flex items-center px-4 md:px-6 py-3 md:py-0 sticky top-0 z-30 bg-[#FAFAF7]/95 backdrop-blur-sm overflow-visible">
          <button
            onClick={toggleSidebar}
            className="mr-3 md:mr-4 p-2 hover:bg-[#2a1a0a]/10 rounded transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <span className="font-['Rockybilly'] text-lg md:text-xl text-[#2a1a0a] leading-normal">Late Night Ricky</span>
            <div className="hidden md:block w-px h-4 bg-[#91715c]" />
            <span className="hidden md:block text-[10px] uppercase tracking-[3px] text-[#91715c] font-semibold">Admin</span>
          </div>

          <div className="ml-auto">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-7 py-2 md:py-3 border-2 border-[#2a1a0a] rounded-full text-[#2a1a0a] text-[11px] md:text-[13px] font-semibold uppercase tracking-[1px] md:tracking-[1.5px] hover:bg-[#2a1a0a] hover:text-white transition whitespace-nowrap"
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
      <ToastContainer />
    </div>
  );
}
