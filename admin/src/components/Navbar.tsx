'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/#shows', label: 'Shows' },
  { href: '/#partnerships', label: 'Partners' },
  { href: '/showreel', label: 'Showreel' },
  { href: '/#supporting', label: 'Supporting' },
  { href: '/share-music', label: 'Share Music' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  const navBg = isHome ? (scrolled ? 'bg-[#1B3A4C]/90 backdrop-blur-md' : 'bg-transparent') : 'bg-[#1B3A4C]';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-colors ${navBg}`}>
        <Link href="/" className="block">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="h-8 w-auto brightness-0 invert" />
        </Link>
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-white text-xs font-medium uppercase tracking-[1.5px] hover:opacity-70 transition">
              {link.label}
            </Link>
          ))}
        </div>
        <button onClick={() => setMobileOpen(true)} className="lg:hidden w-11 h-11 rounded-full border border-white/30 flex flex-col items-center justify-center gap-[5px] bg-transparent" aria-label="Menu">
          <span className="block w-[18px] h-[2px] bg-white rounded-sm" />
          <span className="block w-[18px] h-[2px] bg-white rounded-sm" />
          <span className="block w-[18px] h-[2px] bg-white rounded-sm" />
        </button>
      </nav>
      <div className={`fixed inset-0 z-[60] bg-[#1B3A4C] flex flex-col items-center justify-center transition-transform duration-500 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-6 w-11 h-11 rounded-full bg-transparent border-none text-white text-2xl flex items-center justify-center" aria-label="Close">&times;</button>
        {navLinks.map((link, i) => (
          <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-white font-serif text-[28px] font-medium py-3 tracking-[2px] uppercase"
            style={{ opacity: mobileOpen ? 1 : 0, transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.4s ${0.05 + i * 0.05}s, transform 0.4s ${0.05 + i * 0.05}s` }}>
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
