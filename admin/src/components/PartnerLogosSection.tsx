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
  quote?: string;
  attribution?: string;
  description?: string;
  pressPack?: string;
}

export default function PartnerLogosSection({ defaultLogos, quote, attribution, description, pressPack }: PartnerLogosSectionProps) {
  const [logos, setLogos] = useState<Logo[]>([]);

  useEffect(() => {
    fetch('/api/partner-logos')
      .then((res) => res.json())
      .then((data) => {
        setLogos(data.logos || []);
      })
      .catch(() => {
        setLogos([]);
      });
  }, []);

  const displayLogos = logos.length > 0
    ? logos.filter((l) => l.isActive !== false).map((l) => ({
        src: l.imagePath || '',
        alt: l.name,
      }))
    : defaultLogos;

  return (
    <section id="partnerships" className="relative z-10 py-28 md:py-32 text-center pb-36 md:pb-28"
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D2A3A 50%, #0A1628 100%)' }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="font-serif text-[clamp(24px,3.5vw,40px)] italic text-[#F0EDE6] mb-4">“{quote}”</h2>
        <p className="text-sm text-[#6B8E9B] mb-16 max-w-[500px] mx-auto">
          — {attribution}{description ? `. ${description}` : ''}
        </p>
        <div className="grid grid-cols-3 gap-8 md:gap-12 max-w-[900px] mx-auto">
          {displayLogos.map((logo, i) => (
            <div key={`${logo.alt}-${i}`} className="flex items-center justify-center h-20 w-32 mx-auto">
              {logo.src ? (
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-full max-w-full object-contain opacity-60 hover:opacity-100 transition duration-500 hover:drop-shadow-[0_0_8px_rgba(100,200,168,0.3)]"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-xs text-[#6B8E9B]/50">{logo.alt}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-16">
          <a
            href="/showreel"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#F0EDE6]/30 rounded-full text-[#F0EDE6] text-[13px] font-medium uppercase tracking-[1.5px] hover:bg-[#2E5C8A]/30 hover:border-[#64C8A8]/50 transition"
          >
            All Partnerships
          </a>
        </div>
        {pressPack && (
          <div className="mt-8">
            <a
              href={pressPack}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#6B8E9B] hover:text-[#64C8A8] transition"
            >
              Download Press Pack
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
