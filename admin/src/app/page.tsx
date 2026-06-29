import Navbar from '../components/Navbar';
import ScrollReveal from '../components/ScrollReveal';
import AudioTrackList from '../components/AudioTrackList';
import TrustedBySection from '../components/TrustedBySection';
import HomeContactSection from '../components/HomeContactSection';
import Loader from '../components/Loader';
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
    image: '/assets/press-bg2.jpg',
    venue: 'Ibiza Rocks',
    location: 'Ibiza',
    season: 'Spring / Summer 2024',
    title: 'Gin & Juice Launch',
    description: 'Sunset sets and poolside energy in the White Isle.',
  },
  {
    href: '/show-abu-dhabi',
    image: '/assets/ricky-hero-v2.jpg',
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

function assetPath(p?: string | null) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  if (p.startsWith('/')) return p;
  return '/' + p;
}

export default async function HomePage() {
  let shows: any[] = DEFAULT_SHOWS;
  let clients: string[] = DEFAULT_CLIENTS;
  let tracks = DEFAULT_TRACKS;
  let heroImage = '/assets/ricky-hero-v2.jpg';
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
  // Suppress unused-variable warnings for CMS values not yet used in new layout
  void heroGrayscale; void heroBackgroundSize; void heroBackgroundPosition; void reachOutImage; void reachOutCta; void pressPack; void clientsTitle; void clients;
  try {
    const [dbCards, dbNames, dbTracks, dbSections] = await Promise.all([
      getShowCards(), getClientNames(), getTracks(), getSiteSections('home'),
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
      {/* ═══ LOADING ANIMATION ═══ */}
      <Loader />

      <Navbar />
      <ScrollReveal />

      {/* Hero */}
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
        <img src={heroLogo} alt="Late Night Ricky" className="relative z-10 w-[52%] max-w-[700px] min-w-[280px] mx-auto mb-14 drop-shadow-[0_4px_30px_rgba(168,213,240,0.4)]" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white opacity-70">
          <span className="text-[11px] tracking-[2.5px] uppercase font-medium">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* ═══ SHOWREEL — outlined text over video (bright, visible) ═══ */}
      <section className="garrix-showreel reveal-left">
        <video
          className="garrix-showreel-video"
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
        />
        <div className="garrix-showreel-gradient" />
        <div className="garrix-showreel-content">
          <h2 className="garrix-hero-title">LATE<br/>NIGHT<br/>RICKY</h2>
          <a href="/showreel" className="garrix-btn garrix-btn-outline">WATCH SHOWREEL</a>
        </div>
      </section>

      {/* ═══ REACH — Garrix-style editorial collage ═══ */}
      <section id="reach" className="lnr-reach-collage reveal-left">
        {/* Ghost watermark behind photos */}
        <div className="lnr-reach-ghost" aria-hidden="true">RICKY</div>
        {/* Primary portrait photo — left side */}
        <div className="lnr-reach-photo-primary">
          <img src="/assets/ricky-portrait-new.jpg" alt="Late Night Ricky" />
        </div>
        {/* Dark text card — overlaps photo, center-right */}
        <div className="lnr-reach-card">
          <h2 className="lnr-reach-quote">
            International DJ &amp; Grammy Winning Producer. From London to New York / LA to Las Vegas / Miami to Ibiza and beyond.
          </h2>
          <p className="lnr-reach-sub">
            150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.
          </p>
          <span className="lnr-reach-sig">— Late Night Ricky</span>
        </div>
        {/* Secondary texture strip — bottom right */}
        <div className="lnr-reach-photo-secondary">
          <img src="/assets/press-bg2.jpg" alt="" />
        </div>
      </section>

      {/* ═══ TRUSTED BY THE BEST — interactive names with background ═══ */}
      <TrustedBySection
        quote={partnersQuote}
        attribution={partnersAttribution}
        description={partnersDescription}
        clients={clients}
        revealClass="reveal-scale"
      />

      {/* ═══ HIGHLIGHTS — stacking cards with vertical label ═══ */}
      {shows.length > 0 && (
        <section className="garrix-section garrix-highlights-section reveal-right">
          <div className="garrix-section-label">HIGHLIGHTS<span className="garrix-section-line" /></div>
          <div className="garrix-section-inner">
            <div className="garrix-highlights-header">
              <h2 className="garrix-heading">RECENT HIGHLIGHTS</h2>
              <p className="garrix-subtitle">Learn more about the music, or check the latest releases right here.</p>
            </div>
            <div className="garrix-stack">
              {shows.map((card: any, i: number) => (
                <a key={card.id || card.title} href={card.href || '#'} className="garrix-stack-card" style={{ top: `${80 + i * 24}px` }}>
                  <div className="garrix-stack-card-img" style={{ backgroundImage: `url('${assetPath(card.image)}')` }}>
                    <div className="garrix-stack-card-overlay" />
                    <div className="garrix-stack-card-play" />
                  </div>
                  <div className="garrix-stack-card-info">
                    <span className="garrix-stack-card-season">{card.season}</span>
                    <h3 className="garrix-stack-card-title">{card.title}</h3>
                    <span className="garrix-stack-card-venue">{card.venue}{card.location ? ` — ${card.location}` : ''}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ COLLAGE — asymmetric scatter with ghost watermark ═══ */}
      <section className="garrix-collage-section reveal-scale">
        <div className="garrix-collage-ghost" aria-hidden="true">RICKY</div>
        <div className="garrix-collage-photos">
          <div className="garrix-collage-photo garrix-cp-1">
            <img src="/assets/ricky-hero-new.jpg" alt="Late Night Ricky" />
            <div className="garrix-collage-quote">
              <p>&ldquo;Music is the only thing that makes sense&rdquo;</p>
            </div>
          </div>
          <div className="garrix-collage-photo garrix-cp-2">
            <img src="/assets/ricky-fricktion.jpg" alt="Ricky DJing" />
            <div className="garrix-collage-outline">LATE<br/>NIGHT</div>
          </div>
          <div className="garrix-collage-photo garrix-cp-3">
            <img src="/assets/press-bg2.jpg" alt="Ricky performing" />
          </div>
          <div className="garrix-collage-photo garrix-cp-4">
            <img src="/assets/ricky-hero-v2.jpg" alt="" style={{ filter: 'grayscale(1) contrast(1.1)' }} />
          </div>
        </div>
        <div className="garrix-collage-caption">
          <span className="garrix-serif">Living life to the fullest!</span>
        </div>
      </section>

      {/* ═══ LIFE IS CRAZY — outlined text banner ═══ */}
      <div className="garrix-life-banner reveal-fade">
        <h2>LATE NIGHT RICKY</h2>
      </div>

      {/* ═══ RADIO ═══ */}
      <section id="radio" className="garrix-section garrix-radio-section reveal-left">
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
              <h2 className="garrix-heading garrix-heading-serif">{radioHeadline}</h2>
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
      <section className="garrix-cta-section reveal-scale">
        <div className="garrix-cta-bg" style={{ backgroundImage: `url('/assets/press-bg2.jpg')` }} />
        <div className="garrix-cta-overlay" />
        <div className="garrix-cta-content">
          <h2 className="garrix-serif garrix-cta-heading">{shareMusicHeadline}</h2>
          <p className="garrix-body-text">{shareMusicDescription}</p>
          <a href="/share-music" className="garrix-btn garrix-btn-white">Submit Your Track</a>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <HomeContactSection />

      {/* ═══ FOOTER ═══ */}
      <footer className="garrix-footer">
        <div className="garrix-footer-inner">
          <div className="garrix-footer-grid">
            <div className="garrix-footer-col">
              <h4>Shows</h4>
              <a href="/shows">All Shows</a>
              <a href="/shows?region=europe">Europe</a>
              <a href="/shows?region=americas">Americas</a>
              <a href="/shows?region=asia">Asia</a>
              <a href="/shows?region=middle-east">Middle East</a>
            </div>
            <div className="garrix-footer-col">
              <h4>Music</h4>
              <a href="/#radio">All Music</a>
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
              <a href="/share-music">Send Music</a>
            </div>
          </div>
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
        </div>
      </footer>
    </>
  );
}