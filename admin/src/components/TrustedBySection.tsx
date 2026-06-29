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
  const [visibleNames, setVisibleNames] = useState<Set<number>>(new Set());
  const nameRefs = useRef<Map<number, HTMLElement>>(new Map());
  void _clients;

  const items = DEFAULT_CLIENTS_WITH_IMAGES;
  const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex;

  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Intersection Observer: track which names are fully visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleNames((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
              next.add(idx);
            } else {
              next.delete(idx);
            }
          });
          return next;
        });
      },
      { threshold: 0.9 }
    );

    nameRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto-highlight: only cycle through names that are currently visible
  useEffect(() => {
    const timer = setInterval(() => {
      if (hoverIndex !== null) return; // don't cycle while hovering
      const visibleArray = Array.from(visibleNames).sort((a, b) => a - b);
      if (visibleArray.length === 0) return;
      const currentPos = visibleArray.indexOf(activeIndex);
      const nextPos = currentPos === -1 ? 0 : (currentPos + 1) % visibleArray.length;
      setActiveIndex(visibleArray[nextPos]);
    }, 3000);
    return () => clearInterval(timer);
  }, [visibleNames, hoverIndex, activeIndex]);

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
          ref={(el) => { if (el) nameRefs.current.set(originalIndex, el); }}
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

      {/* BOTTOM: pill in black space below image */}
      <div className="lnr-trusted-bottom">
        <a href="/shows" className="lnr-trusted-gallery-pill">Artist Gallery</a>
      </div>
    </section>
  );
}