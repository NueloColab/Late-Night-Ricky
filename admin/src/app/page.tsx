import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import AudioTrackList from '../components/AudioTrackList';
import PartnerLogosSection from '../components/PartnerLogosSection';
import HomeContactSection from '../components/HomeContactSection';
import ShareMusicSection from '../components/ShareMusicSection';
import { getShowCards, getClientNames, getVenueTicker, getTracks, getSiteSections, getCarouselImages, getSeoMeta } from '@/lib/cms';
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
  let videoPoster = '/assets/video-poster-desktop.jpg';
  let videoSrc = '/assets/video-desktop.mp4';
  let reachHeadline = 'International DJ \u0026 Grammy Winning Producer. From London to New York / LA to Las Vegas / Miami to Ibiza and beyond.';
  let reachSubtext = '150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.';
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
  let grammyBadge = '/assets/grammy-gold-v2.png?v=2';
  let reachOutImage = '/assets/ricky-hero-new.jpg';
  let reachOutCta = 'Get in touch';
  let carouselImagesList: { imagePath: string | null; alt: string }[] = [];

  try {
    const [dbCards, dbNames, dbVenues, dbTracks, dbSections, dbCarousel, dbShowreelSections] = await Promise.all([
      getShowCards(),
      getClientNames(),
      getVenueTicker(),
      getTracks(),
      getSiteSections('home'),
      getCarouselImages(),
      getSiteSections('showreel'),
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
      const videoSection = dbSections.find((s: any) => s.section === 'video');
      if (videoSection?.content) {
        const c = typeof videoSection.content === 'string' ? JSON.parse(videoSection.content) : videoSection.content;
        if (c.poster) videoPoster = c.poster;
        if (c.src) videoSrc = c.src;
      }
    }

    // Use showreel main video for homepage hero
    if (dbShowreelSections && dbShowreelSections.length > 0) {
      const showreelVideoSection = dbShowreelSections.find((s: any) => s.section === 'video');
      const legacyVideos = showreelVideoSection?.videos as any;
      if (Array.isArray(legacyVideos) && legacyVideos[0]) {
        videoSrc = legacyVideos[0];
        videoPoster = ''; // Clear old poster so new video frame shows
      }
    }

    if (dbSections.length > 0) {
      const reachSection = dbSections.find((s: any) => s.section === 'reach');
      if (reachSection?.content) {
        const c = typeof reachSection.content === 'string' ? JSON.parse(reachSection.content) : reachSection.content;
        if (c.headline) reachHeadline = c.headline;
        if (c.subtext) reachSubtext = c.subtext;
        if (c.grammyBadge) grammyBadge = c.grammyBadge;
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

    if (dbCarousel.length > 0) {
      carouselImagesList = dbCarousel.map((c: any) => ({ imagePath: c.imagePath, alt: c.alt || '' }));
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

  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* Hero */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-8 md:px-14 pb-14 pt-20">
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#152a47' }}>
          <div
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url('${heroImage}')`,
              backgroundSize: heroBackgroundSize,
              backgroundPosition: heroBackgroundPosition,
              filter: heroGrayscale ? 'grayscale(100%) brightness(1.05)' : 'none',
              mixBlendMode: 'multiply',
            }}
          />
        </div>
        <img src={heroLogo} alt="Late Night Ricky" className="relative z-10 w-[52%] max-w-[700px] min-w-[280px] mx-auto mb-14 drop-shadow-[0_6px_30px_rgba(0,0,0,0.3)]" style={{ mixBlendMode: 'screen' }} />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white opacity-70">
          <span className="text-[11px] tracking-[2.5px] uppercase font-medium">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* Video / Showreel */}
      <section id="video" className="relative w-full min-h-screen overflow-hidden bg-[#0d1f3d] flex items-center justify-center z-[1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(17,17,17,0.3)] via-transparent to-[rgba(17,17,17,0.3)] z-[2] pointer-events-none" />
        <div className="relative z-[3] text-center flex flex-col items-center gap-8">
          <a href="/showreel" className="inline-block px-12 py-4 border-2 border-white rounded-full bg-transparent text-white text-sm font-semibold uppercase tracking-[2.5px] hover:bg-white hover:text-[#111] transition">
            WATCH SHOWREEL
          </a>
        </div>
        <video
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
          src={videoSrc}
          poster={videoPoster}
          playsInline
          autoPlay
          muted
          loop
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
        >
        </video>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const v = document.querySelector('#video video');
              if (!v) return;
              const keepPlaying = function() {
                if (v.paused) { v.play().catch(function(){}); }
              };
              v.addEventListener('pause', keepPlaying);
              v.addEventListener('ended', function() {
                v.currentTime = 0;
                v.play().catch(function(){});
              });
              document.addEventListener('visibilitychange', function() {
                if (!document.hidden) keepPlaying();
              });
              keepPlaying();
            })();
          `
        }} />
      </section>

      {/* Reach */}
      <section id="reach" className="textured-bg relative z-10 py-28">
        <div className="relative z-10 max-w-[1200px] mx-auto px-6">
          <h1 className="reveal heading text-[clamp(36px,5.5vw,64px)] leading-[0.95] max-w-[960px] text-white">
            {reachHeadline}
          </h1>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mt-6">
            <p className="reveal reveal-d1 text-sm leading-relaxed max-w-[560px] text-[#A8D5F0] font-semibold uppercase tracking-[0.5px]">
              {reachSubtext}
            </p>
            <div className="grammy-float grammy-glow relative w-[120px] md:w-[160px] flex-shrink-0">
              <img
                src={grammyBadge}
                alt="Grammy Award"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#A8D5F0] to-transparent my-20" />
        </div>
      </section>

      {/* Shows — 3 column vertical panels (N.E.R.D. style) */}
      <section id="shows" className="relative z-10">
        {/* Section header */}
        <div className="textured-bg relative z-10 py-20 md:py-24">
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
            <h2 className="reveal heading text-[clamp(36px,5.5vw,64px)] mb-5 text-white leading-[0.95]">
              RECENT SHOWS &amp; STORIES
            </h2>
            <p className="reveal reveal-d1 text-sm text-[#A8D5F0] max-w-[600px] mx-auto leading-relaxed font-semibold uppercase tracking-[0.5px]">
              A career built on unforgettable nights, iconic venues, and sold-out crowds.
            </p>
          </div>
        </div>

        {/* 3 vertical columns — N.E.R.D. style */}
        <div className="grid md:grid-cols-3 h-[85vh] md:h-[90vh]">
          {shows.slice(0, 3).map((show) => (
            <a
              key={show.title}
              href={show.href}
              className="group relative overflow-hidden flex items-center justify-center"
              style={{
                backgroundImage: `url('${show.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-[#0d1f3d]/60 group-hover:bg-[#0d1f3d]/45 transition-colors duration-500" />

              {/* Content vertically centered */}
              <div className="relative z-10 text-center px-6">
                <h3 className="heading text-[clamp(32px,5vw,64px)] text-white leading-none mb-3 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                  {show.venue}
                </h3>
                <p className="text-[11px] tracking-[3px] uppercase text-white/70 font-semibold mb-8">
                  {show.location}
                </p>

                {/* Rectangular button */}
                <div className="inline-flex items-center justify-center px-12 py-3 border border-white text-white text-[11px] font-semibold uppercase tracking-[0.2em] group-hover:bg-white group-hover:text-[#111] group-hover:border-white transition-all duration-300">
                  View
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* All Shows link */}
        <div className="textured-bg relative z-10 py-16 text-center">
          <a
            href="#shows"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 border-2 border-white rounded-full text-white text-[13px] font-semibold uppercase tracking-[1.5px] hover:bg-white hover:text-[#111] transition"
          >
            All Shows &amp; Stories
          </a>
        </div>
      </section>

      {/* Partnerships */}
      <PartnerLogosSection
        defaultLogos={DEFAULT_LOGOS}
        quote={partnersQuote}
        attribution={partnersAttribution}
        description={partnersDescription}
        pressPack={pressPack}
      />

      {/* Radio */}
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

      {/* Carousel */}
      <section className="textured-bg relative z-10 py-16 overflow-hidden">
        <div className="carousel-track">
          {carouselImagesList.length > 0 ? (
            carouselImagesList.map((img, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] h-[360px] rounded-xl overflow-hidden">
                <img src={img.imagePath || ''} alt={img.alt} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
              </div>
            ))
          ) : (
            ['carousel-1.jpg','carousel-2.jpg','carousel-3.jpg','ricky-hero-new.jpg','ricky-radio-new.jpg','press-bg2.jpg','ricky-fricktion.jpg'].map((src, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] h-[360px] rounded-xl overflow-hidden">
                <img src={`/assets/${src}`} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Clients — Marquee */}
      <section id="supporting" className="reveal textured-bg relative z-10 pt-24 md:pt-10 pb-28 overflow-hidden">
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 mb-12">
          <p className="text-sm text-[#A8D5F0] mb-6 tracking-[2px] uppercase text-center">Acts &amp; Private Clients</p>
          <h2 className="heading text-[clamp(36px,6vw,72px)] mb-4 text-white text-center">{clientsTitle}</h2>
        </div>
        <div className="overflow-hidden">
          <div className="clients-marquee-track">
            {[...clients, ...clients].map((name, i) => (
              <span key={i} className="font-serif text-[clamp(32px,5vw,56px)] font-light tracking-[-0.02em] text-white/80 hover:text-white transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-[#A8D5F0] mt-10 tracking-[2px] uppercase text-center">And many more...</p>
      </section>

      {/* Venue Marquee */}
      <section className="relative z-10">
        <div className="overflow-hidden bg-[#0d1f3d] py-4">
          <div className="marquee-track">
            {[...venues, ...venues].map((venue, i) => (
              <span key={i} className="text-[#A8D5F0] text-[13px] font-semibold tracking-[1.5px] uppercase flex-shrink-0">
                {venue}<span className="ml-10 text-[#152a47]">&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Share Music */}
      <ShareMusicSection headline={shareMusicHeadline} description={shareMusicDescription} />

      {/* Reach Out — unified section, image blended into page */}
      <section
        id="reach-out"
        className="reveal relative z-10 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d1f3d 0%, #152a47 35%, #152a47 65%, #152a47 100%)' }}
      >
        {/* Left image — natural portrait, not stretched */}
        <div className="absolute inset-y-0 left-0 w-[50%] hidden md:block overflow-hidden">
          <img
            src={reachOutImage}
            alt="Late Night Ricky"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background: 'linear-gradient(90deg, rgba(13,31,61,0.05) 0%, rgba(13,31,61,0.6) 40%, rgba(13,31,61,0.95) 55%, #0d1f3d 60%, #152a47 100%)',
          }}
        />

        {/* Mobile: subtle background image */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `url(${reachOutImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.15,
          }}
        />
        <div className="absolute inset-0 md:hidden bg-[#0d1f3d]/80" />

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24 py-20 md:py-28">
          <div className="max-w-xl md:ml-auto">
            <div className="mb-10">
              <h2 className="heading text-[clamp(48px,8vw,96px)] leading-[0.9] text-white">
                LET&apos;S
              </h2>
              <h2 className="heading text-[clamp(48px,8vw,96px)] leading-[0.9] text-white">
                COLLABORATE
              </h2>
              <p className="font-['Rockybilly',cursive] text-[clamp(24px,4vw,40px)] font-normal text-[#d4c8b8] mt-4 rotate-[-2deg] opacity-90">
                Late Night Ricky
              </p>
            </div>
            <a
              href="#contact-form"
              className="inline-flex items-center justify-center px-12 py-3 border border-white text-white text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-white hover:text-[#111] transition-all duration-300"
            >
              {reachOutCta}
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <HomeContactSection />

      <Footer />
    </>
  );
}
