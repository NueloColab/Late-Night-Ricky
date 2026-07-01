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
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <style>{`
        .nav-hamburger {
          position: fixed;
          top: 20px;
          right: 24px;
          z-index: 550;
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
          transition: transform 300ms ease;
        }
        .nav-hamburger:hover {
          transform: scale(1.05);
        }
        .nav-hamburger .hamburger {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 300ms ease;
        }
        .nav-hamburger .hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: #152a47;
          border-radius: 1px;
          transition: all 400ms cubic-bezier(.4,0,.2,1);
          transform-origin: center;
        }
        @keyframes wave-pulse {
          0%, 100% { width: 20px; transform: translateX(0); }
          25% { width: 15px; transform: translateX(2px); }
          50% { width: 24px; transform: translateX(-2px); }
          75% { width: 17px; transform: translateX(1px); }
        }
        .nav-hamburger .hamburger span:nth-child(2) {
          animation: wave-pulse 1.4s ease-in-out infinite;
          animation-delay: .25s;
        }
        .nav-hamburger.active .hamburger span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .nav-hamburger.active .hamburger span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .nav-hamburger.active .hamburger span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .nav-dropdown {
          position: fixed;
          top: 72px;
          right: 24px;
          z-index: 540;
          background: rgba(10, 14, 23, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 0;
          min-width: 200px;
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
          pointer-events: none;
          transition: opacity 300ms ease, transform 300ms cubic-bezier(.22,1,.36,1);
        }
        .nav-dropdown.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .nav-dropdown a {
          display: block;
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 10px 24px;
          transition: color 150ms ease, background 150ms ease;
        }
        .nav-dropdown a:hover {
          color: #fff;
          background: rgba(255,255,255,0.06);
        }

        .nav-overlay {
          position: fixed;
          inset: 0;
          z-index: 530;
          background: rgba(0,0,0,0.3);
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
        }
        .nav-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>

      <button
        className={`nav-hamburger ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        <span className="hamburger">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div className={`nav-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      <nav className={`nav-dropdown ${menuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
