import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/db/schema';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sqlite = new Database('./sqlite.db');
const db = drizzle(sqlite, { schema });

const SITE_ROOT = resolve(__dirname, '..', '..');

function readHtml(filename: string): string {
  try {
    return readFileSync(resolve(SITE_ROOT, filename), 'utf-8');
  } catch {
    return '';
  }
}

function extractText(html: string): string[] {
  const texts: string[] = [];
  // Simple text extraction - strip tags and collect meaningful text blocks
  const noScript = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  const noStyle = noScript.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  const noTags = noStyle.replace(/<[^>]+>/g, ' ');
  const lines = noTags
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && l.length < 500);
  return Array.from(new Set(lines)).slice(0, 30);
}

function extractImages(html: string): string[] {
  const images: string[] = [];
  const regex = /src=["'](assets\/[^"']+)["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    images.push(match[1]);
  }
  return Array.from(new Set(images));
}

function extractVideos(html: string): string[] {
  const videos: string[] = [];
  const regex = /src=["'](assets\/[^"']+\.(mp4|webm))["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    videos.push(match[1]);
  }
  return Array.from(new Set(videos));
}

async function seed() {
  console.log('🌱 Seeding CMS database...');

  // Clear existing data
  await db.delete(schema.users);
  await db.delete(schema.siteSections);
  await db.delete(schema.showCards);
  await db.delete(schema.partnerLogos);
  await db.delete(schema.clientNames);
  await db.delete(schema.venueTicker);
  await db.delete(schema.assets);
  await db.delete(schema.submissions);
  await db.delete(schema.projects);
  await db.delete(schema.quotes);
  await db.delete(schema.invoices);
  await db.delete(schema.clients);

  // Seed admin user
  const bcrypt = await import('bcryptjs');
  const pinHash = await bcrypt.hash('0000', 10);
  db.insert(schema.users).values({
    pinHash,
    name: 'Admin',
    email: 'admin@latenightricky.com',
  }).run();
  console.log('✅ Admin user created (PIN: 0000)');

  // Parse HTML files
  const indexHtml = readHtml('index.html');
  const aboutHtml = readHtml('about.html');
  const showreelHtml = readHtml('showreel.html');
  const contactHtml = readHtml('contact.html');

  // Seed site sections from each page
  const pages = [
    { name: 'home', html: indexHtml },
    { name: 'about', html: aboutHtml },
    { name: 'showreel', html: showreelHtml },
    { name: 'contact', html: contactHtml },
  ] as const;

  for (const { name, html } of pages) {
    if (!html) continue;
    const texts = extractText(html);
    const images = extractImages(html);
    const videos = extractVideos(html);

    db.insert(schema.siteSections).values({
      page: name,
      section: 'content',
      content: texts,
      images,
      videos,
      links: [],
      order: 0,
      isActive: true,
    }).run();

    // Also store raw HTML
    db.insert(schema.siteSections).values({
      page: name,
      section: 'raw_html',
      content: [html.slice(0, 5000)],
      images: [],
      videos: [],
      links: [],
      order: 1,
      isActive: true,
    }).run();
  }
  console.log('✅ Site sections seeded');

  // Seed show cards from index.html
  const showCardsData = [
    {
      order: 1,
      imagePath: 'assets/ricky-hero-new.jpg',
      venue: 'Ministry of Sound',
      location: 'London',
      season: 'Spring / Summer 2025',
      title: 'Sidemen vs YouTube All Stars',
      description: "One of London's most iconic venues, packed to capacity.",
      href: 'show-sidemen.html',
    },
    {
      order: 2,
      imagePath: 'assets/ricky-radio-new.jpg',
      venue: 'Ibiza Rocks',
      location: 'Ibiza',
      season: 'Spring / Summer 2024',
      title: 'Gin \u0026 Juice Launch',
      description: 'Sunset sets and poolside energy in the White Isle.',
      href: 'show-gin-juice.html',
    },
    {
      order: 3,
      imagePath: 'assets/press-bg2.jpg',
      venue: 'Skyline Festival',
      location: 'International',
      season: 'Autumn / Winter 2024',
      title: 'Abu Dhabi Grand Prix',
      description: 'Major festival appearance under the desert stars.',
      href: 'show-abu-dhabi.html',
    },
    {
      order: 4,
      imagePath: 'assets/ricky-fricktion.jpg',
      venue: 'Private Events',
      location: 'Worldwide',
      season: 'Spring / Summer 2023',
      title: 'Royal Wedding of the Year',
      description: 'Exclusive corporate events and private celebrations.',
      href: 'show-royal-wedding.html',
    },
  ];

  for (const card of showCardsData) {
    db.insert(schema.showCards).values(card).run();
  }
  console.log('✅ Show cards seeded');

  // Seed partner logos
  const partners = [
    { order: 1, imagePath: 'assets/logo-bafta.png', name: 'BAFTA', href: null },
    { order: 2, imagePath: 'assets/logo-f1.png', name: 'Formula 1', href: null },
    { order: 3, imagePath: 'assets/logo-chanel.png', name: 'Chanel', href: null },
    { order: 4, imagePath: 'assets/logo-patron.png', name: 'Patron', href: null },
    { order: 5, imagePath: 'assets/logo-lacoste.png', name: 'Lacoste', href: null },
    { order: 6, imagePath: 'assets/logo-montblanc.png', name: 'Montblanc', href: null },
    { order: 7, imagePath: 'assets/logo-lvmh.png', name: 'LVMH', href: null },
    { order: 8, imagePath: 'assets/logo-carrera.png', name: 'Carrera', href: null },
  ];
  for (const p of partners) {
    db.insert(schema.partnerLogos).values(p).run();
  }
  console.log('✅ Partner logos seeded');

  // Seed client names
  const clientsList = [
    '50 Cent', 'Bruno Mars', 'Chris Brown', 'Dr. Dre \u0026 Jimmy Iovine', 'Drake',
    'Future', 'Jason Momoa', 'Jason Statham', 'Justin Bieber', 'Kendrick Lamar',
    'Leonardo DiCaprio', 'Lewis Hamilton', 'Mick Jagger', 'Neymar Jnr',
    'Paul McCartney', 'Rihanna', 'Ronaldo', 'Travis Scott', 'Usain Bolt', 'Vin Diesel',
  ];
  clientsList.forEach((name, i) => {
    db.insert(schema.clientNames).values({ order: i + 1, name, isActive: true }).run();
  });
  console.log('✅ Client names seeded');

  // Seed venue ticker
  const venues = [
    'LIV Miami', 'WALL Miami', 'TAPE London', 'HAKKASAN Las Vegas', 'MOVIDA Dubai',
    "JIMMY'Z Monte Carlo", 'MINISTRY OF SOUND London', '1 OAK New York', 'BYBLOS Milan',
    'PACHA Ibiza', 'ARMANI Dubai', 'MANDALAY BAY Las Vegas', 'TEMPLE San Francisco',
    'POPPY Los Angeles', 'CIRQUE LE SOIR London', 'HIGHLIGHT ROOM Los Angeles',
    "TEDDY'S @ ROOSEVELT Los Angeles", 'DELILAH Los Angeles', 'GIBSON Frankfurt',
    'LIO Ibiza', 'STUDIO PARIS Chicago', 'PREMIER @ BORGATE Atlantic City',
    'PARQ San Diego', 'BOOTSY BELLOWS Los Angeles', 'WARWICK Los Angeles',
    'LAVO New York', 'TAO New York', 'UP \u0026 DOWN New York', 'LIBERTINE London',
    'SCANDAL London', 'TOY ROOM Dubai', '1 OAK Dubai', 'TAO Las Vegas',
    'BAOLI Cannes', 'SHOKO Barcelona', 'LASTA Serbia', 'REX ROOMS London',
    "HARRIET'S Los Angeles", 'VIP ROOM St. Tropez', 'BON BONNIERE Mykonos',
    'DRAMA London', 'DEAR DARLING London', 'TRAMP London', 'SPIRITO Brussels',
    'CUCKOO CLUB London', 'RAFFLES London', 'SUBOIS Montreal', 'P1 Munich',
    "ZELO'S Monte Carlo", 'WIRELESS FESTIVAL UK', 'READING \u0026 LEEDS FESTIVAL UK',
  ];
  db.insert(schema.venueTicker).values({ venues }).run();
  console.log('✅ Venue ticker seeded');

  // Seed assets from all discovered files
  const allImages = Array.from(new Set([
    ...extractImages(indexHtml),
    ...extractImages(aboutHtml),
    ...extractImages(showreelHtml),
    ...extractImages(contactHtml),
  ]));
  const allVideos = Array.from(new Set([
    ...extractVideos(indexHtml),
    ...extractVideos(aboutHtml),
    ...extractVideos(showreelHtml),
    ...extractVideos(contactHtml),
  ]));

  allImages.forEach((path) => {
    const name = path.split('/').pop() || path;
    db.insert(schema.assets).values({
      filename: name,
      originalName: name,
      type: 'image',
      size: 0,
      path,
      thumbnailPath: path,
      usedIn: JSON.stringify(['site']),
    }).run();
  });

  allVideos.forEach((path) => {
    const name = path.split('/').pop() || path;
    db.insert(schema.assets).values({
      filename: name,
      originalName: name,
      type: 'video',
      size: 0,
      path,
      usedIn: JSON.stringify(['site']),
    }).run();
  });
  console.log(`✅ ${allImages.length} images + ${allVideos.length} videos seeded to assets`);

  // Seed sample CRM data
  db.insert(schema.clients).values({
    name: 'Ministry of Sound',
    email: 'bookings@ministryofsound.com',
    phone: '+44 20 7740 8600',
    instagram: '@ministryofsound',
    notes: 'Long-standing venue partner',
    totalBookings: 12,
    totalRevenue: 150000,
  }).run();

  db.insert(schema.projects).values({
    title: 'Summer Residency 2025',
    clientId: 1,
    type: 'dj-booking',
    status: 'in-progress',
    venue: 'Ministry of Sound, London',
    eventDate: '2025-06-01',
    fee: 50000,
    currency: 'GBP',
    notes: 'Weekly DJ residency at Ministry of Sound',
  }).run();

  db.insert(schema.quotes).values({
    projectId: 1,
    lineItems: JSON.stringify([{ description: 'DJ Set', quantity: 10, rate: 5000, total: 50000 }]),
    subtotal: 50000,
    taxRate: 20,
    total: 60000,
    status: 'approved',
  }).run();

  db.insert(schema.invoices).values({
    projectId: 1,
    invoiceNumber: 'LNR-001',
    lineItems: JSON.stringify([{ description: 'Deposit - DJ Residency', amount: 12500 }]),
    subtotal: 12500,
    taxRate: 20,
    total: 15000,
    status: 'sent',
    dueDate: '2025-06-15',
  }).run();

  console.log('✅ Sample CRM data seeded');

  // Seed sample submission
  db.insert(schema.submissions).values({
    email: 'demo@artist.com',
    artistName: 'Sample Artist',
    trackTitle: 'Demo Track',
    status: 'new',
  }).run();
  console.log('✅ Sample submission seeded');

  console.log('\n🎉 Seed complete! Run `npm run dev` to start.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
