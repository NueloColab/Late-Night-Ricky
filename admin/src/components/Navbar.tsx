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
        @keyframes wave-pulse {
          0%, 100% { width: 22px; transform: translateX(0); }
          25% { width: 16px; transform: translateX(2px); }
          50% { width: 26px; transform: translateX(-2px); }
          75% { width: 18px; transform: translateX(1px); }
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

        /* Backdrop overlay */
        .menu-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 340;
          opacity: 0;
          pointer-events: none;
          transition: opacity 400ms ease;
        }
        .menu-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* Slide-out panel from left */
        .menu-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 320px;
          max-width: 85vw;
          background: #1B3A4C;
          z-index: 350;
          display: flex;
          flex-direction: column;
          padding: 24px 32px;
          transform: translateX(-100%);
          transition: transform 500ms cubic-bezier(.22,1,.36,1);
        }
        .menu-panel.open {
          transform: translateX(0);
        }
        .menu-panel .close-btn {
          align-self: flex-end;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 40px;
        }
        .menu-panel .close-btn svg {
          width: 24px;
          height: 24px;
          stroke: #fff;
          stroke-width: 2;
        }
        .menu-panel nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .menu-panel nav a {
          display: block;
          color: #fff;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          transition: color 200ms ease;
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 400ms ease, transform 400ms ease, color 200ms ease;
        }
        .menu-panel.open nav a {
          opacity: 1;
          transform: translateX(0);
        }
        .menu-panel.open nav a:nth-child(1) { transition-delay: .08s; }
        .menu-panel.open nav a:nth-child(2) { transition-delay: .14s; }
        .menu-panel.open nav a:nth-child(3) { transition-delay: .20s; }
        .menu-panel.open nav a:nth-child(4) { transition-delay: .26s; }
        .menu-panel.open nav a:nth-child(5) { transition-delay: .32s; }
        .menu-panel.open nav a:nth-child(6) { transition-delay: .38s; }
        .menu-panel.open nav a:nth-child(7) { transition-delay: .44s; }
        .menu-panel nav a:hover {
          color: #64c8a8;
        }
        .menu-panel .menu-footer {
          margin-top: auto;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.12);
          opacity: 0;
          transition: opacity 400ms ease .5s;
        }
        .menu-panel.open .menu-footer {
          opacity: 1;
        }
        .menu-panel .menu-footer p {
          color: rgba(255,255,255,0.4);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
        }

        @media (min-width: 768px) {
          .menu-panel {
            width: 380px;
            padding: 32px 40px;
          }
          .menu-panel nav a {
            font-size: 18px;
            padding: 16px 0;
          }
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

      {/* Backdrop overlay */}
      <div
        className={`menu-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-out panel from left */}
      <div className={`menu-panel ${menuOpen ? 'open' : ''}`}>
        <button
          className="close-btn"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>

        <nav>
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

        <div className="menu-footer">
          <p>Late Night Ricky</p>
        </div>
      </div>
    </>
  );
}
