'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ClientItem {
  name: string;
  image: string;
}

const DEFAULT_CLIENTS_WITH_IMAGES: ClientItem[] = [
  { name: '50 Cent', image: '/assets/press-bg2.jpg' },
  { name: 'Bruno Mars', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Chris Brown', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Dr. Dre & Jimmy Iovine', image: '/assets/ricky-hero-v2.jpg' },
  { name: 'Drake', image: '/assets/press-bg2.jpg' },
  { name: 'Future', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Jason Momoa', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Jason Statham', image: '/assets/ricky-hero-v2.jpg' },
  { name: 'Justin Bieber', image: '/assets/press-bg2.jpg' },
  { name: 'Kendrick Lamar', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Leonardo DiCaprio', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Lewis Hamilton', image: '/assets/ricky-hero-v2.jpg' },
  { name: 'Mick Jagger', image: '/assets/press-bg2.jpg' },
  { name: 'Neymar Jnr', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Paul McCartney', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Rihanna', image: '/assets/ricky-hero-v2.jpg' },
  { name: 'Ronaldo', image: '/assets/press-bg2.jpg' },
  { name: 'Travis Scott', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Usain Bolt', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Vin Diesel', image: '/assets/ricky-hero-v2.jpg' },
];

interface TrustedBySectionProps {
  quote?: string;
  attribution?: string;
  description?: string;
  clients?: string[];
  revealClass?: string;
}

export default function TrustedBySection({
  quote = "The best DJ I've heard.",
  attribution = 'Cristiano Ronaldo',
  description = 'Trusted by A-list artists, global brands, and sold-out crowds worldwide.',
  clients: _clients,
  revealClass,
}: TrustedBySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  void _clients;

  const items = DEFAULT_CLIENTS_WITH_IMAGES;
  const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex;

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Cycle through names every 2.5s, picking a random visible one
  useEffect(() => {
    const timer = setInterval(() => {
      if (hoverIndex !== null) return;
      const section = sectionRef.current;
      if (!section) return;

      // Get all name buttons currently in the viewport
      const buttons = section.querySelectorAll('.lnr-client-name');
      const visibleIndices: number[] = [];
      buttons.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        // Check if button is at least partially visible
        if (rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0) {
          const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
          if (!visibleIndices.includes(idx)) visibleIndices.push(idx);
        }
      });

      if (visibleIndices.length === 0) return;
      let next: number;
      do {
        next = visibleIndices[Math.floor(Math.random() * visibleIndices.length)];
      } while (next === activeIndex && visibleIndices.length > 1);
      setActiveIndex(next);
    }, 2500);
    return () => clearInterval(timer);
  }, [activeIndex, hoverIndex]);

  const row1 = items.slice(0, 7);
  const row2 = items.slice(7, 14);
  const row3 = items.slice(14, 20);

  const makeRow = (rowItems: ClientItem[], rowIndex: number) => {
    const doubled = [...rowItems, ...rowItems, ...rowItems];
    return doubled.map((item, i) => {
      const originalIndex = items.indexOf(item);
      const isActive = displayIndex === originalIndex;
      return (
        <button
          key={`${item.name}-${rowIndex}-${i}`}
          data-index={originalIndex}
          className={`lnr-client-name ${isActive ? 'lnr-client-name-active' : ''}`}
          onMouseEnter={() => setHoverIndex(originalIndex)}
          onMouseLeave={() => setHoverIndex(null)}
          onClick={() => handleSelect(originalIndex)}
        >
          {item.name.toUpperCase()}<span className="lnr-client-dot">&middot;</span>
        </button>
      );
    });
  };

  return (
    <section id="trusted" ref={sectionRef} className={`lnr-trusted-section ${revealClass || ''}`}>
      {/* Vertical label */}
      <div className="lnr-trusted-label">ARTISTS</div>
      <div className="lnr-trusted-line" />

      {/* MIDDLE: image behind carousel names */}
      <div className="lnr-trusted-middle">
        <div className="lnr-trusted-bg-container">
          <div className="lnr-trusted-frost" />
          {items.map((item, i) => (
            <div
              key={`bg-${item.name}`}
              className="lnr-trusted-bg"
              style={{
                backgroundImage: `url('${item.image}')`,
                opacity: displayIndex === i ? 1 : 0,
              }}
            />
          ))}
        </div>

        <div className="lnr-trusted-names">
          <div className="lnr-trusted-row lnr-trusted-row-forward">
            {makeRow(row1, 0)}
          </div>
          <div className="lnr-trusted-row lnr-trusted-row-reverse">
            {makeRow(row2, 1)}
          </div>
          <div className="lnr-trusted-row lnr-trusted-row-forward-slow">
            {makeRow(row3, 2)}
          </div>
        </div>
      </div>

      {/* BOTTOM: pill + gallery snippets in black space below image */}
      <div className="lnr-trusted-bottom">
        <a href="/shows" className="lnr-trusted-gallery-pill">Artist Gallery</a>
        <div className="lnr-trusted-snippets reveal">
          <a href="/shows" className="lnr-trusted-snippet lnr-snippet-left">
            <img src="/assets/ricky-portrait-standing.jpg" alt="Artist gallery" />
          </a>
          <a href="/shows" className="lnr-trusted-snippet lnr-snippet-center">
            <img src="/assets/ricky-hero-new.jpg" alt="Artist gallery" />
          </a>
          <a href="/shows" className="lnr-trusted-snippet lnr-snippet-right">
            <img src="/assets/press-bg2.jpg" alt="Artist gallery" />
          </a>
        </div>
      </div>

      {/* PARTNERSHIPS — brand logo grid */}
      <div className="lnr-partners-section">
        <div className="lnr-partners-grid">
          <div className="lnr-partner-logo"><img src="/assets/logo-f1.png" alt="F1" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-coca-cola.png" alt="Coca-Cola" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-dior.png" alt="Dior" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-patek.png" alt="Patek Philippe" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-ciroc.png" alt="CÎROC" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-louis-vuitton.png" alt="Louis Vuitton" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-prime.png" alt="PRIME" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-mf-boxing.png" alt="MF Boxing" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-cannes.png" alt="Festival de Cannes" /></div>
          <div className="lnr-partner-logo"><img src="/assets/logo-cartier.png" alt="Cartier" /></div>
          <div className="lnr-partner-logo"><img src="/assets/apple-logo.png" alt="Apple Music" /></div>
        </div>
        <a href="/#partnerships" className="lnr-partners-pill">ALL PARTNERSHIPS</a>
      </div>
    </section>
  );
}