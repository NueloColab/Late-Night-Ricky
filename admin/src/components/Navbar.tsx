'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [morphOpen, setMorphOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen || morphOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileOpen, morphOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMorphOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <style>{`
        @keyframes wave-pulse {
          0%, 100% { width: 22px; transform: translateX(0); }
          25% { width: 16px; transform: translateX(2px); }
          50% { width: 26px; transform: translateX(-2px); }
          75% { width: 18px; transform: translateX(1px); }
        }

        /* ===== DESKTOP MORPHING PILL ===== */
        .nav-morph-wrap {
          position: fixed;
          top: 20px;
          right: 30px;
          z-index: 400;
        }
        @media (max-width: 1023px) {
          .nav-morph-wrap { display: none !important; }
        }
        .nav-morph {
          position: relative;
          height: 60px;
          width: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,.95);
          box-shadow: 0 2px 10px rgba(0,0,0,.1);
          display: flex;
          align-items: center;
          overflow: hidden;
          transition: width 400ms cubic-bezier(.4,0,.2,1), border-radius 400ms cubic-bezier(.4,0,.2,1);
        }
        .nav-morph.open {
          width: 780px;
          border-radius: 24px;
        }
        .nav-morph .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
          padding-left: 24px;
          padding-right: 68px;
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 250ms ease, transform 400ms cubic-bezier(.4,0,.2,1);
          pointer-events: none;
        }
        .nav-morph.open .nav-links {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
          transition-delay: 120ms, 0ms;
        }
        .nav-morph .nav-links a {
          color: #5B7A8E;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(12px);
          transition: opacity 350ms cubic-bezier(.4,0,.2,1), transform 350ms cubic-bezier(.4,0,.2,1);
          transition-delay: calc(120ms + var(--i) * 35ms);
        }
        .nav-morph.open .nav-links a {
          opacity: 1;
          transform: translateX(0);
        }
        .nav-morph .nav-links a:hover {
          color: #1B3A4C;
        }
        .nav-morph .nav-toggle {
          position: absolute;
          right: 0;
          top: 0;
          width: 60px;
          height: 60px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 2;
          padding: 0;
        }
        .nav-morph .hamburger-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: opacity 300ms ease;
          position: absolute;
        }
        .nav-morph .bar {
          display: block;
          width: 22px;
          height: 2px;
          background: #1B3A4C;
          border-radius: 1px;
          transition: all 400ms cubic-bezier(.4,0,.2,1);
          transform-origin: center;
          animation: wave-pulse 1.4s ease-in-out infinite;
        }
        .nav-morph .bar:nth-child(1) { animation-delay: 0s; }
        .nav-morph .bar:nth-child(2) { animation-delay: .25s; height: 3px; }
        .nav-morph .bar:nth-child(3) { animation-delay: .5s; }
        .nav-morph .close-icon {
          width: 20px;
          height: 2px;
          background: #1B3A4C;
          border-radius: 1px;
          opacity: 0;
          transform: scaleX(0);
          transition: opacity 300ms ease, transform 300ms cubic-bezier(.4,0,.2,1);
          position: absolute;
        }
        .nav-morph.open .hamburger-icon { opacity: 0; }
        .nav-morph.open .bar { animation: none; }
        .nav-morph.open .close-icon {
          opacity: 1;
          transform: scale(1);
        }
        .nav-morph.open .close-icon:nth-child(2) {
          transform: rotate(45deg);
        }
        .nav-morph.open .close-icon:nth-child(3) {
          transform: rotate(-45deg);
        }

        /* ===== MOBILE MENU ===== */
        .mobile-toggle {
          position: fixed;
          top: 20px;
          right: 24px;
          z-index: 500;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .mobile-toggle .hamburger {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 300ms ease;
        }
        .mobile-toggle .hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: #1B3A4C;
          border-radius: 1px;
          transition: all 400ms cubic-bezier(.4,0,.2,1);
          transform-origin: center;
        }
        .mobile-toggle .hamburger span:nth-child(2) {
          animation: wave-pulse 1.4s ease-in-out infinite;
          animation-delay: .25s;
        }
        /* Hamburger → X animation */
        .mobile-toggle.active .hamburger span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .mobile-toggle.active .hamburger span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .mobile-toggle.active .hamburger span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile overlay */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 25, 35, 0.92);
          -webkit-backdrop-filter: blur(24px) saturate(1.2);
          backdrop-filter: blur(24px) saturate(1.2);
          z-index: 350;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 400ms cubic-bezier(.22,1,.36,1);
        }
        .mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        .mobile-overlay a {
          display: block;
          color: #fff;
          text-decoration: none;
          font-family: 'Georgia', serif;
          font-size: clamp(32px, 8vw, 56px);
          font-weight: 500;
          padding: 10px 0;
          letter-spacing: 2px;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
        }
        .mobile-overlay.open a {
          opacity: 1;
          transform: translateY(0);
        }
        .mobile-overlay.open a:nth-child(1) { transition-delay: .06s; }
        .mobile-overlay.open a:nth-child(2) { transition-delay: .12s; }
        .mobile-overlay.open a:nth-child(3) { transition-delay: .18s; }
        .mobile-overlay.open a:nth-child(4) { transition-delay: .24s; }
        .mobile-overlay.open a:nth-child(5) { transition-delay: .3s; }
        .mobile-overlay.open a:nth-child(6) { transition-delay: .36s; }
        .mobile-overlay.open a:nth-child(7) { transition-delay: .42s; }
        .mobile-overlay .menu-label {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.4);
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0;
          transition: opacity .4s .5s ease;
        }
        .mobile-overlay.open .menu-label {
          opacity: 1;
        }
      `}</style>

      {/* Logo - top left */}
      <Link
        href="/"
        className="fixed top-5 left-6 z-[600] block transition-all"
      >
        <img
          src="/assets/ricky-logo.png"
          alt="Late Night Ricky"
          className="h-8 w-auto brightness-0 invert"
        />
      </Link>

      {/* Desktop: Morphing Pill */}
      <div className="nav-morph-wrap">
        <div className={`nav-morph ${morphOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ '--i': i } as React.CSSProperties}
                onClick={() => setMorphOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            className="nav-toggle"
            aria-label="Menu"
            onClick={() => setMorphOpen(!morphOpen)}
          >
            <span className="hamburger-icon">
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </span>
            <div className="close-icon" />
          </button>
        </div>
      </div>

      {/* Mobile: Animated Hamburger Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`mobile-toggle lg:hidden ${mobileOpen ? 'active' : ''}`}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        <span className="hamburger">
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Mobile Full-Screen Overlay */}
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="menu-label">Late Night Ricky</div>
      </div>
    </>
  );
}
