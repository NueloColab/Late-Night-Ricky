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
    }, 3000);
    return () => clearInterval(timer);
  }, [items.length]);

  // Duplicate once for seamless loop (2x, not 3x)
  const doubled = [...items, ...items];

  const renderItem = (item: ClientItem, i: number) => {
    const originalIndex = i % items.length;
    const isActive = displayIndex === originalIndex;
    return (
      <button
        key={`${item.name}-${i}`}
        className={`lnr-client-name ${isActive ? 'lnr-client-name-active' : ''}`}
        onMouseEnter={() => setHoverIndex(originalIndex)}
        onMouseLeave={() => setHoverIndex(null)}
        onClick={() => handleSelect(originalIndex)}
      >
        {item.name.toUpperCase()}<span className="lnr-client-dot">&middot;</span>
      </button>
    );
  };

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
            {doubled.map((item, i) => renderItem(item, i))}
          </div>
          <div className="lnr-trusted-row lnr-trusted-row-reverse">
            {doubled.map((item, i) => renderItem(item, i + items.length))}
          </div>
          <div className="lnr-trusted-row lnr-trusted-row-forward-slow">
            {doubled.map((item, i) => renderItem(item, i + items.length * 2))}
          </div>
        </div>
      </div>
    </section>
  );
}