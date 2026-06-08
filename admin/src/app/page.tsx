import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import { getShowCards, getPartnerLogos, getClientNames, getVenueTicker, getTracks } from '@/lib/cms';
export const dynamic = 'force-dynamic';

const DEFAULT_SHOWS = [
  {
    href: '/show-sidemen',
    image: '/assets/ricky-hero-new.jpg',
    venue: 'Ministry of Sound',
    location: 'London',
    season: 'Spring / Summer 2025',
    title: 'Sidemen vs YouTube All Stars',
    description: "One of London's most iconic venues, packed to capacity.",
  },
  {
    href: '/show-gin-juice',
    image: '/assets/ricky-radio-new.jpg',
    venue: 'Ibiza Rocks',
    location: 'Ibiza',
    season: 'Spring / Summer 2024',
    title: 'Gin & Juice Launch',
    description: 'Sunset sets and poolside energy in the White Isle.',
  },
  {
    href: '/show-abu-dhabi',
    image: '/assets/press-bg2.jpg',
    venue: 'Skyline Festival',
    location: 'International',
    season: 'Autumn / Winter 2024',
    title: 'Abu Dhabi Grand Prix',
    description: 'Major festival appearance under the desert stars.',
  },
  {
    href: '/show-royal-wedding',
    image: '/assets/ricky-fricktion.jpg',
    venue: 'Private Events',
    location: 'Worldwide',
    season: 'Spring / Summer 2023',
    title: 'Royal Wedding of the Year',
    description: 'Exclusive corporate events and private celebrations.',
  },
];

const DEFAULT_LOGOS = [
  { src: '/assets/logo-f1.png?v=13', alt: 'Formula 1' },
  { src: '/assets/logo-coca-cola.png?v=13', alt: 'Coca-Cola' },
  { src: '/assets/logo-dior.png?v=13', alt: 'Dior' },
  { src: '/assets/logo-patek.png?v=13', alt: 'Patek Philippe' },
  { src: '/assets/logo-ciroc.png?v=13', alt: 'Cîroc' },
  { src: '/assets/logo-louis-vuitton.png?v=13', alt: 'Louis Vuitton' },
  { src: '/assets/logo-prime.png?v=13', alt: 'Prime' },
  { src: '/assets/logo-prime-boxing.png?v=13', alt: 'MF Boxing' },
  { src: '/assets/logo-cannes.png?v=13', alt: 'Festival de Cannes' },
  { src: '/assets/logo-cartier.png?v=13', alt: 'Cartier' },
];

const DEFAULT_CLIENTS = [
  '50 Cent', 'Bruno Mars', 'Chris Brown', 'Dr. Dre & Jimmy Iovine', 'Drake',
  'Future', 'Jason Momoa', 'Jason Statham', 'Justin Bieber', 'Kendrick Lamar',
  'Leonardo DiCaprio', 'Lewis Hamilton', 'Mick Jagger', 'Neymar Jnr', 'Paul McCartney',
  'Rihanna', 'Ronaldo', 'Travis Scott', 'Usain Bolt', 'Vin Diesel',
];

const DEFAULT_VENUES = [
  'LIV Miami', 'WALL Miami', 'TAPE London', 'HAKKASAN Las Vegas', 'MOVIDA Dubai',
  "JIMMY'Z Monte Carlo", 'MINISTRY OF SOUND London', '1 OAK New York', 'BYBLOS Milan',
  'PACHA Ibiza', 'ARMANI Dubai', 'MANDALAY BAY Las Vegas', 'TEMPLE San Francisco',
  'POPPY Los Angeles', 'CIRQUE LE SOIR London', 'HIGHLIGHT ROOM Los Angeles',
  "TEDDY'S @ ROOSEVELT Los Angeles", 'DELILAH Los Angeles', 'GIBSON Frankfurt',
  'LIO Ibiza', 'STUDIO PARIS Chicago', 'PREMIER @ BORGATE Atlantic City',
  'PARQ San Diego', 'BOOTSY BELLOWS Los Angeles', 'WARWICK Los Angeles',
  'LAVO New York', 'TAO New York', 'UP & DOWN New York', 'LIBERTINE London',
  'SCANDAL London', 'TOY ROOM Dubai', '1 OAK Dubai', 'TAO Las Vegas',
  'BAOLI Cannes', 'SHOKO Barcelona', 'LASTA Serbia', 'REX ROOMS London',
  "HARRIET'S Los Angeles", 'VIP ROOM St. Tropez', 'BON BONNIERE Mykonos',
  'DRAMA London', 'DEAR DARLING London', 'TRAMP London', 'SPIRITO Brussels',
  'CUCKOO CLUB London', 'RAFFLES London', 'SUBOIS Montreal', 'P1 Munich',
  "ZELO'S Monte Carlo", 'WIRELESS FESTIVAL UK', 'READING & LEEDS FESTIVAL UK',
];

const DEFAULT_TRACKS = [
  { title: 'Late Night Ricky — Midnight in London', time: '0:30' },
  { title: 'Late Night Ricky — Vegas Lights', time: '0:30' },
  { title: 'Late Night Ricky — Ibiza Sunrise', time: '0:30' },
  { title: 'Late Night Ricky — South Side', time: '0:30' },
  { title: 'Late Night Ricky — After Hours', time: '0:30' },
];

export default async function HomePage() {
  // Fetch from CMS — fall back to hardcoded defaults if DB is empty or unreachable
  let shows: any[] = DEFAULT_SHOWS;
  let logos: any[] = DEFAULT_LOGOS;
  let clients: string[] = DEFAULT_CLIENTS;
  let venues: string[] = DEFAULT_VENUES;
  let tracks = DEFAULT_TRACKS;

  try {
    const [dbCards, dbLogos, dbNames, dbVenues, dbTracks] = await Promise.all([
      getShowCards(),
      getPartnerLogos(),
      getClientNames(),
      getVenueTicker(),
      getTracks(),
    ]);

    if (dbTracks.length > 0) {
      tracks = dbTracks.map((t: any) => ({
        title: t.title,
        time: t.duration || '0:30',
      }));
    }

    if (dbCards.length > 0) {
      shows = dbCards.map((c: any) => ({
        href: c.href || '#',
        image: c.imagePath || '/assets/ricky-hero-new.jpg',
        venue: c.venue,
        location: c.location,
        season: c.season,
        title: c.title,
        description: c.description,
      }));
    }

    if (dbLogos.length > 0) {
      logos = dbLogos.map((l: any) => ({
        src: l.imagePath || '',
        alt: l.name,
      }));
    }

    if (dbNames.length > 0) {
      clients = dbNames.map((n: any) => n.name);
    }

    if (dbVenues && Array.isArray(dbVenues) && dbVenues.length > 0) {
      venues = dbVenues;
    }
  } catch {
    // DB unreachable — use hardcoded defaults, site works fine
  }

  return (
    <>
      <Navbar />
      <ScrollReveal />

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

      {/* Video / Showreel */}
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

      {/* Reach */}
      <section id="reach" className="relative z-10 bg-[#1B3A4C] py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="reveal font-black text-[clamp(36px,5.5vw,64px)] leading-[0.95] max-w-[960px] text-white tracking-[-2px] uppercase">
            International DJ &amp; Grammy Winning Producer. From London to New York / LA to Las Vegas / Miami to Ibiza and beyond.
          </h1>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mt-6">
            <p className="reveal reveal-d1 text-sm leading-relaxed max-w-[560px] text-[#8FA8BE] font-semibold uppercase tracking-[0.5px]">
              150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.
            </p>
            <div className="grammy-float grammy-glow relative w-[120px] md:w-[160px] flex-shrink-0">
              <img
                src="/assets/grammy-gold-v2.png?v=2"
                alt="Grammy Award"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#A3B5C4] to-transparent my-20" />
        </div>
      </section>

      {/* Shows */}
      <section id="shows" className="relative z-10 bg-white pt-28 pb-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="reveal text-[clamp(36px,5.5vw,64px)] font-black text-center mb-5 text-[#111] tracking-[-2px] uppercase leading-[0.95]">
            RECENT SHOWS &amp; STORIES
          </h2>
          <p className="reveal reveal-d1 text-center text-sm text-[#5B7A8E] mb-16 max-w-[600px] mx-auto leading-relaxed font-semibold uppercase tracking-[0.5px]">
            A career built on unforgettable nights, iconic venues, and sold-out crowds.
          </p>
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {shows.map((show, i) => (
              <a key={show.title} href={show.href} className={`reveal reveal-d${Math.min(i + 1, 3)} group block transition-transform duration-500 hover:-translate-y-1.5`}>
                <div
                  className="relative w-full min-h-[520px] rounded-2xl overflow-hidden mb-6 flex items-end justify-start"
                  style={{ backgroundImage: `url('${show.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-[#1B3A4C]/60 pointer-events-none" />
                  <div className="relative z-10 p-10">
                    <h4 className="text-[clamp(28px,4vw,42px)] font-black text-white leading-none tracking-[-1px] uppercase mb-1.5 drop-shadow-[0_2px_14px_rgba(0,0,0,0.25)]">
                      {show.venue}
                    </h4>
                    <span className="text-xs tracking-[3px] uppercase text-white/85 font-semibold">{show.location}</span>
                  </div>
                  <div className="absolute bottom-[30px] right-[30px] z-[3] w-14 h-14 rounded-full border-2 border-white/70 flex items-center justify-center text-white bg-white/10 backdrop-blur-sm transition-all group-hover:bg-white group-hover:border-white group-hover:text-[#111]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </div>
                <p className="text-[13px] text-[#6B8FAB] mb-3 tracking-[2px] uppercase font-semibold">{show.season}</p>
                <h3 className="text-[clamp(20px,2.5vw,28px)] font-black leading-tight mb-2.5 text-[#111] tracking-[-0.5px] uppercase">{show.title}</h3>
                <p className="text-sm text-[#5B7A8E] leading-relaxed mb-4 font-semibold uppercase tracking-[0.5px]">{show.description}</p>
              </a>
            ))}
          </div>
          <div className="text-center mb-12">
            <a href="#shows" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-[#1B3A4C] rounded-full text-[#1B3A4C] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#1B3A4C] hover:text-white transition mb-10">
              All Shows &amp; Stories
            </a>
          </div>
        </div>
      </section>

      {/* Partnerships */}
      <section id="partnerships" className="relative z-10 py-28 text-center" style={{ background: 'linear-gradient(180deg,#111 0%,#1a1b20 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <blockquote className="reveal font-serif text-[clamp(28px,4vw,44px)] font-normal text-white max-w-[900px] mx-auto mb-6 leading-snug">
            &ldquo;The best DJ I&apos;ve heard.&rdquo;
          </blockquote>
          <p className="text-[17px] text-[#8FA8BE] max-w-[640px] mx-auto mb-16 leading-relaxed">
            &mdash; Cristiano Ronaldo. Trusted by A-list artists, global brands, and sold-out crowds worldwide.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 max-w-[1000px] mx-auto mb-16 items-center">
            {logos.map((logo) => (
              <div key={logo.alt} className="flex items-center justify-center h-20 w-32 mx-auto">
                <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain opacity-70 hover:opacity-100 transition duration-500" />
              </div>
            ))}
          </div>
          <a href="mailto:samir@wearemediahive.com" className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-white hover:text-[#111] transition">
            All Partnerships
          </a>
          <div className="mt-8">
            <a href="/assets/press-pack.pdf" download="press-pack.pdf" target="_blank" rel="noopener noreferrer" className="text-[#A3B5C4] text-sm tracking-[0.5px] hover:text-white transition">
              Download Press Pack
            </a>
          </div>
        </div>
      </section>

      {/* Radio */}
      <section id="radio" className="reveal relative z-10 bg-white py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative overflow-hidden rounded-2xl">
              <img src="/assets/ricky-radio-new.jpg" alt="Late Night Ricky" className="w-full h-auto object-cover" />
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
                Preview snippets of the latest releases. Click play to hear 30-second previews, then stream or download the full tracks on Spotify, Apple Music and YouTube.
              </p>
              <div className="flex gap-4 flex-wrap mb-10">
                <a href="https://open.spotify.com/artist/3lOtUgicoyDn2qKe5zc3dl?si=M3MjTUy7TOmOhc676Dsgvw" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[#111] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#111] hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.31a.746.746 0 01-1.03.24c-2.66-1.62-6.008-1.98-9.95-1.083a.746.746 0 11-.413-1.433c4.308-1.244 8.007-.706 10.953 1.075a.746.746 0 01.44 1.201zm1.47-3.27a.934.934 0 01-1.288.308c-3.044-1.86-7.683-2.398-11.282-1.312a.934.934 0 11-.558-1.783c4.125-1.29 9.218-.663 12.637 1.421.443.27.562.856.29 1.366zm.126-3.403c-3.652-2.167-9.674-2.374-13.158-1.31a1.121 1.121 0 11-.662-2.142c3.977-1.239 10.56-.998 14.703 1.463a1.121 1.121 0 11-.883 1.989z" fill="currentColor"/></svg>
                  Spotify
                </a>
                <a href="https://music.apple.com/gb/artist/late-night-ricky/1759491226" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[#111] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#111] hover:text-white transition">
                  <img src="/assets/apple-logo.png" alt="Apple" className="h-5 w-auto invert-0 group-hover:invert transition" />
                  Apple
                </a>
                <a href="https://www.youtube.com/@LateNightRicky" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[#111] text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-[#111] hover:text-white transition">
                  <svg width="20" height="16" viewBox="0 0 24 24" fill="none"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/></svg>
                  YouTube
                </a>
              </div>
              <div className="border-t border-[#E3E8ED] pt-6">
                {tracks.map((track, i) => (
                  <div key={i} className="flex items-center gap-4 py-3.5 border-b border-[#E3E8ED] hover:bg-[rgba(227,232,237,0.4)] hover:mx-[-12px] hover:px-3 hover:rounded-lg transition cursor-pointer group">
                    <button className="w-10 h-10 rounded-full border-[1.5px] border-[#111] bg-transparent flex items-center justify-center text-[#111] group-hover:bg-[#111] group-hover:text-white transition flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 19 12 7 20" /></svg>
                    </button>
                    <div className="flex-1 flex justify-between items-center gap-4">
                      <span className="font-serif text-[16px] font-medium text-[#1B3A4C]">{track.title}</span>
                      <span className="text-[13px] text-[#6B8FAB] font-variant-numeric-tabular">{track.time}</span>
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
          {['carousel-1.jpg','carousel-2.jpg','carousel-3.jpg','ricky-hero-new.jpg','ricky-radio-new.jpg','press-bg2.jpg','ricky-fricktion.jpg'].map((src, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] h-[360px] rounded-xl overflow-hidden">
              <img src={`/assets/${src}`} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Clients */}
      <section id="supporting" className="reveal relative z-10 bg-white pt-10 pb-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-sm text-[#5B7A8E] mb-10 tracking-[2px] uppercase text-center">Acts &amp; Private Clients</p>
          <h2 className="text-[clamp(36px,6vw,72px)] font-black tracking-[-2px] uppercase mb-10 text-[#111] text-center">Trusted By The Best</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {clients.map((name) => (
              <div key={name} className="text-[clamp(18px,2.2vw,28px)] font-black uppercase tracking-[-0.5px] leading-tight text-[#111] text-center py-3 px-2 hover:text-[#1B3A4C] transition cursor-default">{name}</div>
            ))}
          </div>
          <p className="text-sm text-[#5B7A8E] mt-10 tracking-[2px] uppercase text-center">And many more...</p>
        </div>
      </section>

      {/* Venue Marquee */}
      <section className="relative z-10">
        <div className="overflow-hidden bg-[#111] py-4">
          <div className="marquee-track">
            {[...venues, ...venues].map((venue, i) => (
              <span key={i} className="text-[#A3B5C4] text-[13px] font-semibold tracking-[1.5px] uppercase flex-shrink-0">
                {venue}<span className="ml-10 text-[#1B3A4C]">&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Share Music */}
      <section id="share-music" className="reveal relative z-10 bg-[#E3E8ED] py-28 text-center">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-2px] uppercase mb-4 text-[#111]">Share Your Music</h2>
          <p className="text-[clamp(22px,3vw,36px)] font-black uppercase leading-tight tracking-[-1px] mb-12 text-[#111]">
            I&apos;m always on the lookout for new music to play, so send me your tracks
          </p>
          <div className="border-[3px] border-dashed border-[#111] p-12 md:p-16 text-center transition-colors hover:border-[#1B3A4C] hover:bg-[rgba(27,58,76,0.02)] cursor-pointer max-w-[600px] mx-auto mb-8">
            <a href="/share-music" className="inline-block px-10 py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition">
              Upload your track
            </a>
            <p className="mt-4 text-sm text-[#5B7A8E]">Click the button and upload your file in mp3 320 kbps</p>
          </div>
          <a href="/share-music" className="inline-block px-10 py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition w-full max-w-[600px]">
            Submit Track
          </a>
        </div>
      </section>

      {/* Reach Out */}
      <section id="reach-out" className="reveal relative z-10 bg-[#111] text-white py-28">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-[clamp(42px,6vw,72px)] font-normal leading-tight mb-6 max-w-[500px]">Let&apos;s collaborate</h2>
            <p className="font-['Rockybilly',cursive] text-[clamp(28px,4vw,48px)] font-normal text-[#8FA8BE] mb-8 rotate-[-1deg] opacity-85 whitespace-nowrap">Late Night Ricky</p>
            <a href="#contact-form" className="inline-block px-9 py-3.5 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[2px] hover:bg-white hover:text-[#111] transition">
              Get in touch
            </a>
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
              {[
                { label: 'Name *', name: 'name', type: 'text' },
                { label: 'Email *', name: 'email', type: 'email' },
                { label: 'Club Name *', name: 'club', type: 'text' },
                { label: 'City *', name: 'city', type: 'text' },
                { label: 'Fee *', name: 'fee', type: 'text' },
                { label: 'Date *', name: 'date', type: 'date' },
              ].map((field) => (
                <div key={field.name} className="mb-5">
                  <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#5B7A8E] mb-2">{field.label}</label>
                  <input type={field.type} name={field.name} required className="w-full border border-[#E3E8ED] rounded-lg px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
                </div>
              ))}
              <button type="submit" className="w-full py-4 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition">Submit</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
