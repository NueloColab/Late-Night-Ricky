'use client';

import { useState, useEffect, useCallback } from 'react';

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
  void _clients;

  const items = DEFAULT_CLIENTS_WITH_IMAGES;
  const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex;

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Random highlight: jumps to a random different name every 2.5s
  useEffect(() => {
    const timer = setInterval(() => {
      let next: number;
      do {
        next = Math.floor(Math.random() * items.length);
      } while (next === activeIndex && items.length > 1);
      setActiveIndex(next);
    }, 2500);
    return () => clearInterval(timer);
  }, [activeIndex, items.length]);

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
    <section id="trusted" className={`lnr-trusted-section ${revealClass || ''}`}>
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
        <div className="lnr-trusted-snippets">
          <a href="/shows" className="lnr-trusted-snippet">
            <img src="/assets/ricky-portrait-standing.jpg" alt="Artist gallery" />
          </a>
          <a href="/shows" className="lnr-trusted-snippet">
            <img src="/assets/ricky-hero-new.jpg" alt="Artist gallery" />
          </a>
          <a href="/shows" className="lnr-trusted-snippet">
            <img src="/assets/press-bg2.jpg" alt="Artist gallery" />
          </a>
        </div>
      </div>
    </section>
  );
}