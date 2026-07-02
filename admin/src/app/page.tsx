import Navbar from '../components/Navbar';
import ScrollReveal from '../components/ScrollReveal';
import AudioTrackList from '../components/AudioTrackList';
import ShareMusicCTA from '../components/ShareMusicCTA';
import TrustedBySection from '../components/TrustedBySection';
import HomeContactSection from '../components/HomeContactSection';
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
  { title: 'Late Night Ricky — After Hours', time: '0:30' },
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
  let videoPoster = '/assets/video-poster-desktop.jpg';
  let videoSrc = '/assets/video-desktop.mp4';
  let radioImage = '/assets/ricky-radio-new.jpg';
  let radioHeadline = 'As Heard On';
  let radioLabel = 'Music & Radio';
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
  void heroGrayscale; void heroBackgroundSize; void heroBackgroundPosition; void reachOutImage; void reachOutCta; void pressPack; void clientsTitle; void clients;
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
      const videoSection = dbSections.find((s: any) => s.section === 'video');
      if (videoSection?.content) {
        const c = typeof videoSection.content === 'string' ? JSON.parse(videoSection.content) : videoSection.content;
        if (c.poster) videoPoster = c.poster;
        if (c.src) videoSrc = c.src;
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
      tracks = dbTracks.map((t: any) => ({ title: t.title, time: t.duration || '0:30', src: t.filePath }));
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
        {/* Logo + subtitle — positioned left, level with sunglasses (~mid-hero) */}
        <div className="relative z-10 flex flex-col items-start ml-4 md:ml-12" style={{ marginTop: '28vh' }}>
          <img src={heroLogo} alt="Late Night Ricky" className="w-[40%] max-w-[500px] min-w-[200px] drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)]" />
          <p className="mt-3 text-[clamp(11px,1.2vw,14px)] font-bold tracking-[0.2em] uppercase text-[#c9a96e] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
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

      {/* ═══ SHOWREEL — disabled for now ═══
      <section className="garrix-showreel reveal-left">
        <video
          className="garrix-showreel-video"
          src="/assets/showreel-video.mp4"
          poster={videoPoster}
          playsInline
          autoPlay
          muted
          loop
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
        />
        <div className="garrix-showreel-gradient" />
        <div className="garrix-showreel-content">
          <h2 className="garrix-hero-title">LATE<br/>NIGHT<br/>RICKY</h2>
          <a href="/showreel" className="garrix-btn garrix-btn-outline">WATCH SHOWREEL</a>
        </div>
      </section>
      */}

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
          {/* Ronaldo Quote */}
          <div className="mb-12 md:mb-16 reveal-left">
            <p className="font-['Playfair_Display',serif] text-[clamp(28px,4vw,52px)] italic text-[#d4c4a8] leading-[1.3] max-w-[900px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
              &ldquo;The best DJ I&apos;ve heard.&rdquo;
            </p>
            <p className="mt-4 text-[13px] md:text-[15px] font-semibold tracking-[0.25em] uppercase text-[#c4b498]/80">
              — Ronaldo
            </p>
          </div>

          {/* 2-column layout */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-stretch">
            {/* Left — Text */}
            <div className="reveal-left" data-delay="100">
              <h2 className="text-[clamp(36px,5vw,72px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] mb-8">
                About Ricky
              </h2>
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
            </div>

            {/* Right — Photo blends into page */}
            <div className="reveal-right h-full" data-delay="200">
              <div
                className="h-full w-full"
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
                    filter: 'contrast(1.1) brightness(1.05)',
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ LATE NIGHT MOMENTS — 3x2 grid, title above image, square B&W ═══ */}
      <section id="moments" className="relative py-20 md:py-28 px-6 md:px-14 overflow-hidden">
        {/* Slightly creamier warm background */}
        <div className="absolute inset-0 bg-[#f8f1e8]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8d4b8]/20 via-transparent to-[#d4c4a8]/15" />

        <div className="relative z-10 max-w-[1400px] mx-auto">
          <h2 className="text-[clamp(32px,4.5vw,64px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#5a3a1a] text-center mb-14 md:mb-20">
            Late Night Moments
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {/* Row 1 — 3 cards */}
            <a href="/show-misfits-boxing" className="group block">
              <h3 className="font-['Playfair_Display',serif] text-[clamp(16px,2vw,22px)] font-bold text-[#2a1a0a] group-hover:text-[#5a3a1a] transition-colors leading-[1.2] mb-1">
                Misfits Boxing
              </h3>
              <p className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-[#5a3a1a]/50 font-medium mb-2">
                Ministry of Sound, London
              </p>
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/highlight-studio.jpg"
                  alt="Misfits Boxing"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a href="/show-arena" className="group block">
              <h3 className="font-['Playfair_Display',serif] text-[clamp(16px,2vw,22px)] font-bold text-[#2a1a0a] group-hover:text-[#5a3a1a] transition-colors leading-[1.2] mb-1">
                O2 Arena
              </h3>
              <p className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-[#5a3a1a]/50 font-medium mb-2">
                The O2, London
              </p>
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/highlight-arena.jpg"
                  alt="O2 Arena"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a href="/show-ibiza-2024" className="group block">
              <h3 className="font-['Playfair_Display',serif] text-[clamp(16px,2vw,22px)] font-bold text-[#2a1a0a] group-hover:text-[#5a3a1a] transition-colors leading-[1.2] mb-1">
                Ibiza Summer
              </h3>
              <p className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-[#5a3a1a]/50 font-medium mb-2">
                Ushuaïa, Ibiza
              </p>
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/moment-ibiza.jpg"
                  alt="Ibiza Summer"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-[#5a3a1a]/50 font-medium">
                Ushuaïa, Ibiza
              </p>
            </a>

            {/* Row 2 — 3 cards */}
            <a href="/show-private" className="group block">
              <h3 className="font-['Playfair_Display',serif] text-[clamp(16px,2vw,22px)] font-bold text-[#2a1a0a] group-hover:text-[#5a3a1a] transition-colors leading-[1.2] mb-1">
                Private Events
              </h3>
              <p className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-[#5a3a1a]/50 font-medium mb-2">
                Worldwide
              </p>
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/press-bg2.jpg"
                  alt="Private Events"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a href="/show-club" className="group block">
              <h3 className="font-['Playfair_Display',serif] text-[clamp(16px,2vw,22px)] font-bold text-[#2a1a0a] group-hover:text-[#5a3a1a] transition-colors leading-[1.2] mb-1">
                Back to Back
              </h3>
              <p className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-[#5a3a1a]/50 font-medium mb-2">
                Private Events, London
              </p>
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/highlight-club.jpg"
                  alt="Back to Back"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a href="/show-ibiza" className="group block">
              <h3 className="font-['Playfair_Display',serif] text-[clamp(16px,2vw,22px)] font-bold text-[#2a1a0a] group-hover:text-[#5a3a1a] transition-colors leading-[1.2] mb-1">
                Ibiza Rocks
              </h3>
              <p className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-[#5a3a1a]/50 font-medium mb-2">
                Ibiza Rocks, Ibiza
              </p>
              <div className="relative aspect-square overflow-hidden">
                <img
                  src="/assets/highlight-misfits.jpg"
                  alt="Ibiza Rocks"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ TRUSTED BY THE BEST — interactive names with background ═══ */}
      <TrustedBySection
        quote={partnersQuote}
        attribution={partnersAttribution}
        description={partnersDescription}
        clients={clients}
        revealClass=""
      />


      {/* ═══ VENUES — scrolling marquee ═══ */}
      <section className="garrix-venues-section">
        <div className="garrix-venues-label">WORLDWIDE PERFORMANCES</div>
        <div className="garrix-venues-track">
          <div className="garrix-venues-row garrix-venues-row-forward">
            <span>LIV Miami</span><span className="garrix-venues-dot">·</span>
            <span>HAKKASAN Las Vegas</span><span className="garrix-venues-dot">·</span>
            <span>MINISTRY OF SOUND London</span><span className="garrix-venues-dot">·</span>
            <span>BYBLOS Milan</span><span className="garrix-venues-dot">·</span>
            <span>MANDALAY BAY Las Vegas</span><span className="garrix-venues-dot">·</span>
            <span>CIRQUE LE SOIR London</span><span className="garrix-venues-dot">·</span>
            <span>GIBSON Frankfurt</span><span className="garrix-venues-dot">·</span>
            <span>LIBERTINE London</span><span className="garrix-venues-dot">·</span>
            <span>1 OAK Dubai</span><span className="garrix-venues-dot">·</span>
            <span>SHOKO Barcelona</span><span className="garrix-venues-dot">·</span>
            <span>TRAMP London</span><span className="garrix-venues-dot">·</span>
            <span>RAFFLES London</span><span className="garrix-venues-dot">·</span>
            <span>O2 ARENA London</span><span className="garrix-venues-dot">·</span>
            <span>FABRIC London</span><span className="garrix-venues-dot">·</span>
            <span>AMNESIA Ibiza</span><span className="garrix-venues-dot">·</span>
            {/* Duplicate for seamless loop */}
            <span>LIV Miami</span><span className="garrix-venues-dot">·</span>
            <span>HAKKASAN Las Vegas</span><span className="garrix-venues-dot">·</span>
            <span>MINISTRY OF SOUND London</span><span className="garrix-venues-dot">·</span>
            <span>BYBLOS Milan</span><span className="garrix-venues-dot">·</span>
            <span>MANDALAY BAY Las Vegas</span><span className="garrix-venues-dot">·</span>
            <span>CIRQUE LE SOIR London</span><span className="garrix-venues-dot">·</span>
            <span>GIBSON Frankfurt</span><span className="garrix-venues-dot">·</span>
            <span>LIBERTINE London</span><span className="garrix-venues-dot">·</span>
            <span>1 OAK Dubai</span><span className="garrix-venues-dot">·</span>
            <span>SHOKO Barcelona</span><span className="garrix-venues-dot">·</span>
            <span>TRAMP London</span><span className="garrix-venues-dot">·</span>
            <span>RAFFLES London</span><span className="garrix-venues-dot">·</span>
            <span>O2 ARENA London</span><span className="garrix-venues-dot">·</span>
            <span>FABRIC London</span><span className="garrix-venues-dot">·</span>
            <span>AMNESIA Ibiza</span><span className="garrix-venues-dot">·</span>
          </div>
          <div className="garrix-venues-row garrix-venues-row-reverse">
            <span>WALL Miami</span><span className="garrix-venues-dot">·</span>
            <span>TAPE London</span><span className="garrix-venues-dot">·</span>
            <span>MOVIDA Dubai</span><span className="garrix-venues-dot">·</span>
            <span>1 OAK New York</span><span className="garrix-venues-dot">·</span>
            <span>PACHA Ibiza</span><span className="garrix-venues-dot">·</span>
            <span>ARMANI Dubai</span><span className="garrix-venues-dot">·</span>
            <span>POPPY Los Angeles</span><span className="garrix-venues-dot">·</span>
            <span>DELILAH Los Angeles</span><span className="garrix-venues-dot">·</span>
            <span>STUDIO PARIS Chicago</span><span className="garrix-venues-dot">·</span>
            <span>SCANDAL London</span><span className="garrix-venues-dot">·</span>
            <span>TAO Las Vegas</span><span className="garrix-venues-dot">·</span>
            <span>VIP ROOM St Tropez</span><span className="garrix-venues-dot">·</span>
            <span>DEAR DARLING London</span><span className="garrix-venues-dot">·</span>
            <span>CUCKOO CLUB London</span><span className="garrix-venues-dot">·</span>
            <span>USHUAÏA Ibiza</span><span className="garrix-venues-dot">·</span>
            <span>PRINTWORKS London</span><span className="garrix-venues-dot">·</span>
            <span>DC10 Ibiza</span><span className="garrix-venues-dot">·</span>
            {/* Duplicate for seamless loop */}
            <span>WALL Miami</span><span className="garrix-venues-dot">·</span>
            <span>TAPE London</span><span className="garrix-venues-dot">·</span>
            <span>MOVIDA Dubai</span><span className="garrix-venues-dot">·</span>
            <span>1 OAK New York</span><span className="garrix-venues-dot">·</span>
            <span>PACHA Ibiza</span><span className="garrix-venues-dot">·</span>
            <span>ARMANI Dubai</span><span className="garrix-venues-dot">·</span>
            <span>POPPY Los Angeles</span><span className="garrix-venues-dot">·</span>
            <span>DELILAH Los Angeles</span><span className="garrix-venues-dot">·</span>
            <span>STUDIO PARIS Chicago</span><span className="garrix-venues-dot">·</span>
            <span>SCANDAL London</span><span className="garrix-venues-dot">·</span>
            <span>TAO Las Vegas</span><span className="garrix-venues-dot">·</span>
            <span>VIP ROOM St Tropez</span><span className="garrix-venues-dot">·</span>
            <span>DEAR DARLING London</span><span className="garrix-venues-dot">·</span>
            <span>CUCKOO CLUB London</span><span className="garrix-venues-dot">·</span>
            <span>USHUAÏA Ibiza</span><span className="garrix-venues-dot">·</span>
            <span>PRINTWORKS London</span><span className="garrix-venues-dot">·</span>
            <span>DC10 Ibiza</span><span className="garrix-venues-dot">·</span>
          </div>
          <div className="garrix-venues-row garrix-venues-row-forward">
            <span>JIMMY&apos;Z Monte Carlo</span><span className="garrix-venues-dot">·</span>
            <span>TEMPLE San Francisco</span><span className="garrix-venues-dot">·</span>
            <span>HIGHLIGHT ROOM Los Angeles</span><span className="garrix-venues-dot">·</span>
            <span>LIO Ibiza</span><span className="garrix-venues-dot">·</span>
            <span>PARQ San Diego</span><span className="garrix-venues-dot">·</span>
            <span>TOY ROOM Dubai</span><span className="garrix-venues-dot">·</span>
            <span>BAOLI Cannes</span><span className="garrix-venues-dot">·</span>
            <span>DRAMA London</span><span className="garrix-venues-dot">·</span>
            <span>SPIRITO Brussels</span><span className="garrix-venues-dot">·</span>
            <span>WIRELESS FESTIVAL UK</span><span className="garrix-venues-dot">·</span>
            <span>IBIZA ROCKS</span><span className="garrix-venues-dot">·</span>
            <span>WEMBLEY London</span><span className="garrix-venues-dot">·</span>
            {/* Duplicate for seamless loop */}
            <span>JIMMY&apos;Z Monte Carlo</span><span className="garrix-venues-dot">·</span>
            <span>TEMPLE San Francisco</span><span className="garrix-venues-dot">·</span>
            <span>HIGHLIGHT ROOM Los Angeles</span><span className="garrix-venues-dot">·</span>
            <span>LIO Ibiza</span><span className="garrix-venues-dot">·</span>
            <span>PARQ San Diego</span><span className="garrix-venues-dot">·</span>
            <span>TOY ROOM Dubai</span><span className="garrix-venues-dot">·</span>
            <span>BAOLI Cannes</span><span className="garrix-venues-dot">·</span>
            <span>DRAMA London</span><span className="garrix-venues-dot">·</span>
            <span>SPIRITO Brussels</span><span className="garrix-venues-dot">·</span>
            <span>WIRELESS FESTIVAL UK</span><span className="garrix-venues-dot">·</span>
            <span>IBIZA ROCKS</span><span className="garrix-venues-dot">·</span>
            <span>WEMBLEY London</span><span className="garrix-venues-dot">·</span>
          </div>
        </div>
      </section>
      {/* ═══ COLLAGE — asymmetric scatter with ghost watermark ═══ */}
      <section className="garrix-collage-section">
        <div className="garrix-collage-ghost" aria-hidden="true">RICKY</div>
        <div className="garrix-collage-ghost garrix-collage-ghost-outline" aria-hidden="true">LATE<br/>NIGHT</div>
        <div className="garrix-collage-grid">
          <div className="garrix-collage-photo garrix-cp-1" data-layer="layer4">
            <img src="/assets/ricky-hero-new.jpg" alt="Late Night Ricky" />
            <div className="garrix-collage-quote">
              <p>&ldquo;Living life to the fullest!&rdquo;</p>
            </div>
          </div>
          <div className="garrix-collage-photo garrix-cp-2" data-layer="layer3">
            <img src="/assets/ricky-hero-v2.jpg" alt="Ricky performing" />
          </div>
          <div className="garrix-collage-photo garrix-cp-3" data-layer="layer2">
            <img src="/assets/ricky-seated.jpg" alt="Ricky seated" />
            <div className="garrix-collage-outline">LATE<br/>NIGHT</div>
          </div>
          <div className="garrix-collage-photo garrix-cp-4" data-layer="layer2">
            <img src="/assets/ricky-portrait-standing.jpg" alt="" style={{ filter: 'grayscale(1) contrast(1.1)' }} />
            <div className="garrix-collage-play">
              <button className="garrix-play-circle" id="collage-play-btn" aria-label="Play video">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" /><polygon points="26,18 50,32 26,46" fill="currentColor" /></svg>
              </button>
            </div>
          </div>
        </div>
        {/* Video overlay that expands over the collage */}
        <div className="garrix-collage-video-overlay" id="collage-video-overlay">
          <video id="collage-video" className="garrix-collage-video" src="/assets/video-desktop.mp4" poster="/assets/ricky-portrait-standing.jpg" muted playsInline loop />
          <button className="garrix-video-close" id="collage-video-close" aria-label="Close video">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="garrix-collage-caption">
          <span className="garrix-serif">Music is the only thing that makes sense.</span>
        </div>
      </section>

      {/* ═══ LIFE IS CRAZY — outlined text banner ═══ */}
      <div className="garrix-life-banner">
        <p className="garrix-life-quote">&ldquo;{partnersQuote}&rdquo;</p>
        <p className="garrix-life-attribution">&mdash; {partnersAttribution}</p>
        <h2>LATE NIGHT RICKY</h2>
      </div>

      {/* ═══ RADIO ═══ */}
      <section id="radio" className="garrix-section garrix-radio-section">
        <div className="garrix-section-label">MUSIC<span className="garrix-section-line" /></div>
        <div className="garrix-section-inner">
          <div className="garrix-radio-grid">
            <div className="garrix-radio-image">
              <img src={radioImage} alt="Late Night Ricky" />
              <div className="garrix-eq-bars">
                {[12, 20, 16, 24, 14].map((h, i) => (
                  <span key={i} className="eq-bar" style={{ height: `${h}px`, animationDelay: `${[0, 0.2, 0.4, 0.1, 0.3][i]}s` }} />
                ))}
              </div>
            </div>
            <div className="garrix-radio-text">
              <span className="garrix-label-tag">{radioLabel}</span>
              <h2 className="garrix-heading">{radioHeadline}</h2>
              <p className="garrix-body-text">{radioDescription}</p>
              <div className="garrix-stream-links">
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="garrix-btn garrix-btn-outline">Spotify</a>
                <a href={appleMusicUrl} target="_blank" rel="noopener noreferrer" className="garrix-btn garrix-btn-outline">Apple</a>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="garrix-btn garrix-btn-outline">YouTube</a>
              </div>
              <div className="garrix-audio-divider">
                <AudioTrackList tracks={tracks} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHARE MUSIC CTA ═══ */}
      <ShareMusicCTA />

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

          {/* Navigation columns */}
          <div className="garrix-footer-grid">
            <div className="garrix-footer-col">
              <h4>Music</h4>
              <a href="/#radio">Listen Now</a>
              <a href="/share-music">Share Your Music</a>
            </div>
            <div className="garrix-footer-col">
              <h4>Partners</h4>
              <a href="/#partnerships">All Partnerships</a>
              <a href="/assets/press-pack.pdf" target="_blank" rel="noopener noreferrer">Press Pack</a>
            </div>
            <div className="garrix-footer-col">
              <h4>Contact</h4>
              <a href="/contact">Contact Us</a>
              <a href="/#contact-form">Bookings</a>
            </div>
          </div>
              
          {/* Bottom bar */}
          <div className="garrix-footer-bottom">
            <div className="garrix-footer-logo">
              <img src="/assets/ricky-logo.png" alt="LNR" className="brightness-0 invert opacity-40 h-6" />
            </div>
            <p>&copy; {new Date().getFullYear()} Late Night Ricky. All rights reserved.</p>
            <div className="garrix-footer-links">
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
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