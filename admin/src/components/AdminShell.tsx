'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
      { label: "Nav \u0026 Logo", href: "/admin/global/nav" },
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

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
            className={`bg-[#111318] flex flex-col border-r border-[#2A2E36] ${
              isMobile 
                ? 'fixed left-0 top-0 bottom-0 z-50 w-[280px] h-screen overflow-y-auto' 
                : 'relative h-screen overflow-y-auto w-[280px] flex-shrink-0'
            }`}
            style={{ width: '280px' }}
          >
            {/* Logo */}
            <Link 
              href="/admin" 
              className="p-6 border-b border-[#2A2E36] block"
              onClick={isMobile ? () => setSidebarOpen(false) : undefined}
            >
              <h2 className="text-lg font-bold tracking-tight font-serif text-white">Late Night Ricky</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-6 h-px bg-[#8FA3B3]"></div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#5A6A7A] font-medium">
                  Admin Portal
                </p>
                <div className="w-6 h-px bg-[#8FA3B3]"></div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
              <Link
                href="/admin"
                onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                className={`block px-4 py-3 text-sm uppercase tracking-wide transition-all ${
                  pathname === '/admin'
                    ? 'bg-[#2a1a0a] text-white font-medium'
                    : 'text-[#8FA3B3] hover:text-white hover:bg-[#1A1D24]'
                }`}
              >
                Dashboard
              </Link>

              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5A6A7A] mb-1">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                        className={`block px-4 py-2.5 text-sm uppercase tracking-wide transition-all ${
                          pathname === item.href
                            ? 'bg-[#2a1a0a] text-white font-medium'
                            : 'text-[#8FA3B3] hover:text-white hover:bg-[#1A1D24]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[#2A2E36]">
              <motion.button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/admin/login'
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium border border-[#2A2E36] text-[#8FA3B3] hover:text-white hover:border-[#8FA3B3] transition-all duration-300"
              >
                <X size={16} />
                <span className="tracking-wide">Log Out</span>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#111318] border-b border-[#2A2E36] px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-[#1A1D24] transition-colors duration-300"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-[#8FA3B3]" />
              ) : (
                <Menu className="w-5 h-5 text-[#8FA3B3]" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Late Night Ricky</p>
                <p className="text-xs text-[#5A6A7A]">Admin Panel</p>
              </div>
              <div className="w-10 h-10 bg-[#2a1a0a] flex items-center justify-center text-white font-medium text-sm">
                LR
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0A0A0A;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2E36;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3A3E46;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #2A2E36 #0A0A0A;
        }
      `}</style>
    </div>
  )
}
