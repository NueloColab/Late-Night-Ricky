'use client';

export default function VideoShowreelSection() {
  return (
    <section id="video" className="relative w-full min-h-screen overflow-hidden bg-[#111] flex items-center justify-center z-[1]">
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(17,17,17,0.3)] via-transparent to-[rgba(17,17,17,0.3)] z-[2] pointer-events-none" />
      <div className="relative z-[3] text-center flex flex-col items-center gap-8">
        <a href="/showreel" className="inline-block px-12 py-4 border-2 border-white rounded-full bg-transparent text-white text-sm font-semibold uppercase tracking-[2.5px] hover:bg-white hover:text-[#111] transition">
          WATCH SHOWREEL
        </a>
      </div>
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        poster="/assets/video-poster-desktop.jpg"
        playsInline
        autoPlay
        muted
        loop
        preload="metadata"
      >
        <source src="/assets/video-desktop.mp4" type="video/mp4" />
        <source src="/assets/video-desktop.webm" type="video/webm" />
      </video>
    </section>
  );
}
