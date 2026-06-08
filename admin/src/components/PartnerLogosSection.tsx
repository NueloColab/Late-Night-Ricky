'use client';

import { useState, useEffect } from 'react';

interface Logo {
  id: number;
  name: string;
  imagePath: string | null;
  href: string | null;
  order: number;
  isActive: boolean;
}

interface PartnerLogosSectionProps {
  defaultLogos: { src: string; alt: string }[];
}

export default function PartnerLogosSection({ defaultLogos }: PartnerLogosSectionProps) {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partner-logos')
      .then((res) => res.json())
      .then((data) => {
        setLogos(data.logos || []);
        setLoading(false);
      })
      .catch(() => {
        setLogos([]);
        setLoading(false);
      });
  }, []);

  const displayLogos = logos.length > 0
    ? logos.filter((l) => l.isActive !== false).map((l) => ({
        src: l.imagePath || '',
        alt: l.name,
      }))
    : defaultLogos;

  return (
    <section id="partnerships" className="relative z-10 py-28 text-center" style={{ background: 'linear-gradient(180deg,#111 0%,#1a1b20 100%)' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="font-serif text-[clamp(28px,4vw,48px)] italic text-white mb-4">“The best DJ I've heard.”</h2>
        <p className="text-sm text-[#8FA8BE] mb-16 max-w-[500px] mx-auto">
          — Cristiano Ronaldo. Trusted by A-list artists, global brands, and sold-out crowds worldwide.
        </p>
        <div className="grid grid-cols-3 gap-8 md:gap-12 max-w-[900px] mx-auto">
          {displayLogos.map((logo, i) => (
            <div key={`${logo.alt}-${i}`} className="flex items-center justify-center h-20 w-32 mx-auto">
              {logo.src ? (
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-full max-w-full object-contain opacity-70 hover:opacity-100 transition duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xs text-white/50">{logo.alt}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-16">
          <a
            href="/showreel"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-white hover:text-[#111] transition"
          >
            All Partnerships
          </a>
        </div>
        <div className="mt-8">
          <a
            href="/assets/press-pack.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#8FA8BE] hover:text-white transition"
          >
            Download Press Pack
          </a>
        </div>
      </div>
    </section>
  );
}
