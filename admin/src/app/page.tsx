import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RadioPlayer from '../components/RadioPlayer';
import { getSections, getShowCards, getPartnerLogos, getClientNames, getVenueTicker } from '../lib/api';
export const dynamic = 'force-dynamic';

export const revalidate = 60;

function assetPath(p?: string | null) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/')) return p;
  return '/' + p;
}

export default async function HomePage() {
  const [sections, showCards, partnerLogos, clientNames, venues] = await Promise.all([
    getSections('home'),
    getShowCards(),
    getPartnerLogos(),
    getClientNames(),
    getVenueTicker(),
  ]);

  const radioSection = sections.find((s: any) => s.section === 'radio');
  const radioTracks = Array.isArray(radioSection?.content) ? radioSection.content : [];
  const radioLinks = radioSection?.links || {};

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[100dvh] flex flex-col items-start justify-center px-8 md:px-14 pb-14 pt-20">
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat bg-[70%_center]"
            style={{ backgroundImage: "url('/assets/ricky-hero-v2.jpg')", filter: 'grayscale(100%) brightness(1.05)' }}
          />
          <div className="absolute inset-0 bg-[rgba(27,58,76,0.35)]" />
        </div>
        <img src="/assets/ricky-logo.png" alt="Late Night Ricky" className="relative z-10 w-[52%] max-w-[700px] min-w-[280px] ml-[4%] mb-14 drop-shadow-[0_6px_30px_rgba(0,0,0,0.3)] brightness-0 invert" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white opacity-70">
          <span className="text-[11px] tracking-[2.5px] uppercase font-medium">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* Shows */}
      <section id="shows" className="relative z-10 bg-white pt-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[clamp(36px,5.5vw,64px)] font-black text-center mb-5 text-[#111] tracking-[-2px] uppercase leading-[0.95]">
            Selected Shows
          </h2>
          <p className="text-center text-sm text-[#5B7A8E] mb-16 max-w-[600px] mx-auto leading-relaxed font-semibold uppercase tracking-[0.5px]">
            From stadium tours to private celebrations — every set tells a story.
          </p>
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {showCards.map((card: any) => (
              <a key={card.id} href={card.href || '#'} className="group block transition-transform duration-500 hover:-translate-y-1.5">
                <div className="relative w-full min-h-[520px] rounded-2xl overflow-hidden mb-6 flex items-end justify-start"
                  style={{ backgroundImage: `url('${assetPath(card.imagePath)}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%) brightness(1.05)' }}>
                  <div className="absolute inset-0 bg-[rgba(27,58,76,0.35)] pointer-events-none" />
                  <div className="relative z-10 p-10">
                    <h4 className="text-[clamp(28px,4vw,42px)] font-black text-white leading-none tracking-[-1px] uppercase mb-1.5 drop-shadow-[0_2px_14px_rgba(0,0,0,0.25)]">{card.title}</h4>
                    <span className="text-xs tracking-[3px] uppercase text-white/85 font-semibold">{card.venue} — {card.location}</span>
                  </div>
                </div>
                <p className="text-[13px] text-[#6B8FAB] mb-3 tracking-[2px] uppercase font-semibold">{card.season}</p>
                <h3 className="text-[clamp(20px,2.5vw,28px)] font-black leading-tight mb-2.5 text-[#111] tracking-[-0.5px] uppercase">{card.title}</h3>
                <p className="text-sm text-[#5B7A8E] leading-relaxed mb-4 font-semibold uppercase tracking-[0.5px]">{card.description}</p>
                <span className="inline-flex items-center gap-2 text-[#1B3A4C] text-sm font-medium tracking-[0.5px] group-hover:gap-3.5 transition-all">
                  View show <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Partnerships */}
      <section id="partnerships" className="relative z-10 py-28 text-center" style={{ background: 'linear-gradient(180deg,#111 0%,#1a1b20 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] font-normal text-white max-w-[900px] mx-auto mb-6 leading-snug">
            Trusted by the world&apos;s most iconic brands
          </h2>
          <p className="text-[17px] text-[#8FA8BE] max-w-[640px] mx-auto mb-16 leading-relaxed">
            From red carpets to race days — partnerships built on unforgettable nights.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-[1000px] mx-auto mb-16 items-center">
            {partnerLogos.map((logo: any) => (
              <img key={logo.id} src={assetPath(logo.imagePath)} alt={logo.name} className="w-full max-w-[180px] mx-auto grayscale brightness-200 opacity-60 hover:grayscale-0 hover:brightness-100 hover:opacity-100 transition duration-500" />
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="relative z-10 bg-white pt-10 pb-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[clamp(36px,6vw,72px)] font-black tracking-[-2px] uppercase mb-10 text-[#111] text-center">Supporting Act</h2>
          <p className="text-sm text-[#5B7A8E] mb-10 tracking-[2px] uppercase text-center">A few names we&apos;ve shared the stage with</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {clientNames.map((c: any) => (
              <div key={c.id} className="text-[clamp(18px,2.2vw,28px)] font-black uppercase tracking-[-0.5px] leading-tight text-[#111] text-center py-3 px-2 hover:text-[#1B3A4C] transition cursor-default">{c.name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Ticker */}
      <section className="relative z-10">
        <div className="overflow-hidden bg-[#111] py-4">
          <div className="marquee-track">
            {[...venues, ...venues].map((venue: string, i: number) => (
              <span key={i} className="text-[#A3B5C4] text-[13px] font-semibold tracking-[1.5px] uppercase flex-shrink-0">{venue}<span className="ml-10 text-[#1B3A4C]">&bull;</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* Radio */}
      <section className="relative z-10">
        <RadioPlayer tracks={radioTracks} links={radioLinks} />
      </section>

      {/* Carousel */}
      <section className="relative z-10 bg-white py-16 overflow-hidden">
        <div className="carousel-track">
          {['carousel-1.jpg','carousel-2.jpg','carousel-3.jpg','ricky-hero-new.jpg','ricky-radio-new.jpg','press-bg2.jpg','ricky-fricktion.jpg'].flatMap(s => [s, s]).map((src, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] h-[360px] rounded-xl overflow-hidden">
              <img src={`/assets/${src}`} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Share Music CTA */}
      <section className="relative z-10 bg-[#E3E8ED] py-28 text-center">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] uppercase mb-4 text-[#111]">Share Your Music</h2>
          <p className="text-[clamp(22px,3vw,36px)] font-black uppercase leading-tight tracking-[-1px] mb-12 text-[#111]">I&apos;m always on the lookout for new music to play</p>
          <a href="/share-music" className="inline-block px-10 py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition">Submit Your Track</a>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="relative z-10 bg-[#111] text-white py-28">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-[clamp(42px,6vw,72px)] font-normal leading-tight mb-10 max-w-[500px]">Let&apos;s create something unforgettable</h2>
            <a href="/contact" className="inline-block px-9 py-3.5 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[2px] hover:bg-white hover:text-[#111] transition">Get In Touch</a>
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <img src="/assets/ricky-portrait-new.jpg" alt="Late Night Ricky" className="w-full h-auto object-cover grayscale" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}