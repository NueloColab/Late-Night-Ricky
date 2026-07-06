import Navbar from '../components/Navbar';
import ScrollReveal from '../components/ScrollReveal';
import AudioTrackList from '../components/AudioTrackList';
import ShareMusicCTA from '../components/ShareMusicCTA';
import HomeContactSection from '../components/HomeContactSection';
import LateNightMoments from '../components/LateNightMoments';
// import Loader from '../components/Loader'; // disabled temporarily
import { getShowCards, getClientNames, getTracks, getSiteSections, getSeoMeta } from '@/lib/cms';
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
    href: '/show-misfits-boxing',
    image: '/assets/highlight-studio.jpg',
    venue: 'Misfits Boxing',
    location: 'London',
    season: '2025',
    title: 'MISFITS BOXING',
    description: 'In the studio, crafting the sound.',
  },
  {
    href: '/show-ibiza',
    image: '/assets/highlight-arena.jpg',
    venue: 'Ibiza Rocks',
    location: 'Ibiza',
    season: '2024',
    title: 'IBIZA ROCKS',
    description: 'Sunset sets and poolside energy in the White Isle.',
  },
  {
    href: '/show-club',
    image: '/assets/highlight-club.jpg',
    venue: 'Private Events',
    location: 'London',
    season: '2024',
    title: 'BACK TO BACK',
    description: 'Intimate sets and electric crowds.',
  },
  {
    href: '/show-arena',
    image: '/assets/highlight-misfits.jpg',
    venue: 'O2 Arena',
    location: 'London',
    season: '2025',
    title: 'O2 ARENA',
    description: 'Major arena appearance, packed to capacity.',
  },
];


const DEFAULT_CLIENTS = [
  '50 Cent', 'Bruno Mars', 'Chris Brown', 'Dr. Dre & Jimmy Iovine', 'Drake',
  'Future', 'Jason Momoa', 'Jason Statham', 'Justin Bieber', 'Kendrick Lamar',
  'Leonardo DiCaprio', 'Lewis Hamilton', 'Mick Jagger', 'Neymar Jnr', 'Paul McCartney',
  'Rihanna', 'Ronaldo', 'Travis Scott', 'Usain Bolt', 'Vin Diesel',
];

const DEFAULT_TRACKS = [
  { title: 'Late Night Ricky — Midnight in London', time: '0:30' },
  { title: 'Late Night Ricky — Vegas Lights', time: '0:30' },
  { title: 'Late Night Ricky — Ibiza Sunrise', time: '0:30' },
  { title: 'Late Night Ricky — South Side', time: '0:30' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assetPath(p?: string | null) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/')) return p;
  return '/' + p;
}

export default async function HomePage() {
  let shows: any[] = DEFAULT_SHOWS; // used by CMS fallback, kept for future dynamic rendering
  let clients: string[] = DEFAULT_CLIENTS;
  let tracks = DEFAULT_TRACKS;
  let heroImage = '/assets/ricky-hero-real.jpg';
  let heroLogo = '/assets/ricky-logo.png';
  let heroGrayscale = true;
  let heroBackgroundSize = 'cover';
  let heroBackgroundPosition = '70% center';
  const radioImage = '/assets/ricky-music-jacket-sm.jpg';
  let radioHeadline = 'Music & Mixes';
  let radioLabel = 'Listen & Download';
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
  let aboutHeadline = 'International DJ & Grammy Winning Producer';
  let aboutBio1 = 'Late Night Ricky (Previously DJ Fricktion) is an Award-Winning DJ, Grammy Award Winner and Platinum Certified Music Producer based in London. From teaching music in prison programs to performing at some of the world\'s most exclusive celebrity events, Ricky\'s rich and diverse music career has led him to become one of the most popular and trusted faces in London\'s thriving music scene.';
  let aboutBio2 = 'As a producer, Ricky cites his key influences as Michael Jackson, Dr. Dre, Quincy Jones, and Timbaland, merging soulful R&B, House and cinematic grooves. Having earned Grammy recognition for his work with Chris Brown on the 11:11 album, plus previous cuts with Kendrick Lamar and NAV, Ricky has now stepped into a creative chapter with a new wave of releases scheduled for release.';
  let aboutBio3 = 'Ricky has embraced his British and South Asian Roots working with some legendary South Asian talent such as DIVINE and rising British R&B star H33RA as well as showcasing Punjabi artists such as Diljit Dosanjh, Karan Aujla and Sidhu Moosewala to mainstream audiences.';
  let aboutBio4 = 'With many unreleased tracks in the works, plans to further expand his brand and collaborations with other artists, there is a lot more to come this year.';
  let aboutImage = '/assets/about-ricky-jacket.jpg';

  const productionCredits = [
    'Chris Brown', 'Kendrick Lamar', 'NAV', 'Divine',
    'Potter Payper', 'Swae Lee', 'N.O.R.E', 'Styles P',
    'Raekwon', 'RZA', 'Jim Jones', 'D Smoke',
    'Apache Indian', 'MC Altaf', 'H33RA', 'Stefflon Don',
    'Lil Keed', 'Ivorian Doll', 'Safe', 'Plus Many More'
  ];

  // Suppress unused-variable warnings for CMS values not yet used in new layout
  void heroGrayscale; void heroBackgroundSize; void heroBackgroundPosition; void reachOutImage; void reachOutCta; void pressPack; void clientsTitle; void clients; void partnersQuote; void partnersAttribution; void partnersDescription;
  try {
    const [dbCards, dbNames, dbTracks, dbSections, dbAboutSections] = await Promise.all([
      getShowCards(), getClientNames(), getTracks(), getSiteSections('home'), getSiteSections('about'),
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
        // if (c.image) radioImage = c.image;  // OVERRIDE: use new jacket photo
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
      // About page sections
      if (dbAboutSections.length > 0) {
        const introSection = dbAboutSections.find((s: any) => s.section === 'intro');
        if (introSection?.content) {
          const c = typeof introSection.content === 'string' ? JSON.parse(introSection.content) : introSection.content;
          if (c.headline) aboutHeadline = c.headline;
          if (c.bio1) aboutBio1 = c.bio1;
          if (c.bio2) aboutBio2 = c.bio2;
          if (c.bio3) aboutBio3 = c.bio3;
          if (c.bio4) aboutBio4 = c.bio4;
          if (c.image) aboutImage = c.image;
        }
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
      tracks = dbTracks.map((t: any) => ({ title: t.title, time: t.duration || '0:30', src: t.filePath })).slice(0, 4);
    }
    if (dbCards.length > 0) {
      shows = dbCards.map((c: any) => ({ href: c.href || '#', image: c.imagePath || '/assets/ricky-hero-new.jpg', venue: c.venue, location: c.location, season: c.season, title: c.title, description: c.description }));
    }
    if (dbNames.length > 0) { clients = dbNames.map((n: any) => n.name); }
  } catch { /* DB unreachable — use hardcoded defaults */ }


  return (
    <>
      <div className="lnr-page-wrapper">
      {/* ═══ LOADING ANIMATION ═══ */}
      {/* Loader disabled temporarily */}

      <Navbar />
      <ScrollReveal />

      {/* ═══ HERO — raw photo, no colour overlay ═══ */}
      <section className="relative min-h-[100dvh] px-8 md:px-14 pb-14 pt-20">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url('${heroImage}')`,
            backgroundSize: heroBackgroundSize,
            backgroundPosition: heroBackgroundPosition,
          }}
        />
        {/* Logo + subtitle — desktop: left side, ~40% width, at waist level; mobile: centered above head */}
        <div className="absolute z-10 flex flex-col items-center md:items-start justify-center md:justify-start top-[22%] md:top-auto md:mt-[30vh] w-full md:w-auto md:max-w-[45%] md:left-[15%] px-4 md:px-0">
          <img src={heroLogo} alt="Late Night Ricky" className="w-[65%] md:w-full max-w-[500px] min-w-[220px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
          <p className="mt-3 text-[10px] md:text-[clamp(11px,1.2vw,14px)] font-bold tracking-[0.15em] md:tracking-[0.2em] uppercase text-[#c9a96e] drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
             style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Grammy Winning Producer | International DJ
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white opacity-70">
          <span className="text-[11px] tracking-[2.5px] uppercase font-medium">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* ═══ ABOUT RICKY — dark leather texture, image blends into page ═══ */}
      <section id="about" className="relative min-h-[100dvh] py-20 px-6 md:px-14 overflow-hidden">
        {/* Dark leather base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7a5c3a] via-[#5c4328] to-[#4a3520]" />
        {/* Leather grain noise texture */}
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />
        {/* Warm amber light beam from top-left */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#b89a6e]/40 via-transparent to-transparent" />
        {/* Diagonal light streaks */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(184,154,110,0.15)_50%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(200,170,130,0.12)_45%,transparent_55%)]" />
        {/* Warm glow from top-right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,170,130,0.25)_0%,transparent_60%)]" />
        {/* Soft bottom vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(40,25,10,0.3)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-[1400px] mx-auto">
          {/* Ronaldo Quote — centered, bold statement style */}
          <div className="mb-12 md:mb-16 reveal-left text-center">
            <p className="text-[clamp(32px,5vw,56px)] font-black uppercase tracking-[-1px] leading-[1.1] text-[#e8d4b8] max-w-[1000px] mx-auto" style={{ fontFamily: "'Oswald', sans-serif" }}>
              &ldquo;The best DJ I&apos;ve heard.&rdquo;
            </p>
            <p className="mt-4 text-[12px] md:text-[14px] font-semibold tracking-[0.3em] uppercase text-[#c4b498]/80">
              — Ronaldo
            </p>
          </div>

          {/* 2-column layout */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-stretch">
            {/* Left — Text */}
            <div className="reveal-left" data-delay="100">
              <div className="flex items-center gap-0 mb-8">
                <div className="reveal-left" data-delay="100">
                  <img
                    src="/assets/about-text-cream.png"
                    alt="About"
                    className="h-[clamp(36px,5.5vw,64px)] w-auto object-contain"
                  />
                </div>
                <div className="reveal-right" data-delay="300">
                  <img
                    src="/assets/ricky-text-cream.png"
                    alt="Ricky"
                    className="h-[clamp(48px,7vw,84px)] w-auto object-contain -ml-1 md:-ml-2"
                  />
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-[13px] md:text-[14px] leading-[1.7] tracking-[0.02em] text-[#d4c4a8]/95">
                  {aboutBio1}
                </p>
                <p className="text-[13px] md:text-[14px] leading-[1.7] tracking-[0.02em] text-[#d4c4a8]/95">
                  {aboutBio2}
                </p>
                <p className="text-[13px] md:text-[14px] leading-[1.7] tracking-[0.02em] text-[#d4c4a8]/95">
                  {aboutBio3}
                </p>
                <p className="text-[13px] md:text-[14px] leading-[1.7] tracking-[0.02em] text-[#d4c4a8]/95">
                  {aboutBio4}
                </p>
              </div>
              {/* Press Pack button */}
              <div className="mt-8 flex justify-center md:justify-start">
                <a
                  href="/assets/press-pack.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white text-[13px] font-semibold tracking-[0.08em] uppercase hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                >
                  Press Pack
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right — Photo blends into page */}
            <div className="reveal-right h-full" data-delay="200">
              <div
                className="h-full w-full relative"
                style={{
                  background: 'linear-gradient(to bottom, #7a5c3a, #4a3520)',
                }}
              >
                <img
                  src={aboutImage}
                  alt="Late Night Ricky"
                  className="w-full h-full object-cover object-top"
                  style={{
                    mixBlendMode: 'multiply',
                    filter: 'contrast(1.1) brightness(1.15)',
                  }}
                />
                {/* Lighten overlay */}
                <div className="absolute inset-0 bg-[#7a5c3a]/20 pointer-events-none" />
              </div>
            </div>
          </div>

        </div>
      </section>

      <LateNightMoments />

      {/* ═══ ACTS ARTISTS & VENUES — brown background, carousel, locations PRIVATE CLIENTS ═══ */}
      <section id="artists" className="relative py-20 md:py-28 px-6 md:px-14 overflow-hidden">
        {/* Dark leather background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7a5c3a] via-[#5c4328] to-[#4a3520]" />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#b89a6e]/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,170,130,0.25)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(40,25,10,0.3)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-[1400px] mx-auto">
          {/* Title — animated from both sides */}
          <h2 className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-[clamp(20px,3.5vw,40px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] text-center mb-14 md:mb-20" style={{ fontFamily: "'Oswald', sans-serif" }}>
            <div className="reveal-left" data-delay="100">
              <img
                src="/assets/ricky-text-cream.png"
                alt="Ricky"
                className="h-[clamp(24px,5vw,60px)] w-auto object-contain"
              />
            </div>
            <span className="reveal-right" data-delay="300">
              Has Performed With...
            </span>
          </h2>

          {/* Carousel 1 */}
          <div className="relative overflow-hidden mb-6">
            <div className="flex gap-4 animate-marquee-left">
              {[
                '/assets/highlight-studio.jpg',
                '/assets/highlight-arena.jpg',
                '/assets/moment-ibiza.jpg',
                '/assets/press-bg2.jpg',
                '/assets/highlight-club.jpg',
                '/assets/highlight-misfits.jpg',
              ].map((img, i) => (
                <div key={i} className="flex-shrink-0 w-[260px] md:w-[340px] aspect-square overflow-hidden">
                  <img src={img} alt={`Artist ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                '/assets/highlight-studio.jpg',
                '/assets/highlight-arena.jpg',
                '/assets/moment-ibiza.jpg',
                '/assets/press-bg2.jpg',
                '/assets/highlight-club.jpg',
                '/assets/highlight-misfits.jpg',
              ].map((img, i) => (
                <div key={`dup-${i}`} className="flex-shrink-0 w-[260px] md:w-[340px] aspect-square overflow-hidden">
                  <img src={img} alt={`Artist ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel 2 — opposite direction */}
          <div className="relative overflow-hidden mb-16">
            <div className="flex gap-4 animate-marquee-right">
              {[
                '/assets/highlight-misfits.jpg',
                '/assets/highlight-club.jpg',
                '/assets/press-bg2.jpg',
                '/assets/moment-ibiza.jpg',
                '/assets/highlight-arena.jpg',
                '/assets/highlight-studio.jpg',
              ].map((img, i) => (
                <div key={i} className="flex-shrink-0 w-[260px] md:w-[340px] aspect-square overflow-hidden">
                  <img src={img} alt={`Artist ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                '/assets/highlight-misfits.jpg',
                '/assets/highlight-club.jpg',
                '/assets/press-bg2.jpg',
                '/assets/moment-ibiza.jpg',
                '/assets/highlight-arena.jpg',
                '/assets/highlight-studio.jpg',
              ].map((img, i) => (
                <div key={`dup2-${i}`} className="flex-shrink-0 w-[260px] md:w-[340px] aspect-square overflow-hidden">
                  <img src={img} alt={`Artist ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#c4b498]/50 font-medium text-center mb-16">
            And many more...
          </p>

          {/* Locations text */}
        </div>
      </section>

      
      {/* ═══ WORLDWIDE PERFORMANCES ═══ */}
      <section id="venues" className="relative py-20 md:py-28 px-6 md:px-14 overflow-hidden">
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="relative text-center reveal-fade border-t border-[#c4b498]/20 pt-12 pb-16 md:pb-10 rounded-xl overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <img src="/assets/venues-bg.jpg" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#2a1a0a]/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#5c4328]/40 via-transparent to-[#2a1a0a]/70" />
            </div>
            <h2 className="relative z-10 text-[clamp(28px,3.5vw,48px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] text-center mb-12">
              Worldwide Performances
            </h2>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-0.5 md:gap-y-1 max-w-[800px] mx-auto px-4 md:px-8 justify-items-center">
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">LIV (Miami)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">WALL (Miami)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">TAPE (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">HAKKASAN (Las Vegas)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">MOVIDA (Dubai)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">JIMMY&apos;Z (Monte Carlo)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">MINISTRY OF SOUND (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">1 OAK (New York)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">BYBLOS (Milan)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">PACHA (Ibiza)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">ARMANI (Dubai)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">MANDALAY BAY (Las Vegas)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">TEMPLE (San Francisco)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">POPPY (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">CIRQUE LE SOIR (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">HIGHLIGHT ROOM (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">TEDDY&apos;S @ ROOSEVELT (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">DELILAH (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">GIBSON (Frankfurt)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">LIO (Ibiza)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">STUDIO PARIS (Chicago)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">PREMIER @ BORGATE (Atlantic City)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">PARQ (San Diego)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">BOOTSY BELLOWS (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">WARWICK (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">LAVO (New York)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">TAO (New York)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">UP & DOWN (New York)</p>
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">LIBERTINE (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">SCANDAL (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">TOY ROOM (Dubai)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">1 OAK (Dubai)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">TAO (Las Vegas)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">BAOLI (Cannes)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">SHOKO (Barcelona)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">LASTA (Serbia)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">REX ROOMS (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">HARRIET&apos;S (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">VIP ROOM (St. Tropez)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">BON BONNIERE (Mykonos)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">DRAMA (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">DEAR DARLING (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">TRAMP (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">SPIRITO (Brussels)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">CUCKOO CLUB (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">RAFFLES (London)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">SUBOIS (Montreal)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">P1 (Munich)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">ZELO&apos;S (Monte Carlo)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">BOOTSY BELLOWS (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">WARWICK (Los Angeles)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">LAVO (New York)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">TAO (New York)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">UP & DOWN (New York)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">WIRELESS FESTIVAL (UK)</p>
                <p className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">READING & LEEDS FESTIVAL (UK)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MUSIC & MIXES ═══ */}
      <section id="radio" className="garrix-section garrix-radio-section">
        <div className="garrix-section-label">MUSIC<span className="garrix-section-line" /></div>
        <div className="garrix-section-inner">
          <div className="garrix-radio-grid">
            <div className="garrix-radio-text">
              <span className="garrix-label-tag">Listen & Download</span>
              <h2 className="garrix-heading">Music & Mixes</h2>
              <p className="garrix-body-text">{radioDescription}</p>
              <div className="garrix-stream-links mt-8">
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="garrix-btn garrix-btn-outline flex items-center justify-center px-3 py-2.5" aria-label="Spotify">
                  <svg viewBox="0 0 168 168" width="28" height="28">
                    <path fill="#5a3a1a" d="M84 0C37.6 0 0 37.6 0 84s37.6 84 84 84 84-37.6 84-84S130.4 0 84 0zm38.5 121.2c-1.5 2.5-4.7 3.2-7.1 1.7-19.5-11.9-44-14.6-72.9-8-2.8.6-5.6-1.1-6.2-3.9-.6-2.8 1.1-5.6 3.9-6.2 31.8-7.3 59.3-4.2 81.4 9.4 2.4 1.5 3.2 4.7 1.7 7.1zm10.3-22.9c-1.9 3-5.9 4-8.9 2.1-22.3-13.7-56.3-17.7-82.7-9.7-3.5 1.1-7.1-.9-8.1-4.3-1.1-3.5.9-7.1 4.3-8.1 30.2-9.2 67.7-4.8 93.1 11.1 3 1.8 4 5.9 2.1 8.9zm.9-23.8c-26.8-15.9-71-17.4-96.5-9.6-4.2 1.3-8.6-1.1-9.9-5.3-1.3-4.2 1.1-8.6 5.3-9.9 29.3-8.9 78.1-7.2 109.8 11.5 3.8 2.2 5 7.1 2.8 10.9-2.2 3.8-7.1 5.1-10.9 2.8-1.4-.8-2.8-1.7-4.1-2.6-.5-.3-.9-.5-1.4-.8z"/>
                  </svg>
                </a>
                <a href={appleMusicUrl} target="_blank" rel="noopener noreferrer" className="garrix-btn garrix-btn-outline flex items-center justify-center px-3 py-2.5" aria-label="Apple Music">
                  <svg viewBox="0 0 24 24" width="22" height="28">
                    <path fill="#5a3a1a" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </a>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="garrix-btn garrix-btn-outline flex items-center justify-center px-3 py-2.5" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path fill="#5a3a1a" d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.81z"/>
                    <path fill="#f0e6d8" d="M9.55 15.5V8.5l6.27 3.5-6.27 3.5z"/>
                  </svg>
                </a>
              </div>
              <div className="mt-6 border-t border-[#5a3a1a]/20 pt-4">
                <AudioTrackList tracks={tracks} />
              </div>
            </div>
            <div className="garrix-radio-image">
              <img src={radioImage} alt="Late Night Ricky" />
              <div className="garrix-eq-bars">
                {[12, 20, 16, 24, 14].map((h, i) => (
                  <span key={i} className="eq-bar" style={{ height: `${h}px`, animationDelay: `${[0, 0.2, 0.4, 0.1, 0.3][i]}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHARE YOUR MUSIC ═══ */}
      <section id="share-music">
        <ShareMusicCTA />
      </section>

      {/* ═══ TRUSTED BY GLOBAL BRANDS — hero-style with photo background ═══ */}
      <section id="brands" className="relative min-h-[80dvh] md:min-h-[100dvh] overflow-hidden">
        {/* Full background image — warm golden studio shot */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/ricky-brands-gold.png')`,
          }}
        />
        {/* Brown frosting overlay for warmth */}
        <div className="absolute inset-0 bg-[#5a3a0a]/30" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f0e6d8]/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#4a3520]/15" />

        <div className="relative z-10 flex flex-col justify-center min-h-[80dvh] md:min-h-[100dvh] px-6 md:px-14 py-20 md:py-20">
          {/* Title — cream like About section */}
          <h2 className="text-[clamp(28px,4vw,48px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] mb-10 md:mb-14 reveal-fade pl-4 md:pl-12" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Trusted by Global Brands
          </h2>

          {/* Brand logos — cream colored like About section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8 max-w-[700px] pl-4 md:pl-12 reveal-stagger">
            {[
              { src: '/assets/logo-cartier-trimmed.png', alt: 'Cartier' },
              { src: '/assets/logo-f1-trimmed.png', alt: 'F1' },
              { src: '/assets/logo-coca-cola-trimmed.png', alt: 'Coca-Cola' },
              { src: '/assets/logo-ciroc-trimmed.png', alt: 'CÎROC' },
              { src: '/assets/logo-dior-trimmed.png', alt: 'Dior' },
              { src: '/assets/logo-patek-trimmed.png', alt: 'Patek Philippe' },
              { src: '/assets/logo-prime-trimmed.png', alt: 'Prime' },
              { src: '/assets/logo-louis-vuitton-trimmed.png', alt: 'Louis Vuitton' },
              { src: '/assets/logo-mf-boxing-v2-trimmed.png', alt: 'Misfits Boxing' },
              { src: '/assets/logo-cannes-trimmed.png', alt: 'Festival de Cannes' },
            ].map((logo, i) => (
              <div key={i} className="flex items-center justify-center w-28 h-12 md:w-36 md:h-14">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="w-full h-full object-contain transition-all duration-300 hover:scale-105"
                  style={{
                    filter: 'brightness(0) invert(1) sepia(0.4) saturate(0.3) hue-rotate(350deg) brightness(0.75)',
                    opacity: 0.8,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <HomeContactSection />

            {/* ═══ FOOTER ═══ */}
      <footer className="garrix-footer">
        <div className="garrix-footer-inner">
          {/* Follow Me section */}
          <div className="garrix-footer-follow">
            <h3 className="garrix-footer-follow-heading">FOLLOW ME</h3>
            <div className="garrix-footer-socials">
              <a href="https://instagram.com/latenightricky" target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://youtube.com/@latenightricky" target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="https://open.spotify.com/artist/latenightricky" target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="Spotify">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.78.42-1.2.24-3.24-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.18.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </a>
              <a href="https://tiktok.com/@latenightricky" target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46v-7.15a8.16 8.16 0 005.58 2.18V11.2a4.85 4.85 0 01-3.77-1.58V6.69h3.77z"/></svg>
              </a>
              <a href="https://twitter.com/latenightricky" target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="X / Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://facebook.com/latenightricky" target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://music.apple.com/artist/latenightricky" target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="Apple Music">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0019.7.264 9.17 9.17 0 0017.55.02C16.86.006 16.167 0 15.478 0H8.522c-.69 0-1.382.006-2.072.022a9.17 9.17 0 00-2.15.244A5.022 5.022 0 002.426.891C1.31 1.624.564 2.624.248 3.934a9.23 9.23 0 00-.24 2.19C-.006 6.814 0 7.506 0 8.194v7.612c0 .688-.006 1.38.008 2.07a9.23 9.23 0 00.24 2.19c.316 1.31 1.062 2.31 2.18 3.043a5.022 5.022 0 001.874.726 9.17 9.17 0 002.15.244c.69.016 1.382.022 2.072.022h6.956c.69 0 1.382-.006 2.072-.022a9.17 9.17 0 002.15-.244 5.022 5.022 0 001.874-.726c1.118-.734 1.863-1.734 2.18-3.043a9.23 9.23 0 00.24-2.19c.014-.69.008-1.382.008-2.07V8.194c0-.688.006-1.38-.008-2.07zM16.6 16.8c-1.8.9-3.6.7-5.4.2-1.7-.5-3.3-1.3-4.8-2.2-.7-.4-1.3-.9-1.8-1.5-.4-.5-.4-1 0-1.5.3-.4.8-.5 1.3-.2.3.2.6.4.9.6 1.4 1 2.9 1.8 4.5 2.3 1.2.4 2.4.5 3.7.3.5-.1 1-.3 1.4-.6.6-.4.7-1 .2-1.5-.3-.3-.7-.5-1.1-.6-.8-.3-1.7-.5-2.5-.7-1.1-.3-2.2-.6-3.2-1.1-.8-.4-1.5-.9-2-1.6-.6-.9-.6-1.9 0-2.8.5-.7 1.2-1.1 2-1.4 1.3-.4 2.6-.5 3.9-.3 1.2.2 2.3.6 3.3 1.3.4.3.7.6.9 1 .3.6.1 1.2-.5 1.5-.4.2-.8.2-1.2 0-.8-.4-1.6-.8-2.5-1.1-1-.3-2-.4-3-.2-.5.1-.9.3-1.2.7-.3.4-.3.8 0 1.1.3.3.6.5 1 .7 1.1.4 2.2.7 3.3 1 1.1.3 2.2.7 3.2 1.2.7.4 1.3.9 1.7 1.6.7 1.2.5 2.5-.5 3.5z"/></svg>
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="garrix-footer-bottom">
            <div className="garrix-footer-logo">
              <img src="/assets/ricky-logo.png" alt="LNR" className="h-8 md:h-6 opacity-40" style={{ filter: 'brightness(0) invert(1) sepia(0.4) saturate(0.3) hue-rotate(350deg) brightness(0.75)' }} />
            </div>
            <p>&copy; {new Date().getFullYear()} Late Night Ricky. All rights reserved.</p>
            <div className="garrix-footer-links">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/admin">Admin Login</a>
            </div>
          </div>
          <div className="garrix-footer-powered">
            Powered by <a href="https://nuelo.co" target="_blank" rel="noopener noreferrer">Nuelo CoLab</a>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}