'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[#E3E8ED] text-[#1B3A4C] flex">
      {/* Sidebar - desktop collapsible */}
      {!isMobile && (
        <div
          className="h-screen flex-shrink-0 overflow-hidden transition-all duration-300"
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
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={true}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-[#A3B5C4]/30 flex items-center px-6 sticky top-0 z-30 bg-[#E3E8ED]/95 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 p-2 hover:bg-[#1B3A4C]/10 rounded transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <span className="font-['Rockybilly'] text-xl text-[#1B3A4C] leading-normal">Late Night Ricky</span>
            <div className="w-px h-4 bg-[#A3B5C4]" />
            <span className="text-[10px] uppercase tracking-[3px] text-[#6B8FAB] font-semibold">Admin</span>
          </div>

          <div className="ml-auto">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#1B3A4C] rounded-full text-[#1B3A4C] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#1B3A4C] hover:text-white transition"
            >
              View Site →
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
