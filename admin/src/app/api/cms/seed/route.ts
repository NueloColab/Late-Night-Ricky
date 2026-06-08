import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { showCards, partnerLogos, clientNames, venueTicker, siteSections, tracks } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function POST() {
  let seeded = 0;

  try {
    // Clear old data and re-seed with current content

    // --- SHOW CARDS ---
    await db.delete(showCards);
    const shows = [
      { title: 'Sidemen vs YouTube All Stars', venue: 'Ministry of Sound', location: 'London', season: 'Spring / Summer 2025', description: "One of London's most iconic venues, packed to capacity.", href: '/show-sidemen', imagePath: '/assets/ricky-hero-new.jpg', order: 0, isActive: true },
      { title: 'Gin & Juice Launch', venue: 'Ibiza Rocks', location: 'Ibiza', season: 'Spring / Summer 2024', description: 'Sunset sets and poolside energy in the White Isle.', href: '/show-gin-juice', imagePath: '/assets/ricky-radio-new.jpg', order: 1, isActive: true },
      { title: 'Abu Dhabi Grand Prix', venue: 'Skyline Festival', location: 'International', season: 'Autumn / Winter 2024', description: 'Major festival appearance under the desert stars.', href: '/show-abu-dhabi', imagePath: '/assets/press-bg2.jpg', order: 2, isActive: true },
      { title: 'Royal Wedding of the Year', venue: 'Private Events', location: 'Worldwide', season: 'Spring / Summer 2023', description: 'Exclusive corporate events and private celebrations.', href: '/show-royal-wedding', imagePath: '/assets/ricky-fricktion.jpg', order: 3, isActive: true },
    ];
    for (const s of shows) { await db.insert(showCards).values(s); seeded++; }

    // --- PARTNER LOGOS ---
    await db.delete(partnerLogos);
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
    for (const l of logos) { await db.insert(partnerLogos).values(l); seeded++; }

    // --- CLIENT NAMES ---
    await db.delete(clientNames);
    const names = [
      '50 Cent', 'Bruno Mars', 'Chris Brown', 'Dr. Dre & Jimmy Iovine', 'Drake',
      'Future', 'Jason Momoa', 'Jason Statham', 'Justin Bieber', 'Kendrick Lamar',
      'Leonardo DiCaprio', 'Lewis Hamilton', 'Mick Jagger', 'Neymar Jnr', 'Paul McCartney',
      'Rihanna', 'Ronaldo', 'Travis Scott', 'Usain Bolt', 'Vin Diesel',
    ];
    for (let i = 0; i < names.length; i++) { await db.insert(clientNames).values({ name: names[i], order: i, isActive: true }); seeded++; }

    // --- VENUE TICKER ---
    await db.delete(venueTicker);
    await db.insert(venueTicker).values({
      venues: ['LIV Miami', 'TAPE London', 'HAKKASAN Las Vegas', 'MINISTRY OF SOUND London', 'PACHA Ibiza', '1 OAK New York', 'WIRELESS FESTIVAL UK', 'READING & LEEDS FESTIVAL UK'],
    });
    seeded++;

    // --- SITE SECTIONS ---
    await db.delete(siteSections);
    const sections = [
      { page: 'home', section: 'hero', order: 0, content: { title: 'Late Night Ricky', subtitle: 'International DJ & Grammy Winning Producer' }, isActive: true },
      { page: 'home', section: 'reach', order: 1, content: { headline: 'International DJ & Grammy Winning Producer' }, isActive: true },
      { page: 'home', section: 'partnerships', order: 2, content: { quote: 'The best DJ I\'ve heard.', attribution: 'Cristiano Ronaldo' }, isActive: true },
      { page: 'about', section: 'intro', order: 0, content: { headline: 'International DJ & Grammy Winning Producer' }, isActive: true },
      { page: 'contact', section: 'info', order: 0, content: { bookingEmail: 'samir@wearemediahive.com', instagram: '@latenightricky' }, isActive: true },
    ];
    for (const s of sections) { await db.insert(siteSections).values(s); seeded++; }

    // --- TRACKS ---
    await db.delete(tracks);
    const defaultTracks = [
      { title: 'Late Night Ricky — Midnight in London', duration: '0:30', filePath: '/assets/snippet-1.mp3', order: 0, isActive: true },
      { title: 'Late Night Ricky — Vegas Lights', duration: '0:30', filePath: '/assets/snippet-2.mp3', order: 1, isActive: true },
      { title: 'Late Night Ricky — Ibiza Sunrise', duration: '0:30', filePath: '/assets/snippet-3.mp3', order: 2, isActive: true },
      { title: 'Late Night Ricky — South Side', duration: '0:30', filePath: '/assets/snippet-4.mp3', order: 3, isActive: true },
      { title: 'Late Night Ricky — After Hours', duration: '0:30', filePath: '/assets/snippet-5.mp3', order: 4, isActive: true },
    ];
    for (const t of defaultTracks) { await db.insert(tracks).values(t); seeded++; }

    return NextResponse.json({ success: true, seeded, message: `Reset and seeded ${seeded} items` });
  } catch (err) {
    console.error('CMS seed error:', err);
    return NextResponse.json({ success: false, message: 'Seed failed — check server logs' }, { status: 500 });
  }
}
