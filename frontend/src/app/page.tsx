import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RadioPlayer from '../components/RadioPlayer';
import { getSections, getShowCards, getPartnerLogos, getClientNames, getVenueTicker } from '../lib/api';

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

  // CMS section overrides — fall back to defaults only if CMS data is empty
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

  try {
    if (sections.length > 0) {
      const heroSection = sections.find((s: any) => s.section === 'hero');
      if (heroSection?.content) {
        const c = typeof heroSection.content === 'string' ? JSON.parse(heroSection.content) : heroSection.content;
        if (c.image) heroImage = c.image;
        if (c.logo) heroLogo = c.logo;
        if (c.grayscale !== undefined) heroGrayscale = c.grayscale;
        if (c.backgroundSize) heroBackgroundSize = c.backgroundSize;
        if (c.backgroundPosition) heroBackgroundPosition = c.backgroundPosition;
      }
      const videoSection = sections.find((s: any) => s.section === 'video');
      if (videoSection?.content) {
        const c = typeof videoSection.content === 'string' ? JSON.parse(videoSection.content) : videoSection.content;
        if (c.poster) videoPoster = c.poster;
        if (c.src) videoSrc = c.src;
      }
      const radioSectionData = sections.find((s: any) => s.section === 'radio');
      if (radioSectionData?.content) {
        const c = typeof radioSectionData.content === 'string' ? JSON.parse(radioSectionData.content) : radioSectionData.content;
        if (c.headline) radioHeadline = c.headline;
        if (c.description) radioDescription = c.description;
        if (c.image) radioImage = c.image;
        if (c.label) radioLabel = c.label;
        if (c.spotifyUrl) spotifyUrl = c.spotifyUrl;
        if (c.appleMusicUrl) appleMusicUrl = c.appleMusicUrl;
        if (c.youtubeUrl) youtubeUrl = c.youtubeUrl;
      }
      const partnersSection = sections.find((s: any) => s.section === 'partners');
      if (partnersSection?.content) {
        const c = typeof partnersSection.content === 'string' ? JSON.parse(partnersSection.content) : partnersSection.content;
        if (c.quote) partnersQuote = c.quote;
        if (c.attribution) partnersAttribution = c.attribution;
        if (c.description) partnersDescription = c.description;
        if (c.pressPack) pressPack = c.pressPack;
      }
      const clientsSection = sections.find((s: any) => s.section === 'clients');
      if (clientsSection?.content) {
        const c = typeof clientsSection.content === 'string' ? JSON.parse(clientsSection.content) : clientsSection.content;
        if (c.title) clientsTitle = c.title;
      }
    }
  } catch (e) {
    console.error('CMS section parse error:', e);
  }

  const radioSection = sections.find((s: any) => s.section === 'radio');
  const radioTracks = Array.isArray(radioSection?.content) ? radioSection.content : [];
  const radioLinks = radioSection?.links || {};

  // Triplicate for seamless marquee loops
  const venueRows = venues.length > 0 ? [...venues, ...venues, ...venues] : ['NO UPCOMING SHOWS'];
  const clientRows = clientNames.length > 0 ? [...clientNames, ...clientNames, ...clientNames] : [{ id: '0', name: 'STAY TUNED' }];

  return (
    <>
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════
          HERO — KEPT EXACTLY AS-IS
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-start justify-center px-8 md:px-14 pb-14 pt-20">
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#1e3a5c' }}>
          <div
            className="absolute inset-0 bg-cover bg-no-repeat bg-[70%_center]"
            style={{ backgroundImage: `url('${assetPath(heroImage)}')`, filter: heroGrayscale ? 'grayscale(100%) brightness(1.2)' : 'none', mixBlendMode: 'multiply' }}
          />
        </div>
        <img src={assetPath(heroLogo)} alt="Late Night Ricky" className="relative z-10 w-[52%] max-w-[700px] min-w-[280px] ml-[4%] mb-14 drop-shadow-[0_6px_30px_rgba(0,0,0,0.3)]" style={{ mixBlendMode: 'screen' }} />
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
          SHOW CARDS — Horizontal scrolling carousel
          ══════════════════════════════════════════════════════════════ */}
      {showCards.length > 0 && (
        <section className="relative z-10 bg-white py-24 md:py-32 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6 mb-10 md:mb-14">
            <h2 className="text-[clamp(28px,4vw,48px)] font-black text-[#111] tracking-[-1.5px] uppercase">
              Recent Highlights
            </h2>
          </div>
          <div className="show-cards-scroll">
            {showCards.map((card: any) => (
              <a key={card.id} href={card.href || '#'} className="show-card-item group">
                <div
                  className="show-card-image"
                  style={{ backgroundImage: `url('${assetPath(card.imagePath)}')` }}
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
          CLIENTS / NAMES MARQUEE — Outlined scrolling text
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0a0e17] py-24 md:py-32 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-12 md:mb-16">
          <h2 className="text-[clamp(36px,6vw,72px)] font-black tracking-[-2px] uppercase text-white text-center">
            Supporting Act
          </h2>
          <p className="text-sm text-[#6B8FAB] mt-4 tracking-[2px] uppercase text-center">
            A few names we&apos;ve shared the stage with
          </p>
        </div>

        {/* Row 1 */}
        <div className="marquee-row mb-4 md:mb-6">
          <div className="marquee-row-inner" style={{ animationDuration: '40s' }}>
            {clientRows.map((c: any, i: number) => (
              <span key={i} className="marquee-client-text">{c.name}</span>
            ))}
          </div>
        </div>

        {/* Row 2 — reverse */}
        <div className="marquee-row">
          <div className="marquee-row-inner marquee-reverse" style={{ animationDuration: '45s' }}>
            {clientRows.map((c: any, i: number) => (
              <span key={i} className="marquee-client-text">{c.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          RADIO — Kept as-is
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10">
        <RadioPlayer tracks={radioTracks} links={radioLinks} />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SHARE MUSIC CTA — Editorial serif over moody photo
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
            Share Your Music
          </h2>
          <p className="text-[clamp(18px,2.5vw,28px)] text-[#A3B5C4] mb-12 max-w-[600px] mx-auto leading-relaxed">
            I&apos;m always on the lookout for new music to play
          </p>
          <a href="/share-music" className="btn-sharp-white">
            Submit Your Track
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONTACT CTA — Editorial serif heading, sharp button
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 bg-[#0a0e17] text-white py-28 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h2 className="font-serif italic text-[clamp(42px,6vw,72px)] font-normal leading-tight mb-10 max-w-[500px]">
              Let&apos;s create something unforgettable
            </h2>
            <a href="/contact" className="btn-sharp-outline">
              Get In Touch
            </a>
          </div>
          <div className="relative overflow-hidden">
            <img
              src="/assets/ricky-portrait-new.jpg"
              alt="Late Night Ricky"
              className="w-full h-auto object-cover grayscale"
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
