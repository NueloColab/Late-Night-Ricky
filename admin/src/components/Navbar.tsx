'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/#about', label: 'About' },
  { href: '/#moments', label: 'Moments' },
  { href: '/#artists', label: 'Artists' },
  { href: '/#venues', label: 'Venues' },
  { href: '/#radio', label: 'Music' },
  { href: '/#share-music', label: 'Share Music' },
  { href: '/#brands', label: 'Brands' },
  { href: '/#contact-form', label: 'Contact' },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [manualToggle, setManualToggle] = useState(false);
  const lastScrollY = useRef(0);

  // Scroll-driven collapse/expand
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      if (scrollY > heroHeight && !manualToggle) {
        // Scrolled past hero/showreel — hide header
        setVisible(false);
      } else if (scrollY <= heroHeight && !manualToggle) {
        // At hero or scrolling up to hero — show header
        setVisible(true);
      }
      lastScrollY.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [manualToggle]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setVisible(true); setManualToggle(false); }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <style>{`
        .lnr-header-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 500;
          background: rgba(80, 50, 30, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: transform 500ms cubic-bezier(.22,1,.36,1), opacity 400ms ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 56px;
        }
        .lnr-header-bar.hidden {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
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

        .lnr-hamburger-plain {
          width: 40px;
          height: 40px;
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
          transition: transform 300ms ease;
          flex-shrink: 0;
        }
        .lnr-hamburger-plain:hover {
          transform: scale(1.05);
        }
        .lnr-hamburger-plain .lines {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .lnr-hamburger-plain .lines span {
          display: block;
          width: 22px;
          height: 2px;
          background: rgba(255,255,255,0.9);
          border-radius: 1px;
          transition: all 300ms ease;
        }
        .lnr-hamburger-plain:hover .lines span {
          background: #fff;
        }

        .lnr-circle-trigger {
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
          transform: scale(0.8) translateY(-10px);
          pointer-events: none;
        }
        .lnr-circle-trigger.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }
        .lnr-circle-btn {
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
        .lnr-circle-btn:hover {
          transform: scale(1.05);
        }
        .lnr-circle-btn .lines {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .lnr-circle-btn .lines span {
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
        .lnr-circle-btn .lines span:nth-child(2) {
          animation: wave-pulse 1.4s ease-in-out infinite;
          animation-delay: .25s;
        }
        .lnr-circle-btn.active .lines span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .lnr-circle-btn.active .lines span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .lnr-circle-btn.active .lines span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
        .lnr-circle-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          opacity: 0.9;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .lnr-header-bar {
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
        }
      `}</style>

      {/* Header bar with nav links */}
      <div className={`lnr-header-bar ${visible ? '' : 'hidden'}`}>
        <Link href="/" className="lnr-header-logo">
          <img src="/assets/ricky-logo.png" alt="Late Night Ricky" />
        </Link>

        <nav className="lnr-header-nav">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                const id = link.href.replace('/#', '');
                const el = document.getElementById(id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          className="lnr-hamburger-plain"
          onClick={() => { setVisible(false); setManualToggle(true); }}
          aria-label="Hide menu"
        >
          <span className="lines">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* Animated circle trigger — appears when header is hidden */}
      <div
        className={`lnr-circle-trigger ${visible ? '' : 'visible'}`}
        onClick={() => { setVisible(true); setManualToggle(false); }}
      >
        <button className="lnr-circle-btn" aria-label="Show menu">
          <span className="lines">
            <span />
            <span />
            <span />
          </span>
        </button>
        <span className="lnr-circle-label">Menu</span>
      </div>
    </>
  );
}
