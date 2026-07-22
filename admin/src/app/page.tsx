import Navbar from '../components/Navbar';
import ScrollReveal from '../components/ScrollReveal';
import AudioTrackList from '../components/AudioTrackList';
import ShareMusicCTA from '../components/ShareMusicCTA';
import HomeContactSection from '../components/HomeContactSection';
import LateNightMoments from '../components/LateNightMoments';
import PinProtectedDownload from '../components/PinProtectedDownload';
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
  { title: 'Late Night Ricky — Midnight in London', time: '0:30', src: null, cover: undefined, spotifyUrl: undefined, appleMusicUrl: undefined, youtubeUrl: undefined },
  { title: 'Late Night Ricky — Vegas Lights', time: '0:30', src: null, cover: undefined, spotifyUrl: undefined, appleMusicUrl: undefined, youtubeUrl: undefined },
  { title: 'Late Night Ricky — Ibiza Sunrise', time: '0:30', src: null, cover: undefined, spotifyUrl: undefined, appleMusicUrl: undefined, youtubeUrl: undefined },
  { title: 'Late Night Ricky — South Side', time: '0:30', src: null, cover: undefined, spotifyUrl: undefined, appleMusicUrl: undefined, youtubeUrl: undefined },
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
  let heroImage = '/assets/ricky-hero-studio.jpg';
  let heroLogo = '/assets/ricky-logo.png';
  let heroGrayscale = true;
  let heroBrownFilter = false;
  let heroGoldFilter = false;
  let heroTagline = 'Grammy Winning Producer | International DJ';
  let heroBackgroundSize = 'cover';
  let heroBackgroundPosition = '70% center';
  let radioImage = '/assets/ricky-music-jacket-sm.jpg';
  let radioHeadline = 'Music & Mixes';
  let radioLabel = 'Listen & Download';
  let radioDescription = 'Preview snippets of the latest releases. Click play to hear 30-second previews, then stream or download the full tracks on Spotify, Apple Music and YouTube.';
  let spotifyUrl = 'https://open.spotify.com/artist/3lOtUgicoyDn2qKe5zc3dl?si=M3MjTUy7TOmOhc676Dsgvw';
  let appleMusicUrl = 'https://music.apple.com/gb/artist/late-night-ricky/1759491226';
  let youtubeUrl = 'https://www.youtube.com/@LateNightRicky';
  let instagramUrl = 'https://instagram.com/latenightricky';
  let tiktokUrl = 'https://tiktok.com/@latenightricky';
  let twitterUrl = 'https://twitter.com/latenightricky';
  let facebookUrl = 'https://facebook.com/latenightricky';
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
  let aboutGrayscale = false;
  let aboutBrownFilter = false;
  let aboutGoldFilter = false;
  let aboutQuote = '"The best DJ I\'ve heard."';
  let aboutQuoteAttribution = 'Ronaldo';
  let aboutHeadingImage = '/assets/about-text-cream.png';
  let rickyTextImage = '/assets/ricky-text-cream.png';

  // CMS-driven data for new sections (hardcoded defaults as fallback)
  let momentsItems = [
    { id: 'misfits', title: 'Misfits Boxing', subtitle: 'Ministry of Sound, London', description: 'Headlining the biggest influencer boxing event in the UK.', images: ['/assets/highlight-studio.jpg', '/assets/highlight-arena.jpg', '/assets/moment-ibiza.jpg'] },
    { id: 'o2', title: 'O2 Arena', subtitle: 'The O2, London', description: 'Performing to a sold-out crowd at one of London\'s most iconic venues.', images: ['/assets/highlight-arena.jpg', '/assets/highlight-studio.jpg', '/assets/press-bg2.jpg'] },
    { id: 'ibiza', title: 'Ibiza Summer', subtitle: 'Ushuaïa, Ibiza', description: 'Summer residency at the world\'s most iconic open-air club.', images: ['/assets/moment-ibiza.jpg', '/assets/highlight-club.jpg', '/assets/highlight-misfits.jpg'] },
    { id: 'private', title: 'Private Events', subtitle: 'Worldwide', description: 'Exclusive performances for A-list celebrities and private gatherings across the globe.', images: ['/assets/press-bg2.jpg', '/assets/highlight-club.jpg', '/assets/highlight-studio.jpg'] },
    { id: 'backtoback', title: 'Back to Back', subtitle: 'Private Events, London', description: 'Intimate back-to-back sets with some of the biggest names in the industry.', images: ['/assets/highlight-club.jpg', '/assets/highlight-misfits.jpg', '/assets/press-bg2.jpg'] },
    { id: 'ibizarocks', title: 'Ibiza Rocks', subtitle: 'Ibiza Rocks, Ibiza', description: 'High-energy daytime pool parties at Ibiza Rocks.', images: ['/assets/highlight-misfits.jpg', '/assets/moment-ibiza.jpg', '/assets/highlight-arena.jpg'] },
  ];
  let momentsHeading = 'Late Night Moments';
  let momentsSubtext = "An insight to Ricky's world";
  const performersData = {
    heading: 'Has Performed With...',
    subtext: 'And many more...',
    row1Images: ['/assets/highlight-studio.jpg', '/assets/highlight-arena.jpg', '/assets/moment-ibiza.jpg', '/assets/press-bg2.jpg', '/assets/highlight-club.jpg', '/assets/highlight-misfits.jpg'],
    row2Images: ['/assets/highlight-misfits.jpg', '/assets/highlight-club.jpg', '/assets/press-bg2.jpg', '/assets/moment-ibiza.jpg', '/assets/highlight-arena.jpg', '/assets/highlight-studio.jpg'],
    headingImage: '/assets/ricky-text-cream.png',
    artistNames: [
      '50 Cent', 'Bruno Mars', 'Chris Brown', 'Dr. Dre \u0026 Jimmy Iovine', 'Drake',
      'Future', 'Jason Momoa', 'Jason Statham', 'Justin Bieber', 'Kendrick Lamar',
      'Leonardo DiCaprio', 'Lewis Hamilton', 'Mick Jagger', 'Neymar Jnr', 'Paul McCartney',
      'Rihanna', 'Ronaldo', 'Travis Scott', 'Usain Bolt', 'Vin Diesel',
    ] as string[],
  };
  const venuesData = {
    heading: 'Worldwide Performances',
    backgroundImage: '/assets/venues-bg.jpg',
    venues: ['LIV (Miami)', 'WALL (Miami)', 'TAPE (London)', 'HAKKASAN (Las Vegas)', 'MOVIDA (Dubai)', "JIMMY'Z (Monte Carlo)", 'MINISTRY OF SOUND (London)', '1 OAK (New York)', 'BYBLOS (Milan)', 'PACHA (Ibiza)', 'ARMANI (Dubai)', 'MANDALAY BAY (Las Vegas)', 'TEMPLE (San Francisco)', 'POPPY (Los Angeles)', 'CIRQUE LE SOIR (London)', 'HIGHLIGHT ROOM (Los Angeles)', "TEDDY'S @ ROOSEVELT (Los Angeles)", 'DELILAH (Los Angeles)', 'GIBSON (Frankfurt)', 'LIO (Ibiza)', 'STUDIO PARIS (Chicago)', 'PREMIER @ BORGATA (Atlantic City)', 'PARQ (San Diego)', 'BOOTSY BELLOWS (Los Angeles)', 'WARWICK (Los Angeles)', 'LAVO (New York)', 'TAO (New York)', 'UP & DOWN (New York)', 'LIBERTINE (London)', 'SCANDAL (London)', 'TOY ROOM (Dubai)', '1 OAK (Dubai)', 'TAO (Las Vegas)', 'BAOLI (Cannes)', 'SHOKO (Barcelona)', 'LASTA (Serbia)', 'REX ROOMS (London)', "HARRIET'S (Los Angeles)", 'VIP ROOM (St. Tropez)', 'BON BONNIERE (Mykonos)', 'DRAMA (London)', 'DEAR DARLING (London)', 'TRAMP (London)', 'SPIRITO (Brussels)', 'CUCKOO CLUB (London)', 'RAFFLES (London)', 'SUBOIS (Montreal)', 'P1 (Munich)', "ZELO'S (Monte Carlo)", 'WIRELESS FESTIVAL (UK)', 'READING & LEEDS FESTIVAL (UK)', 'USHAIA (Ibiza)', 'ABU DHABI GRAND PRIX', 'O2 ARENA (London)', 'FESTIVAL DE CANNES'],
  };

  const brandsData = {
    heading: 'Trusted by Global Brands',
    backgroundImage: '/assets/ricky-brands-gold.png',
    brandsGrayscale: false,
    brandsBrownFilter: false,
    brandsGoldFilter: false,
    logos: [
      { name: 'Cartier', src: '/assets/logo-cartier-trimmed.png' },
      { name: 'F1', src: '/assets/logo-f1-trimmed.png' },
      { name: 'Coca-Cola', src: '/assets/logo-coca-cola-trimmed.png' },
      { name: 'Ciroc', src: '/assets/logo-ciroc-trimmed.png' },
      { name: 'Dior', src: '/assets/logo-dior-trimmed.png' },
      { name: 'Patek Philippe', src: '/assets/logo-patek-trimmed.png' },
      { name: 'Prime', src: '/assets/logo-prime-trimmed.png' },
      { name: 'Louis Vuitton', src: '/assets/logo-louis-vuitton-trimmed.png' },
      { name: 'Misfits Boxing', src: '/assets/logo-mf-boxing-v2-trimmed.png' },
      { name: 'Festival de Cannes', src: '/assets/logo-cannes-trimmed.png' },
    ],
  };
  const footerData = {
    copyright: 'Late Night Ricky',
    poweredBy: 'Nuelo CoLab',
    poweredByUrl: 'https://nuelo.co',
    logo: '/assets/ricky-logo.png',
    links: [
      { text: 'Privacy', href: '/privacy' },
      { text: 'Terms', href: '/terms' },
    ],
  };

  // Performers visibility
  let performersVisible = true;

  // Showreel
  let showreelVisible = false;
  let showreelVideoSrc = '';
  let showreelPosterSrc = '';

  // Suppress unused-variable warnings for CMS values not yet fully used
  void clients; void pressPack;
  try {
    const [dbCards, dbNames, dbTracks, dbSections, dbAboutSections] = await Promise.all([
      getShowCards(), getClientNames(), getTracks(), getSiteSections('home'), getSiteSections('about'),
    ]);
    if (dbSections.length > 0) {
      const heroSection = dbSections.find((s: any) => s.section === 'hero');
      if (heroSection?.content) {
        const c = typeof heroSection.content === 'string' ? JSON.parse(heroSection.content) : heroSection.content;
        if (c.logo) heroLogo = c.logo;
        if (c.grayscale !== undefined) heroGrayscale = c.grayscale;
        if (c.brownFilter !== undefined) heroBrownFilter = c.brownFilter;
        if (c.goldFilter !== undefined) heroGoldFilter = c.goldFilter;
        if (c.tagline) heroTagline = c.tagline;
        if (c.image) heroImage = c.image;
        if (c.backgroundSize) heroBackgroundSize = c.backgroundSize;
        if (c.backgroundPosition) heroBackgroundPosition = c.backgroundPosition;
      }
      const radioSection = dbSections.find((s: any) => s.section === 'radio');
      if (radioSection?.content) {
        const c = typeof radioSection.content === 'string' ? JSON.parse(radioSection.content) : radioSection.content;
        if (c.headline) radioHeadline = c.headline;
        if (c.description) radioDescription = c.description;
        if (c.label) radioLabel = c.label;
        if (c.spotifyUrl) spotifyUrl = c.spotifyUrl;
        if (c.appleMusicUrl) appleMusicUrl = c.appleMusicUrl;
        if (c.youtubeUrl) youtubeUrl = c.youtubeUrl;
        if (c.image) radioImage = c.image;
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
          if (c.aboutGrayscale !== undefined) aboutGrayscale = c.aboutGrayscale;
          if (c.aboutBrownFilter !== undefined) aboutBrownFilter = c.aboutBrownFilter;
          if (c.aboutGoldFilter !== undefined) aboutGoldFilter = c.aboutGoldFilter;
          if (c.quote) aboutQuote = c.quote;
          if (c.quoteAttribution) aboutQuoteAttribution = c.quoteAttribution;
          if (c.aboutHeadingImage) aboutHeadingImage = c.aboutHeadingImage;
          if (c.rickyTextImage) rickyTextImage = c.rickyTextImage;
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

      // New CMS-driven sections
      const momentsSection = dbSections.find((s: any) => s.section === 'moments');
      if (momentsSection?.content) {
        const c = typeof momentsSection.content === 'string' ? JSON.parse(momentsSection.content) : momentsSection.content;
        if (c.heading) momentsHeading = c.heading;
        if (c.subtext) momentsSubtext = c.subtext;
        if (c.items && Array.isArray(c.items)) {
          momentsItems = c.items.map((item: any) => ({
            id: item.id || String(Math.random()),
            title: item.title || '',
            subtitle: item.subtitle || '',
            description: item.description || '',
            images: item.images || [],
            video: item.video || undefined,
          }));
        }
      }

      const performersSection = dbSections.find((s: any) => s.section === 'performers');
      if (performersSection) {
        performersVisible = performersSection.isVisible !== false;
        if (performersSection.content) {
          const c = typeof performersSection.content === 'string' ? JSON.parse(performersSection.content) : performersSection.content;
          if (c.heading) performersData.heading = c.heading;
          if (c.subtext) performersData.subtext = c.subtext;
          if (c.row1Images) performersData.row1Images = c.row1Images;
          if (c.row2Images) performersData.row2Images = c.row2Images;
          if (c.headingImage) performersData.headingImage = c.headingImage;
          // Only override hardcoded defaults if CMS has a non-empty array
          if (c.artistNames && Array.isArray(c.artistNames) && c.artistNames.length > 0) {
            performersData.artistNames = c.artistNames;
          }
        }
      }

      const venuesSection = dbSections.find((s: any) => s.section === 'venues');
      if (venuesSection?.content) {
        const c = typeof venuesSection.content === 'string' ? JSON.parse(venuesSection.content) : venuesSection.content;
        if (c.heading) venuesData.heading = c.heading;
        if (c.backgroundImage) venuesData.backgroundImage = c.backgroundImage;
        if (c.venues && Array.isArray(c.venues)) venuesData.venues = c.venues;
      }

      const brandsSection = dbSections.find((s: any) => s.section === 'brands');
      if (brandsSection?.content) {
        const c = typeof brandsSection.content === 'string' ? JSON.parse(brandsSection.content) : brandsSection.content;
        if (c.heading) brandsData.heading = c.heading;
        if (c.backgroundImage) brandsData.backgroundImage = c.backgroundImage;
        if (c.brandsGrayscale !== undefined) brandsData.brandsGrayscale = c.brandsGrayscale;
        if (c.brandsBrownFilter !== undefined) brandsData.brandsBrownFilter = c.brandsBrownFilter;
        if (c.brandsGoldFilter !== undefined) brandsData.brandsGoldFilter = c.brandsGoldFilter;
        if (c.logos && Array.isArray(c.logos)) brandsData.logos = c.logos;
      }

      const footerSection = dbSections.find((s: any) => s.section === 'footer');
      if (footerSection?.content) {
        const c = typeof footerSection.content === 'string' ? JSON.parse(footerSection.content) : footerSection.content;
        if (c.copyright) footerData.copyright = c.copyright;
        if (c.poweredBy) footerData.poweredBy = c.poweredBy;
        if (c.poweredByUrl) footerData.poweredByUrl = c.poweredByUrl;
        if (c.logo) footerData.logo = c.logo;
        if (c.links) {
          footerData.links = c.links.filter((l: any) => l.text !== 'Admin Login');
        }
      }

      // Social links from home/contact_section
      const contactSectionData = dbSections.find((s: any) => s.section === 'contact_section');
      if (contactSectionData?.content) {
        const c = typeof contactSectionData.content === 'string' ? JSON.parse(contactSectionData.content) : contactSectionData.content;
        if (c.instagramUrl) instagramUrl = c.instagramUrl;
        if (c.youtubeUrl) youtubeUrl = c.youtubeUrl;
        if (c.spotifyUrl) spotifyUrl = c.spotifyUrl;
        if (c.appleMusicUrl) appleMusicUrl = c.appleMusicUrl;
        if (c.tiktokUrl) tiktokUrl = c.tiktokUrl;
        if (c.twitterUrl) twitterUrl = c.twitterUrl;
        if (c.facebookUrl) facebookUrl = c.facebookUrl;
      }

      // Video / Showreel
      const videoSection = dbSections.find((s: any) => s.section === 'video');
      if (videoSection) {
        showreelVisible = videoSection.isVisible !== false;
        if (videoSection.content) {
          const c = typeof videoSection.content === 'string' ? JSON.parse(videoSection.content) : videoSection.content;
          if (c.src) showreelVideoSrc = c.src;
          if (c.poster) showreelPosterSrc = c.poster;
        }
        if (videoSection.videos) {
          try {
            const vids = typeof videoSection.videos === 'string' ? JSON.parse(videoSection.videos) : videoSection.videos;
            if (Array.isArray(vids) && vids.length > 0 && vids[0]) {
              showreelVideoSrc = vids[0];
            }
          } catch { /* ignore */ }
        }
      }
    }
    if (dbTracks.length > 0) {
      tracks = dbTracks.map((t: any) => ({
        title: t.title,
        time: t.duration || '0:30',
        src: t.filePath,
        cover: t.coverPath || undefined,
        spotifyUrl: t.spotifyUrl || undefined,
        appleMusicUrl: t.appleMusicUrl || undefined,
        youtubeUrl: t.youtubeUrl || undefined,
      }));
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
        <img
          src={heroImage}
          alt="Late Night Ricky"
          className="fixed inset-0 -z-10 w-full h-full object-cover lnr-hero-img"
          style={{ objectPosition: heroBackgroundPosition, filter: [
            heroGrayscale && 'grayscale(100%)',
            heroBrownFilter && 'sepia(60%) brightness(90%)',
            heroGoldFilter && 'sepia(30%) brightness(95%) saturate(150%) hue-rotate(10deg)',
          ].filter(Boolean).join(' ') || 'none' }}
        />
        {/* Logo + subtitle — desktop: left side, ~40% width, at waist level; mobile: centered above head */}
        <div className="absolute z-10 flex flex-col items-center md:items-start justify-center md:justify-start top-[16%] md:top-auto md:mt-[30vh] left-1/2 -translate-x-1/2 md:left-[15%] md:translate-x-0 md:w-auto md:max-w-[45%]">
          <img src={heroLogo} alt="Late Night Ricky" className="w-[80%] md:w-full max-w-[500px] min-w-[220px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
          <p className="mt-3 whitespace-nowrap text-[10px] md:text-[clamp(11px,1.2vw,14px)] font-bold tracking-[0.15em] md:tracking-[0.2em] uppercase text-[#e8d4b8] md:text-[#c9a96e] drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
             style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {heroTagline}
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white opacity-70">
          <span className="text-[11px] tracking-[2.5px] uppercase font-medium">Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </div>
      </section>

      {/* Showreel — only renders when visible AND has a CMS video */}
      {showreelVisible && showreelVideoSrc && (
        <section className="relative w-full bg-black">
          <video
            src={showreelVideoSrc}
            poster={showreelPosterSrc || undefined}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto"
          />
        </section>
      )}

      {/* ═══ ABOUT RICKY — dark leather texture, image blends into page ═══ */}
      <section id="about" className="relative min-h-[100dvh] overflow-hidden">
        {/* Full-width orange studio background image, shifted to leather brown tone */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/about-ricky-v2.jpg')" }}
        />
        {/* Faint warm overlay to soften the photo and blend into background */}
        <div className="absolute inset-0 bg-[#2a1a0a]/20" />
        {/* Dark gradient overlay on left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        {/* Bottom fade for smooth transition to next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#2a1a0a] to-transparent" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-14 py-20 min-h-[100dvh] flex flex-col justify-center">
          {/* Ronaldo Quote — top center */}
          <div className="mb-10 md:mb-14 reveal-left text-center">
            <p className="text-[24px] md:text-[clamp(32px,5vw,56px)] font-black uppercase tracking-[-1px] leading-[1.1] text-[#e8d4b8] max-w-[1000px] mx-auto" style={{ fontFamily: "'Oswald', sans-serif", textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
              {aboutQuote}
            </p>
            <p className="mt-4 text-[14px] md:text-[18px] font-semibold tracking-[0.3em] uppercase text-[#c4b498]/80" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}>
              — {aboutQuoteAttribution}
            </p>
          </div>

          {/* Left-aligned content — text only, no photo column */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div className="reveal-left" data-delay="100">
              <div className="flex items-center gap-0 mb-8">
                <div className="reveal-left" data-delay="100">
                  <img
                    src={aboutHeadingImage}
                    alt="About"
                    className="h-[clamp(36px,5.5vw,64px)] w-auto object-contain"
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
                  />
                </div>
                <div className="reveal-right" data-delay="300">
                  <img
                    src={rickyTextImage}
                    alt="Ricky"
                    className="h-[clamp(48px,7vw,84px)] w-auto object-contain -ml-1 md:-ml-2"
                    style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
                  />
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-[13px] md:text-[15px] leading-[1.7] tracking-[0.02em] text-[#e8d4b8]/95" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                  {aboutBio1}
                </p>
                <p className="text-[13px] md:text-[15px] leading-[1.7] tracking-[0.02em] text-[#e8d4b8]/95" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                  {aboutBio2}
                </p>
                <p className="text-[13px] md:text-[15px] leading-[1.7] tracking-[0.02em] text-[#e8d4b8]/95" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                  {aboutBio3}
                </p>
                <p className="text-[13px] md:text-[15px] leading-[1.7] tracking-[0.02em] text-[#e8d4b8]/95" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                  {aboutBio4}
                </p>
              </div>
              {/* Press Pack button */}
              <div className="mt-8 flex justify-center md:justify-start">
                <PinProtectedDownload />
              </div>
            </div>

            {/* Right column — empty, image handles the visual */}
            <div className="hidden md:block" />
          </div>
        </div>
      </section>

      <LateNightMoments items={momentsItems} shows={shows} heading={momentsHeading} subtext={momentsSubtext} />

      {/* ═══ ACTS ARTISTS & VENUES — brown background, carousel, locations PRIVATE CLIENTS ═══ */}
      {performersVisible && (
      <section id="artists" className="relative py-10 md:py-28 px-6 md:px-14 overflow-hidden">
        {/* Dark leather background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7a5c3a] via-[#5c4328] to-[#4a3520]" />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")', backgroundSize: '256px 256px' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#b89a6e]/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,170,130,0.25)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(40,25,10,0.3)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-[1400px] mx-auto">
          {/* Title — animated from both sides */}
          <h2 className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-[clamp(18px,3vw,36px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] text-center mb-6 md:mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>
            <div className="reveal-left" data-delay="100">
              <img
                src={performersData.headingImage}
                alt="Ricky"
                className="h-[clamp(52px,10vw,72px)] md:h-[clamp(28px,6vw,72px)] w-auto object-contain"
              />
            </div>
            <span className="reveal-right" data-delay="300">
              {performersData.heading}
            </span>
          </h2>

          {/* Artist names — small text list */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-10 md:mb-8 reveal-fade">
            {performersData.artistNames.map((name: string, i: number) => (
              <span key={i} className="text-[11px] md:text-[13px] tracking-[0.12em] uppercase text-[#e8d4b8]/80 font-semibold">
                {name}
                {i < performersData.artistNames.length - 1 && <span className="ml-2 md:ml-3 text-[#c4b498]/40">·</span>}
              </span>
            ))}
          </div>

          {/* Carousel 1 */}
          <div className="relative overflow-hidden mb-6">
            <div
              className="flex gap-4"
              style={{
                animation: `marquee-left ${Math.max(18, performersData.row1Images.length * 3)}s linear infinite`,
                width: 'max-content',
              }}
            >
              {/* Triple the images so the track is always wider than the viewport */}
              {[...performersData.row1Images, ...performersData.row1Images, ...performersData.row1Images].map((img: string, i: number) => (
                <div key={i} className="flex-shrink-0 w-[260px] md:w-[340px] aspect-square overflow-hidden">
                  <img src={img} alt={`Artist ${(i % performersData.row1Images.length) + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel 2 — opposite direction */}
          <div className="relative overflow-hidden mb-16">
            <div
              className="flex gap-4"
              style={{
                animation: `marquee-right ${Math.max(18, performersData.row2Images.length * 3)}s linear infinite`,
                width: 'max-content',
              }}
            >
              {[...performersData.row2Images, ...performersData.row2Images, ...performersData.row2Images].map((img: string, i: number) => (
                <div key={i} className="flex-shrink-0 w-[260px] md:w-[340px] aspect-square overflow-hidden">
                  <img src={img} alt={`Artist ${(i % performersData.row2Images.length) + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#c4b498]/50 font-medium text-center mb-16">
            {performersData.subtext}
          </p>

          {/* Locations text */}
        </div>
      </section>
      )}

      
      {/* ═══ WORLDWIDE PERFORMANCES ═══ */}
      <section id="venues" className="relative py-20 md:py-28 px-6 md:px-14 overflow-hidden">
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="relative text-center reveal-fade border-t border-[#c4b498]/20 pt-12 pb-16 md:pb-10 rounded-xl overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <img src={venuesData.backgroundImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#2a1a0a]/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#5c4328]/40 via-transparent to-[#2a1a0a]/70" />
            </div>
            <h2 className="relative z-10 text-[clamp(28px,3.5vw,48px)] font-black uppercase tracking-[-1px] leading-[0.95] text-[#e8d4b8] text-center mb-12">
              {venuesData.heading}
            </h2>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-0.5 md:gap-y-1 max-w-[800px] mx-auto px-4 md:px-8 justify-items-center">
              <div className="space-y-0.5 md:space-y-1">
                {venuesData.venues.filter((_: string, i: number) => i % 2 === 0).map((venue: string, i: number) => (
                  <p key={i} className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">{venue}</p>
                ))}
              </div>
              <div className="space-y-0.5 md:space-y-1">
                {venuesData.venues.filter((_: string, i: number) => i % 2 !== 0).map((venue: string, i: number) => (
                  <p key={i} className="text-[10px] md:text-[13px] text-[#d4c4a8]/80 text-center">{venue}</p>
                ))}
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
              <span className="garrix-label-tag">{radioLabel}</span>
              <h2 className="garrix-heading">{radioHeadline}</h2>
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
        <ShareMusicCTA headline={shareMusicHeadline} description={shareMusicDescription} />
      </section>

      {/* ═══ TRUSTED BY GLOBAL BRANDS — hero-style with photo background ═══ */}
      <section id="brands" className="relative min-h-[80dvh] md:min-h-[100dvh] overflow-hidden">
        {/* Full background image — warm golden studio shot */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat lnr-brands-bg"
          style={{
            backgroundImage: `url('${brandsData.backgroundImage}')`,
            filter: brandsData.brandsGrayscale ? 'grayscale(100%)' : brandsData.brandsBrownFilter ? 'sepia(60%) brightness(0.85)' : brandsData.brandsGoldFilter ? 'sepia(30%) saturate(1.4) hue-rotate(10deg) brightness(0.9)' : undefined,
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
            {brandsData.heading}
          </h2>

          {/* Brand logos — cream colored like About section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8 max-w-[700px] pl-4 md:pl-12 reveal-stagger">
            {brandsData.logos.map((logo: { name: string; src: string }, i: number) => (
              <div key={i} className="flex items-center justify-center w-28 h-12 md:w-36 md:h-14">
                <img
                  src={logo.src}
                  alt={logo.name}
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
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="Spotify">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.78.42-1.2.24-3.24-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.18.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46v-7.15a8.16 8.16 0 005.58 2.18V11.2a4.85 4.85 0 01-3.77-1.58V6.69h3.77z"/></svg>
              </a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="X / Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={appleMusicUrl} target="_blank" rel="noopener noreferrer" className="garrix-footer-social-square" aria-label="Apple Music">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0019.7.264 9.17 9.17 0 0017.55.02C16.86.006 16.167 0 15.478 0H8.522c-.69 0-1.382.006-2.072.022a9.17 9.17 0 00-2.15.244A5.022 5.022 0 002.426.891C1.31 1.624.564 2.624.248 3.934a9.23 9.23 0 00-.24 2.19C-.006 6.814 0 7.506 0 8.194v7.612c0 .688-.006 1.38.008 2.07a9.23 9.23 0 00.24 2.19c.316 1.31 1.062 2.31 2.18 3.043a5.022 5.022 0 001.874.726 9.17 9.17 0 002.15.244c.69.016 1.382.022 2.072.022h6.956c.69 0 1.382-.006 2.072-.022a9.17 9.17 0 002.15-.244 5.022 5.022 0 001.874-.726c1.118-.734 1.863-1.734 2.18-3.043a9.23 9.23 0 00.24-2.19c.014-.69.008-1.382.008-2.07V8.194c0-.688.006-1.38-.008-2.07zM16.6 16.8c-1.8.9-3.6.7-5.4.2-1.7-.5-3.3-1.3-4.8-2.2-.7-.4-1.3-.9-1.8-1.5-.4-.5-.4-1 0-1.5.3-.4.8-.5 1.3-.2.3.2.6.4.9.6 1.4 1 2.9 1.8 4.5 2.3 1.2.4 2.4.5 3.7.3.5-.1 1-.3 1.4-.6.6-.4.7-1 .2-1.5-.3-.3-.7-.5-1.1-.6-.8-.3-1.7-.5-2.5-.7-1.1-.3-2.2-.6-3.2-1.1-.8-.4-1.5-.9-2-1.6-.6-.9-.6-1.9 0-2.8.5-.7 1.2-1.1 2-1.4 1.3-.4 2.6-.5 3.9-.3 1.2.2 2.3.6 3.3 1.3.4.3.7.6.9 1 .3.6.1 1.2-.5 1.5-.4.2-.8.2-1.2 0-.8-.4-1.6-.8-2.5-1.1-1-.3-2-.4-3-.2-.5.1-.9.3-1.2.7-.3.4-.3.8 0 1.1.3.3.6.5 1 .7 1.1.4 2.2.7 3.3 1 1.1.3 2.2.7 3.2 1.2.7.4 1.3.9 1.7 1.6.7 1.2.5 2.5-.5 3.5z"/></svg>
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="garrix-footer-bottom">
            <div className="garrix-footer-logo">
              <img src={footerData.logo} alt="LNR" className="h-8 md:h-6 opacity-40 max-w-[180px] w-auto" style={{ filter: 'brightness(0) invert(1) sepia(0.4) saturate(0.3) hue-rotate(350deg) brightness(0.75)' }} />
            </div>
            <p>&copy; {new Date().getFullYear()} {footerData.copyright}. All rights reserved.</p>
            <div className="garrix-footer-links">
              {footerData.links.map((link: { text: string; href: string }, i: number) => (
                <a key={i} href={link.href}>{link.text}</a>
              ))}
            </div>
          </div>
          <div className="garrix-footer-powered">
            Powered by <a href={footerData.poweredByUrl} target="_blank" rel="noopener noreferrer">{footerData.poweredBy}</a>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}