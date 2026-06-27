import Navbar from '../components/Navbar';
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
  void heroLogo; void heroGrayscale; void heroBackgroundSize; void heroBackgroundPosition; void reachOutImage; void reachOutCta;
  try {
    const [dbCards, dbNames, dbVenues, dbTracks, dbSections] = await Promise.all([
      getShowCards(), getClientNames(), getVenueTicker(), getTracks(), getSiteSections('home'),
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
      tracks = dbTracks.map((t: any) => ({ title: t.title, time: t.duration || '0:30', src: t.filePath }));
    }
    if (dbCards.length > 0) {
      shows = dbCards.map((c: any) => ({ href: c.href || '#', image: c.imagePath || '/assets/ricky-hero-new.jpg', venue: c.venue, location: c.location, season: c.season, title: c.title, description: c.description }));
    }
    if (dbNames.length > 0) { clients = dbNames.map((n: any) => n.name); }
    if (dbVenues && Array.isArray(dbVenues) && dbVenues.length > 0) { venues = dbVenues; }
  } catch { /* DB unreachable — use hardcoded defaults */ }

  const venueRows = venues.length > 0 ? [...venues, ...venues, ...venues] : ['NO UPCOMING SHOWS'];
  const clientRows = clients.length > 0 ? [...clients, ...clients, ...clients] : ['STAY TUNED'];

  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* ═══ HERO — original LNR hero with logo ═══ */}
      <section className="lnr-hero">
        <div className="lnr-hero-bg" style={{ backgroundImage: `url('${heroImage}')`, backgroundSize: heroBackgroundSize, backgroundPosition: heroBackgroundPosition, filter: heroGrayscale ? 'grayscale(100%) brightness(1.3)' : 'none', mixBlendMode: 'multiply' }} />
        <img src={heroLogo} alt="Late Night Ricky" className="lnr-hero-logo" />
        <div className="lnr-hero-scroll">
          <span>Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* ═══ SHOWREEL — outlined text over video ═══ */}
      <section className="garrix-showreel">
        <video className="garrix-showreel-video" autoPlay loop muted playsInline poster="/assets/video-poster-desktop.jpg">
          <source src="/assets/video-desktop.mp4" type="video/mp4" />
        </video>
        <div className="garrix-showreel-overlay" />
        <div className="garrix-showreel-content">
          <h2 className="garrix-hero-title">LATE<br/>NIGHT<br/>RICKY</h2>
          <a href="/showreel" className="garrix-btn garrix-btn-outline">WATCH SHOWREEL</a>
        </div>
      </section>

      {/* ═══ SHOWS — vertical label + slow marquees over faded image ═══ */}
      <section id="shows" className="garrix-section garrix-shows-section">
        <div className="garrix-section-label">SHOWS<span className="garrix-section-line" /></div>
        <div className="garrix-shows-bg" style={{ backgroundImage: `url('/assets/ricky-hero-new.jpg')` }} />
        <div className="garrix-section-inner">
          <div className="garrix-shows-header">
            <h2 className="garrix-heading">SELECTED SHOWS</h2>
            <p className="garrix-subtitle">From stadium tours to private celebrations — every set tells a story.</p>
          </div>
          <div className="garrix-marquee-wrapper">
            <div className="garrix-marquee-track" style={{ animationDuration: '60s' }}>
              {venueRows.map((venue: any, i: number) => (
                <span key={i} className="garrix-marquee-item">{typeof venue === 'string' ? venue : venue.name}<span className="garrix-marquee-dot">·</span></span>
              ))}
            </div>
          </div>
          <div className="garrix-marquee-wrapper">
            <div className="garrix-marquee-track garrix-marquee-reverse" style={{ animationDuration: '50s' }}>
              {venueRows.map((venue: any, i: number) => (
                <span key={i} className="garrix-marquee-item">{typeof venue === 'string' ? venue : venue.name}<span className="garrix-marquee-dot">·</span></span>
              ))}
            </div>
          </div>
          <div className="garrix-marquee-wrapper">
            <div className="garrix-marquee-track" style={{ animationDuration: '70s' }}>
              {venueRows.map((venue: any, i: number) => (
                <span key={i} className="garrix-marquee-item">{typeof venue === 'string' ? venue : venue.name}<span className="garrix-marquee-dot">·</span></span>
              ))}
            </div>
          </div>
          <div className="garrix-section-cta">
            <a href="/shows" className="garrix-btn garrix-btn-white">VIEW ALL SHOWS</a>
          </div>
        </div>
      </section>

      {/* ═══ HIGHLIGHTS — stacking cards with vertical label ═══ */}
      {shows.length > 0 && (
        <section className="garrix-section garrix-highlights-section">
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
      <section className="garrix-collage-section">
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
      <div className="garrix-life-banner">
        <h2>LATE NIGHT RICKY</h2>
      </div>

      {/* ═══ PARTNERSHIPS ═══ */}
      <PartnerLogosSection defaultLogos={DEFAULT_LOGOS} quote={partnersQuote} attribution={partnersAttribution} description={partnersDescription} pressPack={pressPack} />

      {/* ═══ CLIENTS — slow marquee with vertical label ═══ */}
      <section className="garrix-section garrix-clients-section">
        <div className="garrix-section-label">CLIENTS<span className="garrix-section-line" /></div>
        <div className="garrix-section-inner">
          <div className="garrix-clients-header">
            <h2 className="garrix-heading">{clientsTitle}</h2>
            <p className="garrix-subtitle">A few names we&apos;ve shared the stage with</p>
          </div>
          <div className="garrix-marquee-wrapper">
            <div className="garrix-marquee-track garrix-marquee-clients" style={{ animationDuration: '55s' }}>
              {clientRows.map((c: any, i: number) => (
                <span key={i} className="garrix-marquee-item garrix-marquee-item-sm">{typeof c === 'string' ? c : c.name}<span className="garrix-marquee-dot">·</span></span>
              ))}
            </div>
          </div>
          <div className="garrix-marquee-wrapper">
            <div className="garrix-marquee-track garrix-marquee-reverse garrix-marquee-clients" style={{ animationDuration: '65s' }}>
              {clientRows.map((c: any, i: number) => (
                <span key={i} className="garrix-marquee-item garrix-marquee-item-sm">{typeof c === 'string' ? c : c.name}<span className="garrix-marquee-dot">·</span></span>
              ))}
            </div>
          </div>
        </div>
      </section>

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
      <section className="garrix-cta-section">
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