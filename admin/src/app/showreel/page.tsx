import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Showreels — Late Night Ricky',
  description: 'Showreels from Late Night Ricky\'s performances around the world.',
};

export default function ShowreelPage() {
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
          {/* 2025 Showreel Card */}
          <div className="bg-white border-2 border-[#111] overflow-hidden hover:-translate-y-1.5 transition duration-400">
            <div className="relative pb-[56.25%] bg-[#111] cursor-pointer group">
              <video poster="/assets/ricky-hero-new.jpg" playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover"
                onClick={(e) => {
                  const v = e.currentTarget;
                  v.play();
                  (v.nextSibling as HTMLElement)?.classList.add('hidden');
                }}
              >
                <source src="/assets/video-desktop.mp4" type="video/mp4" />
                <source src="/assets/video-desktop.webm" type="video/webm" />
              </video>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center z-[2] group-hover:bg-white group-hover:scale-110 transition"
                onClick={(e) => {
                  const btn = e.currentTarget;
                  const video = btn.previousSibling as HTMLVideoElement;
                  video?.play();
                  btn.classList.add('hidden');
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#111"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-[clamp(24px,3vw,36px)] font-black uppercase leading-none tracking-[-1px] mb-3 text-[#111]">2025 Showreel</h3>
              <p className="text-sm text-[#555] leading-relaxed uppercase tracking-[0.5px]">Highlights from Ricky&apos;s biggest year yet — over 150 shows across five continents.</p>
              <p className="text-xs text-[#6B8FAB] uppercase tracking-[1.5px] mt-4 font-semibold">Dec 2025</p>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-[#E3E8ED] border-2 border-[#111] flex flex-col items-center justify-center min-h-[300px] p-10 text-center">
            <h3 className="text-[clamp(24px,3vw,36px)] font-black uppercase leading-none tracking-[-1px] mb-4 text-[#111]">More coming soon</h3>
            <p className="text-sm text-[#555] uppercase tracking-[0.5px]">Upload new showreels here as they become available.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
