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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
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
  }, [menuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
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
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .menu-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 90% 70% at 50% 40%, rgba(27, 58, 76, 0.5) 0%, transparent 70%);
          animation: glow-pulse 4s ease-in-out infinite;
          pointer-events: none;
        }

        .menu-toggle {
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
        .menu-toggle .hamburger {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 300ms ease;
        }
        .menu-toggle .hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: #1B3A4C;
          border-radius: 1px;
          transition: all 400ms cubic-bezier(.4,0,.2,1);
          transform-origin: center;
        }
        .menu-toggle .hamburger span:nth-child(2) {
          animation: wave-pulse 1.4s ease-in-out infinite;
          animation-delay: .25s;
        }
        .menu-toggle.active .hamburger span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .menu-toggle.active .hamburger span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .menu-toggle.active .hamburger span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .menu-overlay {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 120% 80% at 50% 35%, rgba(27, 58, 76, 0.85) 0%, rgba(15, 25, 35, 0.4) 50%, transparent 80%),
            radial-gradient(ellipse 100% 60% at 50% 45%, rgba(143, 168, 190, 0.25) 0%, transparent 55%),
            radial-gradient(ellipse 140% 100% at 50% 50%, rgba(27, 58, 76, 0.35) 0%, transparent 60%),
            linear-gradient(180deg, #0f1a24 0%, #0a1218 30%, #060a0e 70%, #030508 100%);
          -webkit-backdrop-filter: blur(40px) saturate(1.5);
          backdrop-filter: blur(40px) saturate(1.5);
          z-index: 350;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 400ms cubic-bezier(.22,1,.36,1);
        }
        .menu-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        .menu-overlay a {
          position: relative;
          z-index: 2;
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
        .menu-overlay.open a {
          opacity: 1;
          transform: translateY(0);
        }
        .menu-overlay.open a:nth-child(1) { transition-delay: .06s; }
        .menu-overlay.open a:nth-child(2) { transition-delay: .12s; }
        .menu-overlay.open a:nth-child(3) { transition-delay: .18s; }
        .menu-overlay.open a:nth-child(4) { transition-delay: .24s; }
        .menu-overlay.open a:nth-child(5) { transition-delay: .3s; }
        .menu-overlay.open a:nth-child(6) { transition-delay: .36s; }
        .menu-overlay.open a:nth-child(7) { transition-delay: .42s; }
        .menu-overlay .menu-label {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          color: rgba(143, 168, 190, 0.5);
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0;
          transition: opacity .4s .5s ease;
        }
        .menu-overlay.open .menu-label {
          opacity: 1;
        }
      `}</style>

      {/* Logo - centered */}
      <Link
        href="/"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[600] block transition-all"
      >
        <img
          src="/assets/ricky-logo.png"
          alt="Late Night Ricky"
          className="h-8 w-auto brightness-0 invert"
        />
      </Link>

      {/* Menu Toggle - all screens */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`menu-toggle ${menuOpen ? 'active' : ''}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        <span className="hamburger">
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Full-Screen Overlay - all screens */}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="menu-label">Late Night Ricky</div>
      </div>
    </>
  );
}
