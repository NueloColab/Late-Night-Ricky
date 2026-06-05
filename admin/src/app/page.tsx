import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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

      {/* Geographic Reach */}
      <section id="reach" className="relative z-10 bg-[#1B3A4C] py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="reach">
            <h1 className="font-black text-[clamp(36px,5.5vw,64px)] leading-[0.95] max-w-[960px] text-white tracking-[-2px] uppercase">
              International DJ &amp; Grammy Winning Producer. From London to New York / LA to Las Vegas / Miami to Ibiza and beyond.
            </h1>
            <p className="text-sm mt-6 leading-relaxed max-w-[560px] text-[#8FA8BE] font-semibold uppercase tracking-[0.5px]">
              150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.
            </p>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#A3B5C4] to-transparent my-20" />
        </div>
      </section>

      {/* Shows */}
      <section id="shows" className="relative z-10 bg-white pt-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[clamp(36px,5.5vw,64px)] font-black text-center mb-5 text-[#111] tracking-[-2px] uppercase leading-[0.95]">
            Recent Shows &amp; Stories
          </h2>
          <p className="text-center text-sm text-[#5B7A8E] mb-16 max-w-[600px] mx-auto leading-relaxed font-semibold uppercase tracking-[0.5px]">
            A career built on unforgettable nights, iconic venues, and sold-out crowds.
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
          <div className="text-center mb-12">
            <a href="#shows" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-[#1B3A4C] rounded-full text-[#1B3A4C] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#1B3A4C] hover:text-white transition">
              All Shows &amp; Stories
            </a>
          </div>
        </div>
      </section>

      {/* Partnerships */}
      <section id="partnerships" className="relative z-10 py-28 text-center" style={{ background: 'linear-gradient(180deg,#111 0%,#1a1b20 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <blockquote className="font-serif text-[clamp(28px,4vw,44px)] font-normal text-white max-w-[900px] mx-auto mb-6 leading-snug">
            &ldquo;The best DJ I&apos;ve heard.&rdquo;
          </blockquote>
          <p className="text-[17px] text-[#8FA8BE] max-w-[640px] mx-auto mb-16 leading-relaxed">
            &mdash; Cristiano Ronaldo. Trusted by A-list artists, global brands, and sold-out crowds worldwide.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-[1000px] mx-auto mb-16 items-center">
            {partnerLogos.map((logo: any) => (
              <img key={logo.id} src={assetPath(logo.imagePath)} alt={logo.name} className="w-full max-w-[180px] mx-auto grayscale brightness-200 opacity-60 hover:grayscale-0 hover:brightness-100 hover:opacity-100 transition duration-500" />
            ))}
          </div>
          <a href="mailto:samir@wearemediahive.com" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-white hover:text-[#111] transition">
            All Partnerships
          </a>
          <div className="mt-8">
            <a href="/assets/press-pack.pdf" download className="text-[#A3B5C4] text-sm tracking-[0.5px] hover:text-white transition">
              Download Press Pack
            </a>
          </div>
        </div>
      </section>

      {/* Radio */}
      <section id="radio" className="relative z-10 bg-white py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative overflow-hidden rounded-2xl">
              <img src="/assets/ricky-spotify-new.jpg" alt="Late Night Ricky" className="w-full h-auto object-cover" />
              <div className="absolute bottom-5 right-5 flex items-end gap-[3px] z-10 p-3 rounded-lg bg-[#1B3A4C]/70 backdrop-blur-sm">
                {[12, 20, 16, 24, 14].map((h, i) => (
                  <span key={i} className="eq-bar" style={{ height: `${h}px`, animationDelay: `${[0, 0.2, 0.4, 0.1, 0.3][i]}s` }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Music &amp; Radio</p>
              <h2 className="text-[clamp(40px,6vw,80px)] font-black text-[#111] mb-5 leading-[0.95] tracking-[-2px] uppercase">As Heard On</h2>
              <p className="text-sm text-[#111] leading-relaxed mb-10 max-w-[420px] font-semibold uppercase tracking-[0.5px]">
                Preview snippets of the latest releases. Click play to hear 30-second previews, then stream or download the full tracks on Spotify and Apple Music.
              </p>
              <div className="flex gap-4 flex-wrap mb-10">
                {radioLinks?.spotify && (
                  <a href={radioLinks.spotify} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-[#111] rounded-full text-[#111] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#111] hover:text-white transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12"/><path d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.65-1.1 9.6-.9 13.25 1.3.45.25.6.85.35 1.3-.25.45-.85.6-1.25.35zM17.6 13.3c-2.8-1.7-7.1-2.2-10.3-1.2-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.7-1.15 8.5-.65 11.7 1.3.35.2.45.7.25 1.05-.2.35-.65.45-1.05.25zm-.25 2.35c-2.35-1.4-5.95-1.8-8.85-.95-.3.1-.65-.05-.75-.35-.1-.3.05-.65.35-.75 3.3-1 7.3-.6 10.05.95.25.15.35.5.2.75-.15.3-.5.4-.75.25z" fill="#fff"/></svg>
                    Spotify
                  </a>
                )}
                {radioLinks?.appleMusic && (
                  <a href={radioLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-[#111] rounded-full text-[#111] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#111] hover:text-white transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12"/><path d="M15.6 8.35c-.1 0-.2.02-.3.06-.7.23-1.4.35-2.1.35-.7 0-1.4-.12-2.1-.35-.1-.04-.2-.06-.3-.06-.35 0-.65.28-.65.63v4.04c0 .35.3.63.65.63.1 0 .2-.02.3-.06.7-.23 1.4-.35 2.1-.35.7 0 1.4.12 2.1.35.1.04.2.06.3.06.35 0 .65-.28.65-.63V8.98c0-.35-.3-.63-.65-.63zM12 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#fff"/></svg>
                    Apple Music
                  </a>
                )}
              </div>
              <div className="border-t border-[#E3E8ED] pt-6">
                {radioTracks.map((track: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 py-3.5 border-b border-[#E3E8ED] hover:bg-[rgba(227,232,237,0.4)] hover:mx-[-12px] hover:px-3 hover:rounded-lg transition cursor-pointer group">
                    <button className="w-10 h-10 rounded-full border-[1.5px] border-[#111] bg-transparent flex items-center justify-center text-[#111] group-hover:bg-[#111] group-hover:text-white transition flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 19 12 7 20" /></svg>
                    </button>
                    <div className="flex-1 flex justify-between items-center gap-4">
                      <span className="font-serif text-[16px] font-medium text-[#1B3A4C]">{track.title}</span>
                      <span className="text-[13px] text-[#6B8FAB] font-variant-numeric-tabular">{track.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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

      {/* Supporting / Clients */}
      <section id="supporting" className="relative z-10 bg-white pt-10 pb-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-sm text-[#5B7A8E] mb-10 tracking-[2px] uppercase text-center">Acts &amp; Private Clients</p>
          <h2 className="text-[clamp(36px,6vw,72px)] font-black tracking-[-2px] uppercase mb-10 text-[#111] text-center">Trusted By The Best</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {clientNames.map((c: any) => (
              <div key={c.id} className="text-[clamp(18px,2.2vw,28px)] font-black uppercase tracking-[-0.5px] leading-tight text-[#111] text-center py-3 px-2 hover:text-[#1B3A4C] transition cursor-default">{c.name}</div>
            ))}
          </div>
          <p className="text-sm text-[#5B7A8E] mt-10 tracking-[2px] uppercase text-center">And many more...</p>
        </div>
      </section>

      {/* Venue Marquee */}
      <section className="relative z-10">
        <div className="overflow-hidden bg-[#111] py-4">
          <div className="marquee-track">
            {[...venues, ...venues].map((venue: string, i: number) => (
              <span key={i} className="text-[#A3B5C4] text-[13px] font-semibold tracking-[1.5px] uppercase flex-shrink-0">{venue}<span className="ml-10 text-[#1B3A4C]">&bull;</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* Share Your Music */}
      <section id="share-music" className="relative z-10 bg-[#E3E8ED] py-28 text-center">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] uppercase mb-4 text-[#111]">Share Your Music</h2>
          <p className="text-[clamp(22px,3vw,36px)] font-black uppercase leading-tight tracking-[-1px] mb-12 text-[#111]">
            I&apos;m always on the lookout for new music to play, so send me your tracks
          </p>
          <a href="/share-music" className="inline-block px-10 py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition">Submit Your Track</a>
        </div>
      </section>

      {/* Reach Out */}
      <section id="reach-out" className="relative z-10 bg-[#111] text-white py-28">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-[clamp(42px,6vw,72px)] font-normal leading-tight mb-6 max-w-[500px]">Let&apos;s collaborate</h2>
            <p className="font-['Rockybilly',cursive] text-[clamp(28px,4vw,48px)] font-normal text-[#8FA8BE] mb-8 rotate-[-1deg] opacity-85">Late Night Ricky</p>
            <a href="#contact-form" className="inline-block px-9 py-3.5 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[2px] hover:bg-white hover:text-[#111] transition">Get in touch</a>
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <img src="/assets/ricky-hero-new.jpg" alt="Late Night Ricky" className="w-full h-auto object-cover grayscale" />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="relative z-10 bg-white">
        <div className="grid md:grid-cols-2 gap-0 min-h-[calc(100vh-70px)] items-stretch">
          <div className="relative overflow-hidden">
            <img src="/assets/ricky-hero-new.jpg" alt="Late Night Ricky" className="absolute top-0 left-0 w-full h-full object-cover object-top" />
          </div>
          <div className="py-20 px-8 md:px-16 max-w-[600px] mx-auto w-full">
            <div className="flex gap-0 mb-10">
              <button className="flex-1 py-3.5 px-7 border-2 border-[#111] bg-[#111] text-white text-xs font-semibold uppercase tracking-[1.5px]">Booking</button>
              <button className="flex-1 py-3.5 px-7 border-2 border-[#111] bg-white text-[#111] text-xs font-semibold uppercase tracking-[1.5px]">Private Message</button>
            </div>
            <form action="mailto:samir@wearemediahive.com" method="post" encType="text/plain">
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">Name *</label>
                <input type="text" name="name" required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">Email *</label>
                <input type="email" name="email" required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">Club Name *</label>
                <input type="text" name="club" required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">City *</label>
                <input type="text" name="city" required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">Fee *</label>
                <input type="text" name="fee" required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">Date *</label>
                <input type="date" name="date" required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
              </div>
              <button type="submit" className="w-full py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition">Submit</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}