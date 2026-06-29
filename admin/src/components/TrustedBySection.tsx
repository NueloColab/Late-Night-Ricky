'use client';

import { useState, useEffect, useCallback } from 'react';

interface ClientItem {
  name: string;
  image: string;
}

const DEFAULT_CLIENTS_WITH_IMAGES: ClientItem[] = [
  { name: 'Ronaldo', image: '/assets/press-bg2.jpg' },
  { name: 'Drake', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Chris Brown', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Bruno Mars', image: '/assets/ricky-hero-v2.jpg' },
  { name: 'Kendrick Lamar', image: '/assets/press-bg2.jpg' },
  { name: 'Travis Scott', image: '/assets/ricky-hero-new.jpg' },
  { name: '50 Cent', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Justin Bieber', image: '/assets/ricky-hero-v2.jpg' },
  { name: 'Rihanna', image: '/assets/press-bg2.jpg' },
  { name: 'Future', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Jason Momoa', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Leonardo DiCaprio', image: '/assets/ricky-hero-v2.jpg' },
  { name: 'Lewis Hamilton', image: '/assets/press-bg2.jpg' },
  { name: 'Neymar Jr', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Paul McCartney', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Vin Diesel', image: '/assets/ricky-hero-v2.jpg' },
  { name: 'Usain Bolt', image: '/assets/press-bg2.jpg' },
  { name: 'Mick Jagger', image: '/assets/ricky-hero-new.jpg' },
  { name: 'Dr. Dre', image: '/assets/ricky-portrait-new.jpg' },
  { name: 'Jason Statham', image: '/assets/ricky-hero-v2.jpg' },
];

interface TrustedBySectionProps {
  quote?: string;
  attribution?: string;
  description?: string;
  clients?: string[];
}

export default function TrustedBySection({
  quote = "The best DJ I've heard.",
  attribution = 'Cristiano Ronaldo',
  description = 'Trusted by A-list artists, global brands, and sold-out crowds worldwide.',
  clients: _clients,
}: TrustedBySectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  void _clients;

  const items = DEFAULT_CLIENTS_WITH_IMAGES;
  const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex;

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Auto-rotate every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length]);

  // Triple the names for seamless loop
  const tripled = [...items, ...items, ...items];
  const row1Names = tripled.map((item, i) => (
    <button
      key={`r1-${item.name}-${i}`}
      className={`lnr-client-name ${displayIndex === (i % items.length) ? 'lnr-client-name-active' : ''}`}
      onMouseEnter={() => setHoverIndex(i % items.length)}
      onMouseLeave={() => setHoverIndex(null)}
      onClick={() => handleSelect(i % items.length)}
    >
      {item.name.toUpperCase()}<span className="lnr-client-dot">&middot;</span>
    </button>
  ));

  const row2Names = tripled.map((item, i) => (
    <button
      key={`r2-${item.name}-${i}`}
      className={`lnr-client-name ${displayIndex === (i % items.length) ? 'lnr-client-name-active' : ''}`}
      onMouseEnter={() => setHoverIndex(i % items.length)}
      onMouseLeave={() => setHoverIndex(null)}
      onClick={() => handleSelect(i % items.length)}
    >
      {item.name.toUpperCase()}<span className="lnr-client-dot">&middot;</span>
    </button>
  ));

  const row3Names = tripled.map((item, i) => (
    <button
      key={`r3-${item.name}-${i}`}
      className={`lnr-client-name ${displayIndex === (i % items.length) ? 'lnr-client-name-active' : ''}`}
      onMouseEnter={() => setHoverIndex(i % items.length)}
      onMouseLeave={() => setHoverIndex(null)}
      onClick={() => handleSelect(i % items.length)}
    >
      {item.name.toUpperCase()}<span className="lnr-client-dot">&middot;</span>
    </button>
  ));

  return (
    <section id="trusted" className="lnr-trusted-section">
      {/* Background image — centred, feathered edges */}
      <div className="lnr-trusted-bg-container">
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

      {/* Content */}
      <div className="lnr-trusted-content">
        {/* Quote */}
        <div className="lnr-trusted-quote">
          <h2 className="lnr-trusted-quote-text">&ldquo;{quote}&rdquo;</h2>
          <p className="lnr-trusted-attribution">&mdash; {attribution}. {description}</p>
        </div>

        {/* Scrolling name rows — alternating direction */}
        <div className="lnr-trusted-names">
          <div className="lnr-trusted-row lnr-trusted-row-forward">
            {row1Names}
          </div>
          <div className="lnr-trusted-row lnr-trusted-row-reverse">
            {row2Names}
          </div>
          <div className="lnr-trusted-row lnr-trusted-row-forward-slow">
            {row3Names}
          </div>
        </div>
      </div>
    </section>
  );
}