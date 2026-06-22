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
  let heroOverlay = true;
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
  let reachOutHeadline = "Let's collaborate";
  let reachOutSignature = 'Late Night Ricky';
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
        if (c.overlay !== undefined) heroOverlay = c.overlay;
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
        if (c.headline) reachOutHeadline = c.headline;
        if (c.signature) reachOutSignature = c.signature;
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
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#0A1628' }}>
          <div
            className="absolute inset-0 bg-cover bg-no-repeat warm-photo"
            style={{
              backgroundImage: `url('${heroImage}')`,
              backgroundSize: heroBackgroundSize,
              backgroundPosition: heroBackgroundPosition,
            }}
          />
          {heroOverlay && <div className="absolute inset-0 gradient-hero" />}
        </div>
        <img src={heroLogo} alt="Late Night Ricky" className="relative z-10 w-[52%] max-w-[700px] min-w-[280px] mx-auto mb-14 drop-shadow-[0_6px_30px_rgba(0,0,0,0.3)] brightness-0 invert" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#F0EDE6] opacity-70">
          <span className="text-[11px] tracking-[2.5px] uppercase font-medium">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* Video / Showreel */}
      <section id="video" className="relative w-full min-h-screen overflow-hidden flex items-center justify-center z-[1]"
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D1A2A 50%, #0A1628 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,22,40,0.3)] via-transparent to-[rgba(10,22,40,0.3)] z-[2] pointer-events-none" />
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
      <section id="reach" className="relative z-10 py-28"
        style={{ background: 'linear-gradient(180deg, #0D4A4A 0%, #2E5C8A 50%, #0A1628 100%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="reveal font-semibold text-[clamp(32px,5vw,56px)] leading-[1.05] max-w-[960px] text-[#F0EDE6] tracking-[-1px]">
            {reachHeadline}
          </h1>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mt-6">
            <p className="reveal reveal-d1 text-sm leading-relaxed max-w-[560px] text-[#A3B5C4] font-medium normal-case tracking-normal">
              {reachSubtext}
            </p>
            <div className="grammy-float grammy-glow relative w-[120px] md:w-[160px] flex-shrink-0 glow-mint">
              <img
                src={grammyBadge}
                alt="Grammy Award"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2E5C8A] to-transparent my-20" />
        </div>
      </section>

      {/* Shows */}
      <section id="shows" className="relative z-10 pt-36 md:pt-28 pb-10"
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #1A3A5C 50%, #0A1628 100%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="reveal text-[clamp(32px,4.5vw,52px)] font-semibold text-center mb-5 text-[#F0EDE6] tracking-[-1px] leading-[1.05]">
            Recent Shows &amp; Stories
          </h2>
          <p className="reveal reveal-d1 text-center text-sm text-[#6B8E9B] mb-16 max-w-[600px] mx-auto leading-relaxed font-medium normal-case tracking-normal">
            A career built on unforgettable nights, iconic venues, and sold-out crowds.
          </p>
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {shows.map((show, i) => (
              <a key={show.title} href={show.href} className={`reveal reveal-d${Math.min(i + 1, 3)} group block transition-all duration-500 hover:-translate-y-1.5`}>
                <div
                  className="relative w-full min-h-[520px] rounded-2xl overflow-hidden mb-6 flex items-end justify-start glass-card"
                  style={{ backgroundImage: `url('${show.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-[#0A1628]/20 to-transparent pointer-events-none" />
                  <div className="relative z-10 p-10">
                    <h4 className="text-[clamp(24px,3.5vw,36px)] font-semibold text-[#F0EDE6] leading-none tracking-[-0.5px] mb-1.5 drop-shadow-[0_2px_14px_rgba(0,0,0,0.25)]">
                      {show.venue}
                    </h4>
                    <span className="text-xs tracking-[3px] uppercase text-[#64C8A8] font-medium">{show.location}</span>
                  </div>
                  <div className="absolute bottom-4 right-4 md:bottom-[30px] md:right-[30px] z-[3] w-11 h-11 md:w-14 md:h-14 rounded-full border border-[#2E5C8A]/50 flex items-center justify-center text-[#F0EDE6] bg-[#2E5C8A]/20 backdrop-blur-sm transition-all group-hover:bg-[#64C8A8]/30 group-hover:border-[#64C8A8]/50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </div>
                </div>
                <p className="text-[13px] text-[#6B8E9B] mb-3 tracking-[2px] uppercase font-medium">{show.season}</p>
                <h3 className="text-[clamp(18px,2vw,24px)] font-semibold leading-tight mb-2.5 text-[#F0EDE6] tracking-[-0.5px]">{show.title}</h3>
                <p className="text-sm text-[#6B8E9B] leading-relaxed mb-4 font-medium normal-case tracking-normal">{show.description}</p>
              </a>
            ))}
          </div>
          <div className="text-center mb-12">
            <a href="#shows" className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-[#2E5C8A]/50 rounded-full text-[#F0EDE6] text-[13px] font-medium uppercase tracking-[1.5px] hover:bg-[#2E5C8A]/20 hover:border-[#64C8A8]/50 transition mb-10">
              All Shows &amp; Stories
            </a>
          </div>
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
      <section id="radio" className="reveal relative z-10 pt-32 pb-28 md:py-28"
        style={{ background: 'linear-gradient(180deg, #2E5C8A 0%, #1A6B5E 50%, #0A1628 100%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative overflow-hidden rounded-2xl">
              <img src={radioImage} alt="Late Night Ricky" className="w-full h-auto object-cover warm-photo" />
              <div className="absolute bottom-5 right-5 flex items-end gap-[3px] z-10 p-3 rounded-lg bg-[#0A1628]/60 backdrop-blur-sm">
                {[12, 20, 16, 24, 14].map((h, i) => (
                  <span key={i} className="eq-bar" style={{ height: `${h}px`, animationDelay: `${[0, 0.2, 0.4, 0.1, 0.3][i]}s`, background: '#64C8A8' }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#64C8A8] tracking-[3px] uppercase font-medium mb-4">{radioLabel}</p>
              <h2 className="text-[clamp(32px,5vw,64px)] font-semibold text-[#F0EDE6] mb-5 leading-[1.05] tracking-[-1px]">{radioHeadline}</h2>
              <p className="text-sm text-[#A3B5C4] leading-relaxed mb-10 max-w-[420px] font-medium normal-case tracking-normal">
                {radioDescription}
              </p>
              <div className="flex gap-4 flex-wrap mb-10">
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 border border-[#F0EDE6]/30 rounded-full text-[#F0EDE6] text-[13px] font-medium uppercase tracking-[1.5px] hover:bg-[#2E5C8A]/30 hover:border-[#64C8A8]/50 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.31a.746.746 0 01-1.03.24c-2.66-1.62-6.008-1.98-9.95-1.083a.746.746 0 11-.413-1.433c4.308-1.244 8.007-.706 10.953 1.075a.746.746 0 01.44 1.201zm1.47-3.27a.934.934 0 01-1.288.308c-3.044-1.86-7.683-2.398-11.282-1.312a.934.934 0 11-.558-1.783c4.125-1.29 9.218-.663 12.637 1.421.443.27.562.856.29 1.366zm.126-3.403c-3.652-2.167-9.674-2.374-13.158-1.31a1.121 1.121 0 11-.662-2.142c3.977-1.239 10.56-.998 14.703 1.463a1.121 1.121 0 11-.883 1.989z" fill="currentColor"/></svg>
                  Spotify
                </a>
                <a href={appleMusicUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 px-7 py-3 border border-[#F0EDE6]/30 rounded-full text-[#F0EDE6] text-[13px] font-medium uppercase tracking-[1.5px] hover:bg-[#2E5C8A]/30 hover:border-[#64C8A8]/50 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18.7 5.3c-.4-.4-1.1-.6-2-.5-.9.1-1.8.6-2.6 1.3-.8.7-1.3 1.6-1.3 2.4 0 .2 0 .4.1.6-.5-.1-1-.2-1.6-.2-1.6 0-3.2.6-4.4 1.7-1.2 1.1-1.9 2.6-2 4.2-.1 1.6.4 3.2 1.5 4.4 1.1 1.2 2.6 1.9 4.2 2 1.6.1 3.2-.4 4.4-1.5 1.2-1.1 1.9-2.6 2-4.2v-9.2c0-.3-.1-.5-.3-.8zm-6.5 11.5c-.4.4-.9.6-1.5.6-.6 0-1.1-.2-1.5-.6-.4-.4-.6-.9-.6-1.5 0-.6.2-1.1.6-1.5.4-.4.9-.6 1.5-.6.6 0 1.1.2 1.5.6.4.4.6.9.6 1.5 0 .6-.2 1.1-.6 1.5z" fill="currentColor"/></svg>
                  Apple
                </a>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3 border border-[#F0EDE6]/30 rounded-full text-[#F0EDE6] text-[13px] font-medium uppercase tracking-[1.5px] hover:bg-[#2E5C8A]/30 hover:border-[#64C8A8]/50 transition">
                  <svg width="20" height="16" viewBox="0 0 24 24" fill="none"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/></svg>
                  YouTube
                </a>
              </div>
              <div className="border-t border-[#2E5C8A]/30 pt-6">
                <AudioTrackList tracks={tracks} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carousel */}
      <section className="relative z-10 py-16 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D2A3A 50%, #0A1628 100%)' }}
      >
        <div className="carousel-track">
          {carouselImagesList.length > 0 ? (
            carouselImagesList.map((img, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] h-[360px] rounded-xl overflow-hidden glass-card">
                <img src={img.imagePath || ''} alt={img.alt} className="w-full h-full object-cover hover:scale-105 transition duration-500 warm-photo" />
              </div>
            ))
          ) : (
            ['carousel-1.jpg','carousel-2.jpg','carousel-3.jpg','ricky-hero-new.jpg','ricky-radio-new.jpg','press-bg2.jpg','ricky-fricktion.jpg'].map((src, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] h-[360px] rounded-xl overflow-hidden glass-card">
                <img src={`/assets/${src}`} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500 warm-photo" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Clients */}
      <section id="supporting" className="reveal relative z-10 pt-24 md:pt-10 pb-28"
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D2A3A 50%, #0A1628 100%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-sm text-[#6B8E9B] mb-10 tracking-[2px] uppercase text-center">Acts &amp; Private Clients</p>
          <h2 className="text-[clamp(32px,5vw,56px)] font-semibold tracking-[-1px] mb-10 text-[#F0EDE6] text-center">{clientsTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {clients.map((name) => (
              <div key={name} className="text-[clamp(16px,2vw,24px)] font-medium tracking-[-0.5px] leading-tight text-[#F0EDE6] text-center py-3 px-2 hover:text-[#64C8A8] transition cursor-default">{name}</div>
            ))}
          </div>
          <p className="text-sm text-[#6B8E9B] mt-10 tracking-[2px] uppercase text-center">And many more...</p>
        </div>
      </section>

      {/* Venue Marquee */}
      <section className="relative z-10"
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D1A2A 100%)' }}
      >
        <div className="overflow-hidden py-4">
          <div className="marquee-track">
            {[...venues, ...venues].map((venue, i) => (
              <span key={i} className="text-[#6B8E9B] text-[13px] font-medium tracking-[1.5px] uppercase flex-shrink-0">
                {venue}<span className="ml-10 text-[#2E5C8A]">&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Share Music */}
      <ShareMusicSection headline={shareMusicHeadline} description={shareMusicDescription} />

      {/* Reach Out */}
      <section id="reach-out" className="reveal relative z-10 text-[#F0EDE6] py-28"
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #1A3A5C 50%, #0D4A4A 100%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-[clamp(36px,5vw,56px)] font-normal leading-tight mb-6 max-w-[500px]">{reachOutHeadline}</h2>
            <p className="font-['Rockybilly',cursive] text-[clamp(24px,3.5vw,40px)] font-normal text-[#64C8A8] mb-8 rotate-[-1deg] opacity-85 whitespace-nowrap">{reachOutSignature}</p>
            <a href="#contact-form" className="inline-block px-9 py-3.5 border border-[#F0EDE6]/30 rounded-full text-[#F0EDE6] text-[13px] font-medium uppercase tracking-[2px] hover:bg-[#2E5C8A]/30 hover:border-[#64C8A8]/50 transition">
              {reachOutCta}
            </a>
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <img src={reachOutImage} alt="Late Night Ricky" className="w-full h-auto object-cover warm-photo" />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <HomeContactSection />

      <Footer />
    </>
  );
}
