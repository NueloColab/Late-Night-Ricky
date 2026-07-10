import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { count, eq } from 'drizzle-orm';
import { showCards, partnerLogos, clientNames, venueTicker, siteSections } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let force = false;
  try {
    const body = await request.json();
    force = body.force === true;
  } catch {
    // no body, default false
  }

  let seeded = 0;
  const errors: string[] = [];

  // Helper: only seed if table is empty (or force=true)
  async function safeSeed(
    label: string,
    table: any,
    data: any[],
    checkEmpty = true
  ) {
    try {
      if (checkEmpty && !force) {
        const existing = await db.select({ count: count() }).from(table);
        if (existing[0]?.count > 0) {
          return;
        }
      }
      if (!force) {
        // Insert only if table is empty
        for (const item of data) {
          await db.insert(table).values(item);
          seeded++;
        }
      } else {
        // Force mode: delete then insert
        await db.delete(table);
        for (const item of data) {
          await db.insert(table).values(item);
          seeded++;
        }
      }
    } catch (err: any) {
      errors.push(`${label}: ${err.message || String(err)}`);
    }
  }

  // --- SHOW CARDS ---
  await safeSeed('Show Cards', showCards, [
    { title: 'Sidemen vs YouTube All Stars', venue: 'Ministry of Sound', location: 'London', season: 'Spring / Summer 2025', description: "One of London's most iconic venues, packed to capacity.", href: '/show-sidemen', imagePath: '/assets/ricky-hero-new.jpg', order: 0, isActive: true },
    { title: 'Gin \u0026 Juice Launch', venue: 'Ibiza Rocks', location: 'Ibiza', season: 'Spring / Summer 2024', description: 'Sunset sets and poolside energy in the White Isle.', href: '/show-gin-juice', imagePath: '/assets/ricky-radio-new.jpg', order: 1, isActive: true },
    { title: 'Abu Dhabi Grand Prix', venue: 'Skyline Festival', location: 'International', season: 'Autumn / Winter 2024', description: 'Major festival appearance under the desert stars.', href: '/show-abu-dhabi', imagePath: '/assets/press-bg2.jpg', order: 2, isActive: true },
    { title: 'Royal Wedding of the Year', venue: 'Private Events', location: 'Worldwide', season: 'Spring / Summer 2023', description: 'Exclusive corporate events and private celebrations.', href: '/show-royal-wedding', imagePath: '/assets/ricky-fricktion.jpg', order: 3, isActive: true },
  ]);

  // --- PARTNER LOGOS ---
  await safeSeed('Partner Logos', partnerLogos, [
    { name: 'Formula 1', imagePath: '/assets/logo-f1.png', order: 0, isActive: true },
    { name: 'Coca-Cola', imagePath: '/assets/logo-coca-cola.png', order: 1, isActive: true },
    { name: 'Dior', imagePath: '/assets/logo-dior.png', order: 2, isActive: true },
    { name: 'Patek Philippe', imagePath: '/assets/logo-patek.png', order: 3, isActive: true },
    { name: 'Cîroc', imagePath: '/assets/logo-ciroc.png', order: 4, isActive: true },
    { name: 'Louis Vuitton', imagePath: '/assets/logo-louis-vuitton.png', order: 5, isActive: true },
    { name: 'Prime', imagePath: '/assets/logo-prime.png', order: 6, isActive: true },
    { name: 'MF Boxing', imagePath: '/assets/logo-prime-boxing.png', order: 7, isActive: true },
    { name: 'Festival de Cannes', imagePath: '/assets/logo-cannes.png', order: 8, isActive: true },
    { name: 'Cartier', imagePath: '/assets/logo-cartier.png', order: 9, isActive: true },
  ]);

  // --- CLIENT NAMES ---
  await safeSeed('Client Names', clientNames, [
    { name: '50 Cent', order: 0, isActive: true },
    { name: 'Bruno Mars', order: 1, isActive: true },
    { name: 'Chris Brown', order: 2, isActive: true },
    { name: 'Dr. Dre \u0026 Jimmy Iovine', order: 3, isActive: true },
    { name: 'Drake', order: 4, isActive: true },
    { name: 'Future', order: 5, isActive: true },
    { name: 'Jason Momoa', order: 6, isActive: true },
    { name: 'Jason Statham', order: 7, isActive: true },
    { name: 'Justin Bieber', order: 8, isActive: true },
    { name: 'Kendrick Lamar', order: 9, isActive: true },
    { name: 'Leonardo DiCaprio', order: 10, isActive: true },
    { name: 'Lewis Hamilton', order: 11, isActive: true },
    { name: 'Mick Jagger', order: 12, isActive: true },
    { name: 'Neymar Jnr', order: 13, isActive: true },
    { name: 'Paul McCartney', order: 14, isActive: true },
    { name: 'Rihanna', order: 15, isActive: true },
    { name: 'Ronaldo', order: 16, isActive: true },
    { name: 'Travis Scott', order: 17, isActive: true },
    { name: 'Usain Bolt', order: 18, isActive: true },
    { name: 'Vin Diesel', order: 19, isActive: true },
  ]);

  // --- VENUE TICKER ---
  try {
    const existing = await db.select({ count: count() }).from(venueTicker);
    if (existing[0]?.count === 0 || force) {
      if (force) await db.delete(venueTicker);
      await db.insert(venueTicker).values({
        venues: ['LIV Miami', 'WALL Miami', 'TAPE London', 'HAKKASAN Las Vegas', 'MOVIDA Dubai', "JIMMY'Z Monte Carlo", 'MINISTRY OF SOUND London', '1 OAK New York', 'BYBLOS Milan', 'PACHA Ibiza', 'ARMANI Dubai', 'MANDALAY BAY Las Vegas', 'TEMPLE San Francisco', 'POPPY Los Angeles', 'CIRQUE LE SOIR London', 'HIGHLIGHT ROOM Los Angeles', "TEDDY'S @ ROOSEVELT Los Angeles", 'DELILAH Los Angeles', 'GIBSON Frankfurt', 'LIO Ibiza', 'STUDIO PARIS Chicago', 'PREMIER @ BORGATE Atlantic City', 'PARQ San Diego', 'BOOTSY BELLOWS Los Angeles', 'WARWICK Los Angeles', 'LAVO New York', 'TAO New York', 'UP \u0026 DOWN New York', 'LIBERTINE London', 'SCANDAL London', 'TOY ROOM Dubai', '1 OAK Dubai', 'TAO Las Vegas', 'BAOLI Cannes', 'SHOKO Barcelona', 'LASTA Serbia', 'REX ROOMS London', "HARRIET'S Los Angeles", 'VIP ROOM St. Tropez', 'BON BONNIERE Mykonos', 'DRAMA London', 'DEAR DARLING London', 'TRAMP London', 'SPIRITO Brussels', 'CUCKOO CLUB London', 'RAFFLES London', 'SUBOIS Montreal', 'P1 Munich', "ZELO'S Monte Carlo", 'WIRELESS FESTIVAL UK', 'READING \u0026 LEEDS FESTIVAL UK'],
      });
      seeded++;
    }
  } catch (err: any) {
    errors.push(`Venue Ticker: ${err.message || String(err)}`);
  }

  // --- SITE SECTIONS ---
  try {
    const existing = await db.select({ count: count() }).from(siteSections);
    if (existing[0]?.count === 0 || force) {
      if (force) await db.delete(siteSections);
      const sections = [
        { page: 'home', section: 'hero', order: 0, content: { title: 'Late Night Ricky', subtitle: 'International DJ \u0026 Grammy Winning Producer', image: '/assets/ricky-hero-v2.jpg', logo: '/assets/ricky-logo.png', overlay: true, grayscale: true, backgroundSize: 'cover', backgroundPosition: '70% center', backgroundColor: '#c8cdd2' }, isActive: true },
        { page: 'home', section: 'video', order: 1, content: { poster: '/assets/video-poster-desktop.jpg', src: '/assets/video-desktop.mp4' }, isActive: true },
        { page: 'home', section: 'reach', order: 2, content: { headline: 'International DJ \u0026 Grammy Winning Producer. From London to New York / LA to Las Vegas / Miami to Ibiza and beyond.', subtext: '150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.', grammyBadge: '/assets/grammy-gold-v2.png?v=2' }, isActive: true },
        { page: 'home', section: 'shows', order: 3, content: { title: 'Recent Shows \u0026 Stories' }, isActive: true },
        { page: 'home', section: 'partners', order: 4, content: { quote: 'The best DJ I\'ve heard.', attribution: 'Cristiano Ronaldo', description: 'Trusted by A-list artists, global brands, and sold-out crowds worldwide.', pressPack: '/assets/press-pack.pdf' }, isActive: true },
        { page: 'home', section: 'radio', order: 5, content: { label: 'Music \u0026 Radio', headline: 'As Heard On', description: 'Preview snippets of the latest releases. Click play to hear 30-second previews, then stream or download the full tracks on Spotify, Apple Music and YouTube.', image: '/assets/ricky-radio-new.jpg', spotifyUrl: 'https://open.spotify.com/artist/3lOtUgicoyDn2qKe5zc3dl', appleMusicUrl: 'https://music.apple.com/gb/artist/late-night-ricky/1759491226', youtubeUrl: 'https://www.youtube.com/@LateNightRicky' }, isActive: true },
        { page: 'home', section: 'clients', order: 6, content: { title: 'Trusted By The Best' }, isActive: true },
        { page: 'home', section: 'share_music', order: 7, content: { headline: 'Share Your Music', description: 'I\'m always on the lookout for new music to play, so send me your tracks' }, isActive: true },
        { page: 'home', section: 'reach_out', order: 8, content: { image: '/assets/ricky-hero-new.jpg', headline: "Let's collaborate", signature: 'Late Night Ricky', cta: 'Get in touch' }, isActive: true },
        { page: 'home', section: 'contact', order: 9, content: { bookingEmail: 'samir@wearemediahive.com', instagram: '@latenightricky' }, isActive: true },
        { page: 'home', section: 'performers', order: 10, content: { heading: 'Has Performed With...', subtext: 'And many more...', headingImage: '/assets/ricky-text-cream.png', artistNames: ['50 Cent','Bruno Mars','Chris Brown','Dr. Dre \u0026 Jimmy Iovine','Drake','Future','Jason Momoa','Jason Statham','Justin Bieber','Kendrick Lamar','Leonardo DiCaprio','Lewis Hamilton','Mick Jagger','Neymar Jnr','Paul McCartney','Rihanna','Ronaldo','Travis Scott','Usain Bolt','Vin Diesel'] }, isActive: true },
        { page: 'about', section: 'intro', order: 0, content: { headline: 'International DJ \u0026 Grammy Winning Producer', bio1: "Late Night Ricky (Previously DJ Fricktion) is an Award-Winning DJ, Grammy Award Winner and Platinum Certified Music Producer based in London. From teaching music in prison programs to performing at some of the world's most exclusive celebrity events, Ricky's rich and diverse music career has led him to become one of the most popular and trusted faces in London's thriving music scene.", bio2: "As a producer, Ricky cites his key influences as Michael Jackson, Dr. Dre, Quincy Jones, and Timbaland, merging soulful R\u0026B, House and cinematic grooves. Having earned Grammy recognition for his work with Chris Brown on the 11:11 album, plus previous cuts with Kendrick Lamar and NAV, Ricky has now stepped into a creative chapter with a new wave of releases scheduled for release.", bio3: "Ricky has embraced his British and South Asian Roots working with some legendary South Asian talent such as DIVINE and rising British R\u0026B star H33RA as well as showcasing Punjabi artists such as Diljit Dosanjh, Karan Aujla and Sidhu Moosewala to mainstream audiences.", bio4: "With many unreleased tracks in the works, plans to further expand his brand and collaborations with other artists, there is a lot more to come this year.", image: '/assets/ricky-portrait-new.jpg' }, isActive: true },
      ];
      for (const s of sections) {
        await db.insert(siteSections).values(s);
        seeded++;
      }
    } else {
      // Ensure performers section exists in existing databases
      const performersExisting = await db.select().from(siteSections).where(eq(siteSections.section, 'performers'));
      if (performersExisting.length === 0) {
        await db.insert(siteSections).values({
          page: 'home',
          section: 'performers',
          order: 10,
          content: {
            heading: 'Has Performed With...',
            subtext: 'And many more...',
            headingImage: '/assets/ricky-text-cream.png',
            artistNames: ['50 Cent','Bruno Mars','Chris Brown','Dr. Dre \u0026 Jimmy Iovine','Drake','Future','Jason Momoa','Jason Statham','Justin Bieber','Kendrick Lamar','Leonardo DiCaprio','Lewis Hamilton','Mick Jagger','Neymar Jnr','Paul McCartney','Rihanna','Ronaldo','Travis Scott','Usain Bolt','Vin Diesel']
          },
          isActive: true,
        });
        seeded++;
      }
    }
  } catch (err: any) {
    errors.push(`Site Sections: ${err.message || String(err)}`);
  }

  // Try to seed carousel images
  try {
    const { carouselImages } = await import('@/lib/db/schema');
    const existing = await db.select({ count: count() }).from(carouselImages);
    if (existing[0]?.count === 0 || force) {
      if (force) await db.delete(carouselImages);
      const defaultCarousel = [
        { imagePath: '/assets/carousel-1.jpg', alt: 'Arena DJ', order: 0, page: 'home', isActive: true },
        { imagePath: '/assets/carousel-2.jpg', alt: 'Club shot with 50 Cent', order: 1, page: 'home', isActive: true },
        { imagePath: '/assets/carousel-3.jpg', alt: 'Red-lit arena', order: 2, page: 'home', isActive: true },
        { imagePath: '/assets/ricky-hero-new.jpg', alt: 'Ricky portrait', order: 3, page: 'home', isActive: true },
        { imagePath: '/assets/ricky-radio-new.jpg', alt: 'Ricky radio', order: 4, page: 'home', isActive: true },
        { imagePath: '/assets/press-bg2.jpg', alt: 'Press', order: 5, page: 'home', isActive: true },
        { imagePath: '/assets/ricky-fricktion.jpg', alt: 'Fricktion', order: 6, page: 'home', isActive: true },
      ];
      for (const c of defaultCarousel) {
        await db.insert(carouselImages).values(c);
        seeded++;
      }
    }
  } catch {
    // Carousel table may not exist yet
  }

  // Try to seed tracks if table exists, but don't fail if it doesn't
  try {
    const { tracks } = await import('@/lib/db/schema');
    const existing = await db.select({ count: count() }).from(tracks);
    if (existing[0]?.count === 0 || force) {
      if (force) await db.delete(tracks);
      const defaultTracks = [
        { title: 'Late Night Ricky — Midnight in London', duration: '0:30', filePath: '/assets/snippet-1.mp3', order: 0, isActive: true },
        { title: 'Late Night Ricky — Vegas Lights', duration: '0:30', filePath: '/assets/snippet-2.mp3', order: 1, isActive: true },
        { title: 'Late Night Ricky — Ibiza Sunrise', duration: '0:30', filePath: '/assets/snippet-3.mp3', order: 2, isActive: true },
        { title: 'Late Night Ricky — South Side', duration: '0:30', filePath: '/assets/snippet-4.mp3', order: 3, isActive: true },
        { title: 'Late Night Ricky — After Hours', duration: '0:30', filePath: '/assets/snippet-5.mp3', order: 4, isActive: true },
      ];
      for (const t of defaultTracks) {
        await db.insert(tracks).values(t);
        seeded++;
      }
    }
  } catch {
    // Tracks table may not exist yet — skip silently
  }

  if (errors.length > 0) {
    return NextResponse.json({ success: true, seeded, warnings: errors });
  }

  return NextResponse.json({ success: true, seeded, message: `Seeded ${seeded} items` });
}
