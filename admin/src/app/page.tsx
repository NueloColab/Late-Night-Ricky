import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import AudioTrackList from '../components/AudioTrackList';
import PartnerLogosSection from '../components/PartnerLogosSection';
import HomeContactSection from '../components/HomeContactSection';
import { getShowCards, getClientNames, getVenueTicker, getTracks, getSiteSections, getSeoMeta } from '@/lib/cms';
import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeoMeta('home');
  return {
    title: meta?.title || 'Late Night Ricky — International DJ & Grammy Winning Producer',
    description: meta?.description || 'From London to New York / LA to Las Vegas / Miami to Ibiza and beyond. 150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.',
  };
}

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

function assetPath(p?: string | null) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/')) return p;
  return '/' + p;
}

export default async function HomePage() {
  // Fetch from CMS — fall back to hardcoded defaults if DB is empty or unreachable
  let shows: any[] = DEFAULT_SHOWS;
  let clients: string[] = DEFAULT_CLIENTS;
  let venues: string[] = DEFAULT_VENUES;
  let tracks = DEFAULT_TRACKS;
  let heroImage = '/assets/ricky-hero-v2.jpg';
  let heroLogo = '/assets/ricky-logo.png';
  let heroGrayscale = true;
  let heroBackgroundSize = 'cover';
  let heroBackgroundPosition = '70% center';
  let radioImage = '/assets/ricky-radio-new.jpg';
  let radioHeadline = 'As Heard On';
  let radioLabel = 'Music \u0026 Radio';
  let radioDescription = 'Preview snippets of the latest releases. Click play to hear 30-second previews, then stream or download the full tracks on Spotify, Apple Music and YouTube.';
  let spotifyUrl = 'https://open.spotify.com/artist/3lOtUgicoyDn2qKe5zc3dl?si=M3MjTUy7TOmOhc676Dsgvw';
  let appleMusicUrl = 'https://music.apple.com/gb/artist/late-night-ricky/1759491226';
  let youtubeUrl = 'https://www.youtube.com/@LateNightRicky';
  let partnersQuote = "The best DJ I've heard.";
  let partnersAttribution = 'Cristiano Ronaldo';
  let partnersDescription = 'Trusted by A-list artists, global brands, and sold-out crowds worldwide.';
  let pressPack = '/assets/press-pack.pdf';
  let clientsTitle = 'Trusted By The Best';
  let shareMusicHeadline = 'Share Your Music';
  let shareMusicDescription = "I'm always on the lookout for new music to play, so send me your tracks";
  let reachOutImage = '/assets/ricky-hero-new.jpg';
  let reachOutCta = 'Get in touch';
  try {
    const [dbCards, dbNames, dbVenues, dbTracks, dbSections] = await Promise.all([
      getShowCards(),
      getClientNames(),
      getVenueTicker(),
      getTracks(),
      getSiteSections('home'),
    ]);

    if (dbSections.length > 0) {
      const heroSection = dbSections.find((s: any) => s.section === 'hero');
      if (heroSection?.content) {
        const c = typeof heroSection.content === 'string' ? JSON.parse(heroSection.content) : heroSection.content;
        if (c.image) heroImage = c.image;
        if (c.logo) heroLogo = c.logo;
        if (c.grayscale !== undefined) heroGrayscale = c.grayscale;
        if (c.backgroundSize) heroBackgroundSize = c.backgroundSize;
        if (c.backgroundPosition) heroBackgroundPosition = c.backgroundPosition;
      }
      const radioSection = dbSections.find((s: any) => s.section === 'radio');
      if (radioSection?.content) {
        const c = typeof radioSection.content === 'string' ? JSON.parse(radioSection.content) : radioSection.content;
        if (c.headline) radioHeadline = c.headline;
        if (c.description) radioDescription = c.description;
        if (c.image) radioImage = c.image;
        if (c.label) radioLabel = c.label;
        if (c.spotifyUrl) spotifyUrl = c.spotifyUrl;
        if (c.appleMusicUrl) appleMusicUrl = c.appleMusicUrl;
        if (c.youtubeUrl) youtubeUrl = c.youtubeUrl;
      }
      const partnersSection = dbSections.find((s: any) => s.section === 'partners');
      if (partnersSection?.content) {
        const c = typeof partnersSection.content === 'string' ? JSON.parse(partnersSection.content) : partnersSection.content;
        if (c.quote) partnersQuote = c.quote;
        if (c.attribution) partnersAttribution = c.attribution;
        if (c.description) partnersDescription = c.description;
        if (c.pressPack) pressPack = c.pressPack;
      }
      const clientsSection = dbSections.find((s: any) => s.section === 'clients');
      if (clientsSection?.content) {
        const c = typeof clientsSection.content === 'string' ? JSON.parse(clientsSection.content) : clientsSection.content;
        if (c.title) clientsTitle = c.title;
      }
      const shareMusicSection = dbSections.find((s: any) => s.section === 'share_music');
      if (shareMusicSection?.content) {
        const c = typeof shareMusicSection.content === 'string' ? JSON.parse(shareMusicSection.content) : shareMusicSection.content;
        if (c.headline) shareMusicHeadline = c.headline;
        if (c.description) shareMusicDescription = c.description;
      }
      const reachOutSection = dbSections.find((s: any) => s.section === 'reach_out');
      if (reachOutSection?.content) {
        const c = typeof reachOutSection.content === 'string' ? JSON.parse(reachOutSection.content) : reachOutSection.content;
        if (c.image) reachOutImage = c.image;
        if (c.cta) reachOutCta = c.cta;
      }
    }

    if (dbTracks.length > 0) {
      tracks = dbTracks.map((t: any) => ({
        title: t.title,
        time: t.duration || '0:30',
        src: t.filePath,
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

    if (dbNames.length > 0) {
      clients = dbNames.map((n: any) => n.name);
    }

    if (dbVenues && Array.isArray(dbVenues) && dbVenues.length > 0) {
      venues = dbVenues;
    }
  } catch {
    // DB unreachable — use hardcoded defaults, site works fine
  }

  // Triplicate for seamless marquee loops
  const venueRows = venues.length > 0 ? [...venues, ...venues, ...venues] : ['NO UPCOMING SHOWS'];
  const clientRows = clients.length > 0 ? [...clients, ...clients, ...clients] : ['STAY TUNED'];

  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* ══════════════════════════════════════════════════════════════
          HERO — CMS-driven, kept from v231
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-8 md:px-14 pb-14 pt-20">
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#8db8d8' }}>
          <div
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url('${heroImage}')`,
              backgroundSize: heroBackgroundSize,
              backgroundPosition: heroBackgroundPosition,
              filter: heroGrayscale ? 'grayscale(100%) brightness(1.3)' : 'none',
              mixBlendMode: 'multiply',
            }}
          />
        </div>
        <img src={heroLogo} alt="Late Night Ricky" className="relative z-10 w-[52%] max-w-[700px] min-w-[280px] mx-auto mb-14 brightness-0 invert opacity-80 drop-shadow-[0_4px_30px_rgba(255,255,255,0.3)]" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white opacity-70">
          <span className="text-[11px] tracking-[2.5px] uppercase font-medium">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SHOWS / TOUR MARQUEE — Garrix-style outlined scrolling text
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0a0e17] py-24 md:py-32 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-14 md:mb-20">
          <h2 className="text-[clamp(36px,5.5vw,64px)] font-black text-center mb-5 text-white tracking-[-2px] uppercase leading-[0.95]">
            Selected Shows
          </h2>
          <p className="text-center text-sm text-[#6B8FAB] max-w-[600px] mx-auto leading-relaxed font-semibold uppercase tracking-[0.5px]">
            From stadium tours to private celebrations — every set tells a story.
          </p>
        </div>

        {/* Row 1 */}
        <div className="marquee-row mb-4 md:mb-6">
          <div className="marquee-row-inner" style={{ animationDuration: '30s' }}>
            {venueRows.map((venue: any, i: number) => (
              <span key={i} className="marquee-venue-text">
                {typeof venue === 'string' ? venue : venue.name}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 — reverse */}
        <div className="marquee-row mb-4 md:mb-6">
          <div className="marquee-row-inner marquee-reverse" style={{ animationDuration: '35s' }}>
            {venueRows.map((venue: any, i: number) => (
              <span key={i} className="marquee-venue-text">
                {typeof venue === 'string' ? venue : venue.name}
              </span>
            ))}
          </div>
        </div>

        {/* Row 3 */}
        <div className="marquee-row mb-14 md:mb-20">
          <div className="marquee-row-inner" style={{ animationDuration: '28s' }}>
            {venueRows.map((venue: any, i: number) => (
              <span key={i} className="marquee-venue-text">
                {typeof venue === 'string' ? venue : venue.name}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a href="/shows" className="btn-sharp-white">
            View All Shows
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SHOW CARDS — Horizontal scrolling carousel (CMS-driven)
          ══════════════════════════════════════════════════════════════ */}
      {shows.length > 0 && (
        <section className="relative z-10 bg-white py-24 md:py-32 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6 mb-10 md:mb-14">
            <h2 className="text-[clamp(28px,4vw,48px)] font-black text-[#111] tracking-[-1.5px] uppercase">
              Recent Highlights
            </h2>
          </div>
          <div className="show-cards-scroll">
            {shows.map((card: any) => (
              <a key={card.id || card.title} href={card.href || '#'} className="show-card-item group">
                <div
                  className="show-card-image"
                  style={{ backgroundImage: `url('${assetPath(card.image)}')` }}
                >
                  <div className="show-card-overlay" />
                  <div className="show-card-info">
                    <h4 className="text-[clamp(24px,3vw,36px)] font-black text-white leading-none tracking-[-1px] uppercase mb-1 drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                      {card.title}
                    </h4>
                    <span className="text-[11px] tracking-[3px] uppercase text-white/80 font-semibold">
                      {card.venue}{card.location ? ` — ${card.location}` : ''}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B8FAB] mt-4 mb-1 tracking-[2px] uppercase font-semibold">
                  {card.season}
                </p>
                <h3 className="text-[clamp(16px,2vw,22px)] font-black leading-tight text-[#111] tracking-[-0.5px] uppercase">
                  {card.title}
                </h3>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PHOTO COLLAGE — Asymmetric editorial scatter
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0a0e17] py-24 md:py-36 overflow-hidden">
        {/* Ghost watermark */}
        <div className="collage-watermark" aria-hidden="true">
          LATE NIGHT RICKY
        </div>

        <div className="collage-container">
          {/* 1 — Portrait (large, top-left) */}
          <div className="collage-photo collage-photo-1">
            <img src="/assets/ricky-hero-new.jpg" alt="Late Night Ricky" />
            <div className="collage-quote">
              <p>&ldquo;Music is the only thing that makes sense&rdquo;</p>
            </div>
          </div>

          {/* 2 — DJing (right, medium) */}
          <div className="collage-photo collage-photo-2">
            <img src="/assets/ricky-fricktion.jpg" alt="Ricky DJing" />
          </div>

          {/* 3 — Performance (center, wide) */}
          <div className="collage-photo collage-photo-3">
            <img src="/assets/press-bg2.jpg" alt="Ricky performing" />
          </div>

          {/* 4 — Carousel 1 (far right, tall) */}
          <div className="collage-photo collage-photo-4">
            <img src="/assets/carousel-1.jpg" alt="" />
          </div>

          {/* 5 — Radio (bottom-left, medium) */}
          <div className="collage-photo collage-photo-5">
            <img src="/assets/ricky-radio-new.jpg" alt="Ricky on radio" />
            <div className="collage-quote">
              <p>&ldquo;Every set tells a story&rdquo;</p>
            </div>
          </div>

          {/* 6 — Carousel 2 (right, small) */}
          <div className="collage-photo collage-photo-6">
            <img src="/assets/carousel-2.jpg" alt="" />
          </div>

          {/* 7 — Carousel 3 (bottom-center, wide) */}
          <div className="collage-photo collage-photo-7">
            <img src="/assets/carousel-3.jpg" alt="" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PARTNERSHIPS — CMS-driven, kept from v231
          ══════════════════════════════════════════════════════════════ */}
      <PartnerLogosSection
        defaultLogos={DEFAULT_LOGOS}
        quote={partnersQuote}
        attribution={partnersAttribution}
        description={partnersDescription}
        pressPack={pressPack}
      />

      {/* ══════════════════════════════════════════════════════════════
          CLIENTS / NAMES MARQUEE — Outlined scrolling text (CMS-driven)
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0a0e17] py-24 md:py-32 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-12 md:mb-16">
          <h2 className="text-[clamp(36px,6vw,72px)] font-black tracking-[-2px] uppercase text-white text-center">
            {clientsTitle}
          </h2>
          <p className="text-sm text-[#6B8FAB] mt-4 tracking-[2px] uppercase text-center">
            A few names we&apos;ve shared the stage with
          </p>
        </div>

        {/* Row 1 */}
        <div className="marquee-row mb-4 md:mb-6">
          <div className="marquee-row-inner" style={{ animationDuration: '40s' }}>
            {clientRows.map((c: any, i: number) => (
              <span key={i} className="marquee-client-text">{typeof c === 'string' ? c : c.name}</span>
            ))}
          </div>
        </div>

        {/* Row 2 — reverse */}
        <div className="marquee-row">
          <div className="marquee-row-inner marquee-reverse" style={{ animationDuration: '45s' }}>
            {clientRows.map((c: any, i: number) => (
              <span key={i} className="marquee-client-text">{typeof c === 'string' ? c : c.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          VENUE MARQUEE — Outlined stroke text (CMS-driven)
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden bg-[#0d1f3d] py-6 md:py-8">
        <div className="marquee-venue-track">
          {venueRows.map((venue: any, i: number) => (
            <span key={i} className="marquee-venue-text">{typeof venue === 'string' ? venue : venue.name}</span>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          RADIO — CMS-driven, kept from v231
          ══════════════════════════════════════════════════════════════ */}
      <section id="radio" className="reveal textured-bg relative z-10 pt-32 pb-28 md:py-28">
        <div className="relative z-10 max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative overflow-hidden rounded-2xl">
              <img src={radioImage} alt="Late Night Ricky" className="w-full h-auto object-cover" />
              <div className="absolute bottom-5 right-5 flex items-end gap-[3px] z-10 p-3 rounded-lg bg-[#152a47]/70 backdrop-blur-sm">
                {[12, 20, 16, 24, 14].map((h, i) => (
                  <span key={i} className="eq-bar" style={{ height: `${h}px`, animationDelay: `${[0, 0.2, 0.4, 0.1, 0.3][i]}s` }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#A8D5F0] tracking-[3px] uppercase font-semibold mb-4">{radioLabel}</p>
              <h2 className="heading text-[clamp(40px,6vw,80px)] text-white mb-5 leading-[0.95]">{radioHeadline}</h2>
              <p className="text-sm text-[#A8D5F0] leading-relaxed mb-10 max-w-[420px] font-semibold uppercase tracking-[0.5px]">
                {radioDescription}
              </p>
              <div className="flex gap-4 flex-wrap mb-10">
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-white hover:text-[#111] transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.31a.746.746 0 01-1.03.24c-2.66-1.62-6.008-1.98-9.95-1.083a.746.746 0 11-.413-1.433c4.308-1.244 8.007-.706 10.953 1.075a.746.746 0 01.44 1.201zm1.47-3.27a.934.934 0 01-1.288.308c-3.044-1.86-7.683-2.398-11.282-1.312a.934.934 0 11-.558-1.783c4.125-1.29 9.218-.663 12.637 1.421.443.27.562.856.29 1.366zm.126-3.403c-3.652-2.167-9.674-2.374-13.158-1.31a1.121 1.121 0 11-.662-2.142c3.977-1.239 10.56-.998 14.703 1.463a1.121 1.121 0 11-.883 1.989z" fill="currentColor"/></svg>
                  Spotify
                </a>
                <a href={appleMusicUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 px-7 py-3 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-white hover:text-[#111] transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18.7 5.3c-.4-.4-1.1-.6-2-.5-.9.1-1.8.6-2.6 1.3-.8.7-1.3 1.6-1.3 2.4 0 .2 0 .4.1.6-.5-.1-1-.2-1.6-.2-1.6 0-3.2.6-4.4 1.7-1.2 1.1-1.9 2.6-2 4.2-.1 1.6.4 3.2 1.5 4.4 1.1 1.2 2.6 1.9 4.2 2 1.6.1 3.2-.4 4.4-1.5 1.2-1.1 1.9-2.6 2-4.2v-9.2c0-.3-.1-.5-.3-.8zm-6.5 11.5c-.4.4-.9.6-1.5.6-.6 0-1.1-.2-1.5-.6-.4-.4-.6-.9-.6-1.5 0-.6.2-1.1.6-1.5.4-.4.9-.6 1.5-.6.6 0 1.1.2 1.5.6.4.4.6.9.6 1.5 0 .6-.2 1.1-.6 1.5z" fill="currentColor"/></svg>
                  Apple
                </a>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-white hover:text-[#111] transition">
                  <svg width="20" height="16" viewBox="0 0 24 24" fill="none"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/></svg>
                  YouTube
                </a>
              </div>
              <div className="border-t border-white/20 pt-6">
                <AudioTrackList tracks={tracks} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SHARE MUSIC CTA — Editorial serif over moody photo (CMS-driven)
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-36 md:py-48 overflow-hidden" style={{ backgroundColor: '#0a0e17' }}>
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "url('/assets/press-bg2.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/60 via-transparent to-[#0a0e17]/60" />
        <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
          <h2 className="font-serif italic text-[clamp(36px,5vw,64px)] font-normal text-white leading-tight mb-6">
            {shareMusicHeadline}
          </h2>
          <p className="text-[clamp(18px,2.5vw,28px)] text-[#A3B5C4] mb-12 max-w-[600px] mx-auto leading-relaxed">
            {shareMusicDescription}
          </p>
          <a href="/share-music" className="btn-sharp-white">
            Submit Your Track
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONTACT CTA — Editorial serif heading, sharp button (CMS-driven)
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0a0e17] text-white py-28 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h2 className="font-serif italic text-[clamp(42px,6vw,72px)] font-normal leading-tight mb-10 max-w-[500px]">
              Let&apos;s create something unforgettable
            </h2>
            <a href="/contact" className="btn-sharp-outline">
              {reachOutCta}
            </a>
          </div>
          <div className="relative overflow-hidden">
            <img
              src={reachOutImage}
              alt="Late Night Ricky"
              className="w-full h-auto object-cover grayscale"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONTACT FORM — CMS-driven, kept from v231
          ══════════════════════════════════════════════════════════════ */}
      <HomeContactSection />

      <Footer />
    </>
  );
}