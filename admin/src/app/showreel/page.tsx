'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
export const dynamic = 'force-dynamic';

interface VideoData {
  title: string;
  src: string;
  poster: string;
  year: string;
  description: string;
}

interface ShowreelCard {
  id: string;
  imagePath: string;
  title: string;
  subtitle: string;
  description: string;
}

const DEFAULT_VIDEOS: VideoData[] = [
  {
    title: '2025 Showreel',
    src: '/assets/video-desktop.mp4',
    poster: '/assets/ricky-hero-new.jpg',
    year: '2025',
    description: "Highlights from Ricky's biggest year yet — over 150 shows across five continents.",
  },
];

export default function ShowreelPage() {
  const [videos, setVideos] = useState<VideoData[]>(DEFAULT_VIDEOS);
  const [cards, setCards] = useState<ShowreelCard[]>([]);

  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch('/api/public/sections?page=showreel');
        const data = await res.json();
        const sections = data.sections || [];

        // Video section
        const videoSection = sections.find((s: any) => s.section === 'video');
        if (videoSection) {
          const videoPath = videoSection.videos?.[0] || videoSection.content?.[0];
          if (videoPath) {
            setVideos([{
              title: 'Showreel',
              src: videoPath,
              poster: '/assets/ricky-hero-new.jpg',
              year: new Date().getFullYear().toString(),
              description: '',
            }]);
          }
        }

        // Cards section
        const cardsSection = sections.find((s: any) => s.section === 'cards');
        if (cardsSection?.content) {
          const parsed = Array.isArray(cardsSection.content) ? cardsSection.content : [];
          if (parsed.length > 0 && typeof parsed[0] === 'object') {
            setCards(parsed.map((c: any) => ({
              id: c.id || `card-${Math.random()}`,
              imagePath: c.imagePath || '',
              title: c.title || 'Showreel',
              subtitle: c.subtitle || '',
              description: c.description || '',
            })));
          }
        }
      } catch {
        // keep defaults
      }
    }
    fetchSections();
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* Page Title Bar */}
        <div className="border-b-2 border-[#111] pt-24 pb-5 px-8">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-[clamp(48px,10vw,120px)] font-black tracking-[-3px] uppercase leading-[0.9] text-[#111]">Showreels</h1>
          </div>
        </div>

        {/* Showreels Grid */}
        <div className="max-w-[1200px] mx-auto px-8 py-16 grid md:grid-cols-2 gap-10">
          {videos.map((video, i) => (
            <div key={i} className="bg-white border-2 border-[#111] overflow-hidden hover:-translate-y-1.5 transition duration-400">
              <div className="relative pb-[56.25%] bg-[#111] cursor-pointer group">
                <video poster={video.poster} playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover"
                  onClick={(e) => {
                    const v = e.currentTarget;
                    v.play();
                    (v.nextSibling as HTMLElement)?.classList.add('hidden');
                  }}
                >
                  <source src={video.src} type="video/mp4" />
                  <source src={video.src.replace('.mp4', '.webm')} type="video/webm" />
                </video>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center z-[2] group-hover:bg-white group-hover:scale-110 transition"
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    const vid = btn.previousSibling as HTMLVideoElement;
                    vid?.play();
                    btn.classList.add('hidden');
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#111"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-[clamp(24px,3vw,36px)] font-black uppercase leading-none tracking-[-1px] mb-3 text-[#111]">{video.title}</h3>
                <p className="text-sm text-[#555] leading-relaxed uppercase tracking-[0.5px]">{video.description}</p>
                <p className="text-xs text-[#6B8FAB] uppercase tracking-[1.5px] mt-4 font-semibold">{video.year ? `Dec ${video.year}` : ''}</p>
              </div>
            </div>
          ))}

          {/* Showreel Cards from CMS */}
          {cards.map((card) => (
            <div key={card.id} className="bg-white border-2 border-[#111] overflow-hidden hover:-translate-y-1.5 transition duration-400">
              {card.imagePath && (
                <div className="relative pb-[56.25%] bg-[#111]">
                  <img src={card.imagePath} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <div className="p-8">
                <h3 className="text-[clamp(24px,3vw,36px)] font-black uppercase leading-none tracking-[-1px] mb-3 text-[#111]">{card.title}</h3>
                {card.subtitle && <p className="text-xs text-[#6B8FAB] uppercase tracking-[1.5px] mb-2 font-semibold">{card.subtitle}</p>}
                <p className="text-sm text-[#555] leading-relaxed uppercase tracking-[0.5px]">{card.description}</p>
              </div>
            </div>
          ))}

          {/* Coming Soon Card */}
          <div className="bg-[#E3E8ED] border-2 border-[#111] flex flex-col items-center justify-center min-h-[300px] p-10 text-center">
            <h3 className="text-[clamp(24px,3vw,36px)] font-black uppercase leading-none tracking-[-1px] mb-4 text-[#111]">More coming soon</h3>
            <p className="text-sm text-[#555] uppercase tracking-[0.5px]">Upload new showreels in the admin panel.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
