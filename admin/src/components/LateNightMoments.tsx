'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface MomentData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  images: string[];
  video?: string;
}

const momentsData: MomentData[] = [
  {
    id: 'misfits',
    title: 'Misfits Boxing',
    subtitle: 'Ministry of Sound, London',
    description: 'Headlining the biggest influencer boxing event in the UK. Misfits Boxing at Ministry of Sound brought together sport, music, and culture for an unforgettable night.',
    images: ['/assets/highlight-studio.jpg', '/assets/highlight-arena.jpg', '/assets/moment-ibiza.jpg'],
    video: '/assets/showreel-video.mp4',
  },
  {
    id: 'o2',
    title: 'O2 Arena',
    subtitle: 'The O2, London',
    description: 'Performing to a sold-out crowd at The O2 Arena, one of London\'s most iconic venues. A landmark moment in the Late Night Ricky journey.',
    images: ['/assets/highlight-arena.jpg', '/assets/highlight-studio.jpg', '/assets/press-bg2.jpg'],
  },
  {
    id: 'ibiza',
    title: 'Ibiza Summer',
    subtitle: 'Ushuaïa, Ibiza',
    description: 'Summer residency at Ushuaïa, the world\'s most iconic open-air club. Ibiza sunsets and unforgettable energy every single night.',
    images: ['/assets/moment-ibiza.jpg', '/assets/highlight-club.jpg', '/assets/highlight-misfits.jpg'],
  },
  {
    id: 'private',
    title: 'Private Events',
    subtitle: 'Worldwide',
    description: 'Exclusive performances for A-list celebrities, brands, and private gatherings across the globe. From London to Dubai, every event is curated to perfection.',
    images: ['/assets/press-bg2.jpg', '/assets/highlight-club.jpg', '/assets/highlight-studio.jpg'],
  },
  {
    id: 'backtoback',
    title: 'Back to Back',
    subtitle: 'Private Events, London',
    description: 'Intimate back-to-back sets with some of the biggest names in the industry. These moments define the underground London scene.',
    images: ['/assets/highlight-club.jpg', '/assets/highlight-misfits.jpg', '/assets/press-bg2.jpg'],
  },
  {
    id: 'ibizarocks',
    title: 'Ibiza Rocks',
    subtitle: 'Ibiza Rocks, Ibiza',
    description: 'High-energy daytime pool parties at Ibiza Rocks. The ultimate summer soundtrack for thousands of party-goers from around the world.',
    images: ['/assets/highlight-misfits.jpg', '/assets/moment-ibiza.jpg', '/assets/highlight-arena.jpg'],
  },
];

export default function LateNightMoments() {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const [videoOverlay, setVideoOverlay] = useState(false);
  const [videoOverlayVisible, setVideoOverlayVisible] = useState(false);

  const activeMoment = momentsData.find((m) => m.id === openModal);

  const open = (id: string) => {
    setOpenModal(id);
    setTimeout(() => setModalVisible(true), 50);
  };
  const close = () => {
    setModalVisible(false);
    setTimeout(() => setOpenModal(null), 400);
  };
  const openVideo = () => {
    setVideoOverlay(true);
    setTimeout(() => setVideoOverlayVisible(true), 50);
  };
  const closeVideo = () => {
    setVideoOverlayVisible(false);
    setTimeout(() => setVideoOverlay(false), 400);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (galleryRef.current?.offsetLeft || 0);
    scrollStart.current = galleryRef.current?.scrollLeft || 0;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !galleryRef.current) return;
    e.preventDefault();
    const x = e.pageX - (galleryRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    galleryRef.current.scrollLeft = scrollStart.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <>
      {/* ═══ LATE NIGHT MOMENTS — 3x2 grid, title above image, square B&W ═══ */}
      <section id="moments" className="relative py-20 md:py-28 px-6 md:px-14 overflow-hidden">
        {/* Slightly creamier warm background */}
        <div className="absolute inset-0 bg-[#f0e6d8]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8d4b8]/20 via-transparent to-[#d4c4a8]/15" />

        <div className="relative z-10 max-w-[1400px] mx-auto">
          <h2 className="flex items-center justify-center gap-2 md:gap-3 text-[clamp(32px,5vw,56px)] font-black uppercase tracking-[-1px] leading-[1.1] text-[#5a3a1a] text-center mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
            <span className="reveal-left" data-delay="100">Late Night</span>
            <span className="reveal-right" data-delay="300">Moments</span>
          </h2>
          <p className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#5a3a1a]/50 font-medium text-center mb-14 md:mb-20 reveal-fade">
            An insight to Ricky&apos;s world
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 reveal-stagger">
            {momentsData.map((moment) => (
              <button
                key={moment.id}
                onClick={() => open(moment.id)}
                className="group block text-left w-full"
              >
                <h3 className="font-['Playfair_Display',serif] text-[clamp(16px,2vw,22px)] font-bold text-[#2a1a0a] group-hover:text-[#5a3a1a] transition-colors leading-[1.2] mb-1">
                  {moment.title}
                </h3>
                <p className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-[#5a3a1a]/50 font-medium mb-2">
                  {moment.subtitle}
                </p>
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={moment.images[0]}
                    alt={moment.title}
                    className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Animated V arrow scroll prompt */}
          <div className="flex flex-col items-center mt-12 md:mt-16 animate-bounce-slow">
            <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#5a3a1a]/40 font-medium mb-3">
              Scroll
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#5a3a1a]/50">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </section>

      {/* ═══ MODAL ═══ */}
      {activeMoment && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={close}
        >
          {/* Backdrop */}
          <div className={`absolute inset-0 bg-[#2a1a0a]/90 backdrop-blur-[8px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${modalVisible ? 'opacity-100' : 'opacity-0'}`} />

          {/* Modal box — leather background */}
          <div
            className={`modal-scroll-hide relative z-10 w-full max-w-[1100px] max-h-[75vh] overflow-y-auto rounded-xl border border-[#e8d4b8]/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(42,26,10,0.05)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${modalVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.92] translate-y-8'}`}
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Wrapper that grows with content */}
            <div className="relative min-h-full">
              {/* Leather background image — covers full content */}
              <div className="absolute inset-0 z-0 rounded-xl overflow-hidden">
                <img src="/assets/venues-bg.jpg" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#2a1a0a]/70" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#5c4328]/40 via-transparent to-[#2a1a0a]/70" />
              </div>

              {/* Close button */}
              <button
                onClick={close}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#e8d4b8]/10 hover:bg-[#e8d4b8]/20 flex items-center justify-center transition-colors"
              >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#e8d4b8]">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="relative z-10 p-5 md:p-8">
              {/* Title */}
              <h2 className="text-[clamp(24px,3.5vw,40px)] font-black uppercase tracking-[-1px] leading-[1] text-[#e8d4b8] mb-2 pr-12" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {activeMoment.title}
              </h2>
              <p className="text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-[#d4c4a8]/80 font-medium mb-4">
                {activeMoment.subtitle}
              </p>

              {/* Description */}
              <p className="text-[13px] md:text-[14px] leading-[1.7] text-[#d4c4a8]/90 mb-5">
                {activeMoment.description}
              </p>

              {/* Gallery */}
              <div className="mb-5">
                <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#d4c4a8]/60 font-medium mb-3">
                  Gallery
                </p>
                <div
                  ref={galleryRef}
                  className="flex gap-3 overflow-x-auto pb-3 cursor-grab active:cursor-grabbing select-none"
                  style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {activeMoment.images.map((img, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-[260px] md:w-[300px] aspect-square overflow-hidden rounded-lg shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <img
                        src={img}
                        alt={`${activeMoment.title} ${i + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
                {/* Gallery dots */}
                <div className="flex gap-2 justify-center mt-3">
                  {activeMoment.images.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${i === 0 ? 'bg-[#e8d4b8]' : 'bg-[#e8d4b8]/30'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Video */}
              <div className="mb-2">
                <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#d4c4a8]/60 font-medium mb-3">
                  Video
                </p>
                <div className="max-w-[600px] mx-auto aspect-video overflow-hidden rounded-lg shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)] bg-[#2a1a0a]/20 flex items-center justify-center cursor-pointer">
                  {activeMoment.video ? (
                    <video
                      src={activeMoment.video}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      onClick={(e) => { e.stopPropagation(); openVideo(); }}
                    />
                  ) : (
                    <p className="text-[13px] text-[#d4c4a8]/60 font-medium">
                      Video coming soon
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* Video overlay — smooth elegant transition */}
          {videoOverlay && activeMoment.video && (
            <div
              className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${videoOverlayVisible ? 'opacity-100' : 'opacity-0'}`}
              onClick={closeVideo}
            >
              <div className={`absolute inset-0 bg-[#2a1a0a]/95 backdrop-blur-[12px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${videoOverlayVisible ? 'opacity-100' : 'opacity-0'}`} />
              <div
                className={`relative z-10 w-full max-w-[900px] aspect-video transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${videoOverlayVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.92] translate-y-6'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <video
                  src={activeMoment.video}
                  className="w-full h-full object-cover rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
                  controls
                  autoPlay
                  playsInline
                />
                <button
                  onClick={closeVideo}
                  className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        .modal-scroll-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
