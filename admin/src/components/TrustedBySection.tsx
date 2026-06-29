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

  // Auto-rotate every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length]);

  // Split into 3 rows for the Garrix-style layout
  const row1 = items.slice(0, Math.ceil(items.length / 3));
  const row2 = items.slice(Math.ceil(items.length / 3), Math.ceil(items.length / 3) + Math.ceil(items.length / 3));
  const row3 = items.slice(Math.ceil(items.length / 3) + Math.ceil(items.length / 3));

  const renderItem = (item: ClientItem, globalIndex: number) => {
    const isActive = displayIndex === globalIndex;
    return (
      <button
        key={`${item.name}-${globalIndex}`}
        className="lnr-client-name"
        style={{
          color: isActive ? '#fff' : 'transparent',
          WebkitTextStroke: isActive ? '0px #fff' : 'clamp(1px, 0.15vw, 2px) rgba(255,255,255,0.35)',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: '0 clamp(8px, 1.5vw, 24px)',
          font: 'inherit',
          whiteSpace: 'nowrap' as const,
        }}
        onMouseEnter={() => setHoverIndex(globalIndex)}
        onMouseLeave={() => setHoverIndex(null)}
        onClick={() => handleSelect(globalIndex)}
      >
        {item.name.toUpperCase()}
      </button>
    );
  };

  return (
    <section id="trusted" className="lnr-trusted-section">
      {/* Background image — crossfades on selection */}
      <div className="lnr-trusted-bg-wrapper">
        {items.map((item, i) => (
          <div
            key={`bg-${item.name}`}
            className="lnr-trusted-bg"
            style={{
              backgroundImage: `url('${item.image}')`,
              opacity: displayIndex === i ? 0.25 : 0,
              transition: 'opacity 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Dark overlay */}
      <div className="lnr-trusted-overlay" />

      {/* Content */}
      <div className="lnr-trusted-content">
        {/* Quote */}
        <div className="lnr-trusted-quote">
          <h2 className="lnr-trusted-quote-text">&ldquo;{quote}&rdquo;</h2>
          <p className="lnr-trusted-attribution">&mdash; {attribution}. {description}</p>
        </div>

        {/* Client name rows — Garrix-style interactive carousel */}
        <div className="lnr-trusted-names">
          <div className="lnr-trusted-row">
            {row1.map((item, i) => renderItem(item, i))}
          </div>
          <div className="lnr-trusted-row">
            {row2.map((item, i) => renderItem(item, row1.length + i))}
          </div>
          <div className="lnr-trusted-row">
            {row3.map((item, i) => renderItem(item, row1.length + row2.length + i))}
          </div>
        </div>
      </div>
    </section>
  );
}