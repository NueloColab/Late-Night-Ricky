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
  { href: '/#contact-form', label: 'Contact' },
];

export default function Navbar() {
  const [morphOpen, setMorphOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        @keyframes wave-pulse {
          0%, 100% { width: 22px; transform: translateX(0); }
          25% { width: 16px; transform: translateX(2px); }
          50% { width: 26px; transform: translateX(-2px); }
          75% { width: 18px; transform: translateX(1px); }
        }
        .nav-morph-wrap {
          position: fixed;
          top: 20px;
          right: 30px;
          z-index: 400;
        }
        @media (max-width: 991px) {
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
          transform: translateX(-100%);
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

        /* Mobile menu */
        .mm {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100dvh;
          background: rgba(27,58,76,.35);
          -webkit-backdrop-filter: blur(20px) saturate(1.2);
          backdrop-filter: blur(20px) saturate(1.2);
          z-index: 300;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: translateX(100%);
          transition: transform .6s cubic-bezier(.22,1,.36,1);
        }
        .mm.open {
          transform: translateX(0);
        }
        .mm a {
          display: block;
          color: #fff;
          text-decoration: none;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(36px, 8vw, 64px);
          font-weight: 500;
          padding: 12px 0;
          letter-spacing: 2px;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity .4s cubic-bezier(.22,1,.36,1), transform .4s cubic-bezier(.22,1,.36,1);
        }
        .mm.open a {
          opacity: 1;
          transform: translateY(0);
        }
        .mm.open a:nth-child(1) { transition-delay: .05s; }
        .mm.open a:nth-child(2) { transition-delay: .1s; }
        .mm.open a:nth-child(3) { transition-delay: .15s; }
        .mm.open a:nth-child(4) { transition-delay: .2s; }
        .mm.open a:nth-child(5) { transition-delay: .25s; }
        .mm.open a:nth-child(6) { transition-delay: .3s; }
        .mm.open a:nth-child(7) { transition-delay: .35s; }
        .mm .menu-label {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.5);
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 500;
          opacity: 0;
          transition: opacity .4s .4s ease;
        }
        .mm.open .menu-label {
          opacity: 1;
        }
      `}</style>

      {/* Logo - top left */}
      <Link
        href="/"
        className="fixed top-5 left-6 z-[500] block transition-all"
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

      {/* Mobile: Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-5 right-6 z-[500] flex flex-col gap-[5px] w-12 h-12 rounded-full bg-white/92 border-none items-center justify-center cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.1)] lg:hidden"
        aria-label="Menu"
      >
        <span className="block w-[22px] h-[2px] bg-[#1B3A4C] rounded-[1px]" />
        <span className="block w-[22px] h-[2px] bg-[#1B3A4C] rounded-[1px]" />
        <span className="block w-[22px] h-[2px] bg-[#1B3A4C] rounded-[1px]" />
      </button>

      {/* Mobile Full-Screen Menu */}
      <div className={`mm ${mobileOpen ? 'open' : ''}`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-6 w-11 h-11 rounded-full bg-transparent border-none text-white text-2xl flex items-center justify-center z-[10]"
          aria-label="Close"
        >
          ×
        </button>
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
