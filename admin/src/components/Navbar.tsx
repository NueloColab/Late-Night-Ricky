'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Scroll-driven collapse/expand
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.8; // 80% of viewport
      
      if (scrollY > heroHeight && !collapsed) {
        setCollapsed(true);
      } else if (scrollY <= heroHeight && collapsed) {
        setCollapsed(false);
        setMenuOpen(false);
      }
      lastScrollY.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [collapsed]);

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
        .lnr-nav-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 500;
          background: rgba(10, 14, 23, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          transition: transform 500ms cubic-bezier(.22,1,.36,1), opacity 400ms ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 56px;
        }
        .lnr-nav-bar.collapsed {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
        }
        .lnr-nav-bar nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .lnr-nav-bar nav a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: color 200ms ease;
          white-space: nowrap;
        }
        .lnr-nav-bar nav a:hover {
          color: #fff;
        }
        .lnr-nav-logo {
          display: flex;
          align-items: center;
        }
        .lnr-nav-logo img {
          height: 28px;
          width: auto;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }

        .lnr-nav-circle {
          position: fixed;
          top: 16px;
          right: 20px;
          z-index: 550;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 400ms ease, transform 400ms cubic-bezier(.22,1,.36,1);
          opacity: 0;
          transform: scale(0.8) translateY(-20px);
          pointer-events: none;
        }
        .lnr-nav-circle.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }
        .lnr-nav-circle-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          transition: transform 300ms ease;
        }
        .lnr-nav-circle-btn:hover {
          transform: scale(1.05);
        }
        .lnr-nav-circle-btn .hamburger {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .lnr-nav-circle-btn .hamburger span {
          display: block;
          width: 18px;
          height: 2px;
          background: #152a47;
          border-radius: 1px;
          transition: all 400ms cubic-bezier(.4,0,.2,1);
          transform-origin: center;
        }
        @keyframes wave-pulse {
          0%, 100% { width: 18px; transform: translateX(0); }
          25% { width: 13px; transform: translateX(2px); }
          50% { width: 22px; transform: translateX(-2px); }
          75% { width: 15px; transform: translateX(1px); }
        }
        .lnr-nav-circle-btn .hamburger span:nth-child(2) {
          animation: wave-pulse 1.4s ease-in-out infinite;
          animation-delay: .25s;
        }
        .lnr-nav-circle-btn.active .hamburger span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .lnr-nav-circle-btn.active .hamburger span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .lnr-nav-circle-btn.active .hamburger span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        .lnr-nav-circle-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          opacity: 0.9;
        }

        .lnr-nav-close {
          position: fixed;
          top: 16px;
          right: 20px;
          z-index: 550;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .lnr-nav-close-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          transition: transform 300ms ease;
        }
        .lnr-nav-close-btn:hover {
          transform: scale(1.05);
        }
        .lnr-nav-close-btn .hamburger span {
          display: block;
          width: 18px;
          height: 2px;
          background: #152a47;
          border-radius: 1px;
          transition: all 400ms cubic-bezier(.4,0,.2,1);
          transform-origin: center;
        }
        .lnr-nav-close-btn .hamburger span:nth-child(1) {
          transform: translateY(3px) rotate(45deg);
        }
        .lnr-nav-close-btn .hamburger span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .lnr-nav-close-btn .hamburger span:nth-child(3) {
          transform: translateY(-3px) rotate(-45deg);
        }
        .lnr-nav-close-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          opacity: 0.9;
        }

        .menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 540;
          background: rgba(10,14,23,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 400ms ease;
        }
        .menu-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        .menu-overlay nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .menu-overlay nav a {
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
        .menu-overlay.open nav a {
          opacity: 1;
          transform: translateY(0);
        }
        .menu-overlay.open nav a:nth-child(1) { transition-delay: .08s; }
        .menu-overlay.open nav a:nth-child(2) { transition-delay: .12s; }
        .menu-overlay.open nav a:nth-child(3) { transition-delay: .16s; }
        .menu-overlay.open nav a:nth-child(4) { transition-delay: .20s; }
        .menu-overlay.open nav a:nth-child(5) { transition-delay: .24s; }
        .menu-overlay.open nav a:nth-child(6) { transition-delay: .28s; }
        .menu-overlay.open nav a:nth-child(7) { transition-delay: .32s; }
        .menu-overlay nav a:hover {
          color: #c4b8a8;
          transform: scale(1.05);
        }
        .menu-overlay .menu-footer {
          position: absolute;
          bottom: 40px;
          opacity: 0;
          transition: opacity 400ms ease .4s;
        }
        .menu-overlay.open .menu-footer {
          opacity: 1;
        }
        .menu-overlay .menu-footer p {
          color: rgba(255,255,255,0.35);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .lnr-nav-bar {
            padding: 0 16px;
            height: 48px;
          }
          .lnr-nav-bar nav {
            gap: 16px;
          }
          .lnr-nav-bar nav a {
            font-size: 10px;
            letter-spacing: 0.08em;
          }
          .lnr-nav-logo img {
            height: 22px;
          }
        }
        @media (max-width: 640px) {
          .lnr-nav-bar nav {
            display: none;
          }
        }
      `}</style>

      {/* Logo inside translucent bar */}
      <div className={`lnr-nav-bar ${collapsed ? 'collapsed' : ''}`}>
        <Link href="/" className="lnr-nav-logo">
          <img
            src="/assets/ricky-logo.png"
            alt="Late Night Ricky"
          />
        </Link>

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
      </div>

      {/* Collapsed: animated circle + Menu label — appears when scrolled past hero */}
      <div
        className={`lnr-nav-circle ${collapsed && !menuOpen ? 'visible' : ''}`}
        onClick={() => setMenuOpen(true)}
      >
        <button className={`lnr-nav-circle-btn ${menuOpen ? 'active' : ''}`} aria-label="Open menu">
          <span className="hamburger">
            <span />
            <span />
            <span />
          </span>
        </button>
        <span className="lnr-nav-circle-label">Menu</span>
      </div>

      {/* Fullscreen overlay menu */}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        <nav onClick={(e) => e.stopPropagation()}>
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

      {/* Close button when overlay is open */}
      {menuOpen && (
        <div className="lnr-nav-close" onClick={() => setMenuOpen(false)}>
          <button className="lnr-nav-close-btn" aria-label="Close menu">
            <span className="hamburger">
              <span />
              <span />
              <span />
            </span>
          </button>
          <span className="lnr-nav-close-label">Close</span>
        </div>
      )}
    </>
  );
}
