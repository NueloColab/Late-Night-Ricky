/**
 * populate-cms.ts
 * Seeds the CMS database with the current hardcoded content from the public pages.
 * Run with: npx tsx scripts/populate-cms.ts
 */
import { db } from '../src/lib/db';
import { showCards, partnerLogos, clientNames, venueTicker, siteSections, tracks } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🌱 Populating CMS from frontend content...\n');

  // --- SHOW CARDS ---
  console.log('Inserting show cards...');
  const shows = [
    { title: 'Sidemen vs YouTube All Stars', venue: 'Ministry of Sound', location: 'London', season: 'Spring / Summer 2025', description: "One of London's most iconic venues, packed to capacity.", href: '/show-sidemen', imagePath: '/assets/ricky-hero-new.jpg', order: 0, isActive: true },
    { title: 'Gin & Juice Launch', venue: 'Ibiza Rocks', location: 'Ibiza', season: 'Spring / Summer 2024', description: 'Sunset sets and poolside energy in the White Isle.', href: '/show-gin-juice', imagePath: '/assets/ricky-radio-new.jpg', order: 1, isActive: true },
    { title: 'Abu Dhabi Grand Prix', venue: 'Skyline Festival', location: 'International', season: 'Autumn / Winter 2024', description: 'Major festival appearance under the desert stars.', href: '/show-abu-dhabi', imagePath: '/assets/press-bg2.jpg', order: 2, isActive: true },
    { title: 'Royal Wedding of the Year', venue: 'Private Events', location: 'Worldwide', season: 'Spring / Summer 2023', description: 'Exclusive corporate events and private celebrations.', href: '/show-royal-wedding', imagePath: '/assets/ricky-fricktion.jpg', order: 3, isActive: true },
  ];
  for (const s of shows) {
    const [card] = await db.insert(showCards).values(s).returning();
    console.log(`  ✅ ${card.title} (id=${card.id})`);
  }

  // --- PARTNER LOGOS ---
  console.log('\nInserting partner logos...');
  const logos = [
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
  ];
  for (const l of logos) {
    const [logo] = await db.insert(partnerLogos).values(l).returning();
    console.log(`  ✅ ${logo.name} (id=${logo.id})`);
  }

  // --- CLIENT NAMES ---
  console.log('\nInserting client names...');
  const clients = [
    '50 Cent', 'Bruno Mars', 'Chris Brown', 'Dr. Dre & Jimmy Iovine', 'Drake',
    'Future', 'Jason Momoa', 'Jason Statham', 'Justin Bieber', 'Kendrick Lamar',
    'Leonardo DiCaprio', 'Lewis Hamilton', 'Mick Jagger', 'Neymar Jnr', 'Paul McCartney',
    'Rihanna', 'Ronaldo', 'Travis Scott', 'Usain Bolt', 'Vin Diesel',
  ];
  for (let i = 0; i < clients.length; i++) {
    const [client] = await db.insert(clientNames).values({ name: clients[i], order: i, isActive: true }).returning();
    console.log(`  ✅ ${client.name} (id=${client.id})`);
  }

  // --- VENUE TICKER ---
  console.log('\nInserting venue ticker...');
  const venues = [
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
  const [ticker] = await db.insert(venueTicker).values({ venues }).returning();
  console.log(`  ✅ ${venues.length} venues (id=${ticker.id})`);

  // --- SITE SECTIONS ---
  console.log('\nInserting site sections...');

  const sections = [
    // Home page sections
    {
      page: 'home', section: 'hero', order: 0,
      content: {
        title: 'Late Night Ricky',
        subtitle: 'International DJ & Grammy Winning Producer',
        image: '/assets/ricky-hero-v2.jpg',
        logo: '/assets/ricky-logo.png',
      },
      links: { showreel: '/showreel' },
    },
    {
      page: 'home', section: 'reach', order: 1,
      content: {
        headline: 'International DJ & Grammy Winning Producer. From London to New York / LA to Las Vegas / Miami to Ibiza and beyond.',
        subtext: '150+ shows worldwide. Grammy recognition for work with Chris Brown. Platinum-certified. Previously DJ Fricktion.',
        grammyImage: '/assets/grammy-gold-v2.png',
      },
    },
    {
      page: 'home', section: 'partnerships', order: 2,
      content: {
        quote: 'The best DJ I\'ve heard.',
        attribution: 'Cristiano Ronaldo',
        description: 'Trusted by A-list artists, global brands, and sold-out crowds worldwide.',
        pressPack: '/assets/press-pack.pdf',
      },
    },
    {
      page: 'home', section: 'radio', order: 3,
      content: {
        headline: 'As Heard On',
        description: 'Preview snippets of the latest releases.',
        spotifyUrl: 'https://open.spotify.com/artist/4AK6F2O4Il0oZ8pSpuOOnl',
        appleMusicUrl: 'https://music.apple.com/gb/artist/late-night-ricky/1234567890',
        image: '/assets/ricky-radio-new.jpg',
      },
    },
    {
      page: 'home', section: 'share', order: 4,
      content: {
        headline: 'Share Your Music',
        description: "I'm always on the lookout for new music to play, so send me your tracks",
        link: '/share-music',
      },
    },

    // About page sections
    {
      page: 'about', section: 'intro', order: 0,
      content: {
        headline: 'International DJ & Grammy Winning Producer',
        image: '/assets/ricky-portrait-new.jpg',
        bio1: 'Late Night Ricky (Previously DJ Fricktion) is an Award-Winning DJ, Grammy Award Winner and Platinum Certified Music Producer based in London.',
        bio2: 'As a producer, Ricky cites his key influences as Michael Jackson, Dr. Dre, Quincy Jones, and Timbaland.',
        bio3: 'Having earned Grammy recognition for his work with Chris Brown on the 11:11 album, plus previous cuts with Kendrick Lamar and NAV.',
      },
    },
    {
      page: 'about', section: 'stats', order: 1,
      content: {
        shows: '150+ Shows',
        grammy: 'Grammy Recognition',
        platinum: 'Platinum Certified',
        clients: 'A-List Clientele',
      },
    },

    // Contact page sections
    {
      page: 'contact', section: 'info', order: 0,
      content: {
        bookingEmail: 'samir@wearemediahive.com',
        instagram: '@latenightricky',
        image: '/assets/ricky-hero-new.jpg',
      },
    },

    // Showreel page sections
    {
      page: 'showreel', section: 'main', order: 0,
      content: {
        videos: [
          { title: '2025 Showreel', src: '/assets/video-desktop.mp4', poster: '/assets/ricky-hero-new.jpg', year: '2025' },
        ],
      },
    },
  ];

  for (const s of sections) {
    const [section] = await db.insert(siteSections).values({
      ...s,
      isActive: true,
      updatedAt: new Date(),
    }).returning();
    console.log(`  ✅ ${section.page}/${section.section} (id=${section.id})`);
  }

  // --- TRACKS ---
  console.log('\nInserting tracks...');
  const defaultTracks = [
    { title: 'Late Night Ricky — Midnight in London', duration: '0:30', filePath: '/assets/snippet-1.mp3', order: 0, isActive: true },
    { title: 'Late Night Ricky — Vegas Lights', duration: '0:30', filePath: '/assets/snippet-2.mp3', order: 1, isActive: true },
    { title: 'Late Night Ricky — Ibiza Sunrise', duration: '0:30', filePath: '/assets/snippet-3.mp3', order: 2, isActive: true },
    { title: 'Late Night Ricky — South Side', duration: '0:30', filePath: '/assets/snippet-4.mp3', order: 3, isActive: true },
    { title: 'Late Night Ricky — After Hours', duration: '0:30', filePath: '/assets/snippet-5.mp3', order: 4, isActive: true },
  ];
  for (const t of defaultTracks) {
    const [track] = await db.insert(tracks).values(t).returning();
    console.log(`  ✅ ${track.title} (id=${track.id})`);
  }

  console.log('\n🎉 CMS populated successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
