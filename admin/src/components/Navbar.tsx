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
        .lnr-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 500;
          background: rgba(10, 14, 23, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: background 300ms ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 56px;
        }
        .lnr-header.open {
          background: rgba(10, 14, 23, 0.92);
        }
        .lnr-header-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .lnr-header-logo img {
          height: 28px;
          width: auto;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }
        .lnr-header-nav {
          display: flex;
          align-items: center;
          gap: 28px;
          transition: opacity 400ms ease, transform 400ms cubic-bezier(.22,1,.36,1), max-width 400ms ease;
        }
        .lnr-header-nav.closed {
          opacity: 0;
          transform: translateX(20px);
          max-width: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .lnr-header-nav.open {
          opacity: 1;
          transform: translateX(0);
          max-width: 800px;
        }
        .lnr-header-nav a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: color 200ms ease;
          white-space: nowrap;
        }
        .lnr-header-nav a:hover {
          color: #fff;
        }

        .lnr-hamburger {
          width: 44px;
          height: 44px;
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
          flex-shrink: 0;
        }
        .lnr-hamburger:hover {
          transform: scale(1.05);
        }
        .lnr-hamburger .lines {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .lnr-hamburger .lines span {
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
        .lnr-hamburger .lines span:nth-child(2) {
          animation: wave-pulse 1.4s ease-in-out infinite;
          animation-delay: .25s;
        }
        .lnr-hamburger.active .lines span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .lnr-hamburger.active .lines span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .lnr-hamburger.active .lines span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        .lnr-menu-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          opacity: 0.9;
          margin-left: 10px;
          transition: opacity 300ms ease;
          white-space: nowrap;
        }

        .lnr-fullscreen-menu {
          position: fixed;
          inset: 0;
          top: 56px;
          z-index: 490;
          background: rgba(10,14,23,0.96);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 400ms ease;
        }
        .lnr-fullscreen-menu.open {
          opacity: 1;
          pointer-events: auto;
        }
        .lnr-fullscreen-menu a {
          display: block;
          color: #fff;
          text-decoration: none;
          font-size: clamp(20px, 4vw, 32px);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 12px 24px;
          transition: color 200ms ease, transform 200ms ease;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 400ms ease, transform 400ms ease, color 200ms ease;
        }
        .lnr-fullscreen-menu.open a {
          opacity: 1;
          transform: translateY(0);
        }
        .lnr-fullscreen-menu.open a:nth-child(1) { transition-delay: .08s; }
        .lnr-fullscreen-menu.open a:nth-child(2) { transition-delay: .12s; }
        .lnr-fullscreen-menu.open a:nth-child(3) { transition-delay: .16s; }
        .lnr-fullscreen-menu.open a:nth-child(4) { transition-delay: .20s; }
        .lnr-fullscreen-menu.open a:nth-child(5) { transition-delay: .24s; }
        .lnr-fullscreen-menu.open a:nth-child(6) { transition-delay: .28s; }
        .lnr-fullscreen-menu.open a:nth-child(7) { transition-delay: .32s; }
        .lnr-fullscreen-menu a:hover {
          color: #c4b8a8;
          transform: scale(1.05);
        }
        .lnr-fullscreen-menu .menu-footer {
          position: absolute;
          bottom: 40px;
          opacity: 0;
          transition: opacity 400ms ease .4s;
        }
        .lnr-fullscreen-menu.open .menu-footer {
          opacity: 1;
        }
        .lnr-fullscreen-menu .menu-footer p {
          color: rgba(255,255,255,0.35);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .lnr-header {
            padding: 0 16px;
            height: 48px;
          }
          .lnr-header-logo img {
            height: 22px;
          }
          .lnr-header-nav {
            gap: 16px;
          }
          .lnr-header-nav a {
            font-size: 10px;
            letter-spacing: 0.08em;
          }
        }
        @media (max-width: 640px) {
          .lnr-header-nav {
            display: none;
          }
          .lnr-fullscreen-menu {
            top: 48px;
          }
        }
      `}</style>

      <div className={`lnr-header ${menuOpen ? 'open' : ''}`}>
        <Link href="/" className="lnr-header-logo">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" />
        </Link>

        <nav className={`lnr-header-nav ${menuOpen ? 'open' : 'closed'}`}>
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

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className={`lnr-hamburger ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="lines">
              <span />
              <span />
              <span />
            </span>
          </button>
          <span className="lnr-menu-label">{menuOpen ? 'Close' : 'Menu'}</span>
        </div>
      </div>

      <div className={`lnr-fullscreen-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="menu-footer">
          <p>Late Night Ricky</p>
        </div>
      </div>
    </>
  );
}
