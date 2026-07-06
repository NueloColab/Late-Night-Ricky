const postgres = require('postgres');
const sql = postgres('postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require');

async function main() {
  console.log('Seeding CMS with front end content...\n');

  // 1. Update home/hero - add tagline
  await sql`UPDATE site_sections SET content = content::jsonb || '{"tagline": "Grammy Winning Producer | International DJ"}'::jsonb WHERE page = 'home' AND section = 'hero'`;
  console.log('1. Updated home/hero with tagline');

  // 2. Create home/moments section
  const momentsContent = {
    heading: 'Late Night Moments',
    subtext: "An insight to Ricky's world",
    items: [
      { id: 'misfits', title: 'Misfits Boxing', subtitle: 'Ministry of Sound, London', description: 'Headlining the biggest influencer boxing event in the UK. Misfits Boxing at Ministry of Sound brought together sport, music, and culture for an unforgettable night.', images: ['/assets/highlight-studio.jpg', '/assets/highlight-arena.jpg', '/assets/moment-ibiza.jpg'] },
      { id: 'o2', title: 'O2 Arena', subtitle: 'The O2, London', description: 'Performing to a sold-out crowd at The O2 Arena, one of London\'s most iconic venues. A landmark moment in the Late Night Ricky journey.', images: ['/assets/highlight-arena.jpg', '/assets/highlight-studio.jpg', '/assets/press-bg2.jpg'] },
      { id: 'ibiza', title: 'Ibiza Summer', subtitle: 'Ushuaia, Ibiza', description: 'Summer residency at Ushuaia, the world\'s most iconic open-air club. Ibiza sunsets and unforgettable energy every single night.', images: ['/assets/moment-ibiza.jpg', '/assets/highlight-club.jpg', '/assets/highlight-misfits.jpg'] },
      { id: 'private', title: 'Private Events', subtitle: 'Worldwide', description: 'Exclusive performances for A-list celebrities, brands, and private gatherings across the globe. From London to Dubai, every event is curated to perfection.', images: ['/assets/press-bg2.jpg', '/assets/highlight-club.jpg', '/assets/highlight-studio.jpg'] },
      { id: 'backtoback', title: 'Back to Back', subtitle: 'Private Events, London', description: 'Intimate back-to-back sets with some of the biggest names in the industry. These moments define the underground London scene.', images: ['/assets/highlight-club.jpg', '/assets/highlight-misfits.jpg', '/assets/press-bg2.jpg'] },
      { id: 'ibizarocks', title: 'Ibiza Rocks', subtitle: 'Ibiza Rocks, Ibiza', description: 'High-energy daytime pool parties at Ibiza Rocks. The ultimate summer soundtrack for thousands of party-goers from around the world.', images: ['/assets/highlight-misfits.jpg', '/assets/moment-ibiza.jpg', '/assets/highlight-arena.jpg'] }
    ]
  };

  await sql`INSERT INTO site_sections (page, section, content, "order", is_active, is_visible)
    VALUES ('home', 'moments', ${JSON.stringify(momentsContent)}::jsonb, 3, true, true)
    ON CONFLICT DO NOTHING`;
  console.log('2. Created home/moments section');

  // 3. Create home/performers section (Has Performed With)
  const performersContent = {
    heading: 'Has Performed With...',
    subtext: 'And many more...',
    row1Images: ['/assets/highlight-studio.jpg', '/assets/highlight-arena.jpg', '/assets/moment-ibiza.jpg', '/assets/press-bg2.jpg', '/assets/highlight-club.jpg', '/assets/highlight-misfits.jpg'],
    row2Images: ['/assets/highlight-misfits.jpg', '/assets/highlight-club.jpg', '/assets/press-bg2.jpg', '/assets/moment-ibiza.jpg', '/assets/highlight-arena.jpg', '/assets/highlight-studio.jpg'],
    headingImage: '/assets/ricky-text-cream.png'
  };

  await sql`INSERT INTO site_sections (page, section, content, "order", is_active, is_visible)
    VALUES ('home', 'performers', ${JSON.stringify(performersContent)}::jsonb, 4, true, true)
    ON CONFLICT DO NOTHING`;
  console.log('3. Created home/performers section');

  // 4. Create home/venues section (Worldwide Performances)
  const venuesContent = {
    heading: 'Worldwide Performances',
    backgroundImage: '/assets/venues-bg.jpg',
    venues: [
      'LIV (Miami)', 'WALL (Miami)', 'TAPE (London)', 'HAKKASAN (Las Vegas)', 'MOVIDA (Dubai)', 'JIMMY\'Z (Monte Carlo)',
      'MINISTRY OF SOUND (London)', '1 OAK (New York)', 'BYBLOS (Milan)', 'PACHA (Ibiza)', 'ARMANI (Dubai)', 'MANDALAY BAY (Las Vegas)',
      'TEMPLE (San Francisco)', 'POPPY (Los Angeles)', 'CIRQUE LE SOIR (London)', 'HIGHLIGHT ROOM (Los Angeles)',
      'TEDDY\'S @ ROOSEVELT (Los Angeles)', 'DELILAH (Los Angeles)', 'GIBSON (Frankfurt)', 'LIO (Ibiza)',
      'STUDIO PARIS (Chicago)', 'PREMIER @ BORGATA (Atlantic City)', 'PARQ (San Diego)', 'BOOTSY BELLOWS (Los Angeles)',
      'WARWICK (Los Angeles)', 'LAVO (New York)', 'TAO (New York)', 'UP & DOWN (New York)',
      'LIBERTINE (London)', 'SCANDAL (London)', 'TOY ROOM (Dubai)', '1 OAK (Dubai)', 'TAO (Las Vegas)',
      'BAOLI (Cannes)', 'SHOKO (Barcelona)', 'LASTA (Serbia)', 'REX ROOMS (London)', 'HARRIET\'S (Los Angeles)',
      'VIP ROOM (St. Tropez)', 'BON BONNIERE (Mykonos)', 'DRAMA (London)', 'DEAR DARLING (London)', 'TRAMP (London)',
      'SPIRITO (Brussels)', 'CUCKOO CLUB (London)', 'RAFFLES (London)', 'SUBOIS (Montreal)', 'P1 (Munich)',
      'ZELO\'S (Monte Carlo)', 'WIRELESS FESTIVAL (UK)', 'READING & LEEDS FESTIVAL (UK)', 'USHAIA (Ibiza)',
      'ABU DHABI GRAND PRIX', 'O2 ARENA (London)', 'FESTIVAL DE CANNES'
    ]
  };

  await sql`INSERT INTO site_sections (page, section, content, "order", is_active, is_visible)
    VALUES ('home', 'venues', ${JSON.stringify(venuesContent)}::jsonb, 5, true, true)
    ON CONFLICT DO NOTHING`;
  console.log('4. Created home/venues section');

  // 5. Create home/brands section (Trusted by Global Brands)
  const brandsContent = {
    heading: 'Trusted by Global Brands',
    backgroundImage: '/assets/ricky-brands-gold.png',
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
      { name: 'Festival de Cannes', src: '/assets/logo-cannes-trimmed.png' }
    ]
  };

  await sql`INSERT INTO site_sections (page, section, content, "order", is_active, is_visible)
    VALUES ('home', 'brands', ${JSON.stringify(brandsContent)}::jsonb, 8, true, true)
    ON CONFLICT DO NOTHING`;
  console.log('5. Created home/brands section');

  // 6. Update home/share_music with CTA fields
  const shareContent = { heading: "Share Your Music", description: "I'm always on the lookout for new music to play, so send me your tracks", ctaText: "UPLOAD YOUR TRACK", ctaLink: "/share-music" };
  await sql`UPDATE site_sections SET content = ${JSON.stringify(shareContent)}::jsonb WHERE page = 'home' AND section = 'share_music'`;
  console.log('6. Updated home/share_music with CTA fields');

  // 7. Update about/intro with quote fields
  const aboutResult = await sql`SELECT content::text FROM site_sections WHERE page = 'about' AND section = 'intro'`;
  if (aboutResult.length > 0) {
    const content = typeof aboutResult[0].content === 'string' ? JSON.parse(aboutResult[0].content) : aboutResult[0].content;
    content.quote = '"The best DJ I\'ve heard."';
    content.quoteAttribution = 'Ronaldo';
    content.aboutHeadingImage = '/assets/about-text-cream.png';
    content.rickyTextImage = '/assets/ricky-text-cream.png';
    content.pressPackLink = '/assets/press-pack.pdf';
    content.productionCredits = [
      'Chris Brown', 'Kendrick Lamar', 'NAV', 'Divine',
      'Potter Payper', 'Swae Lee', 'N.O.R.E', 'Styles P',
      'Raekwon', 'RZA', 'Jim Jones', 'D Smoke',
      'Apache Indian', 'MC Altaf', 'H33RA', 'Stefflon Don',
      'Lil Keed', 'Ivorian Doll', 'Safe', 'Plus Many More'
    ];
    const aboutJson = JSON.stringify(content);
    await sql`UPDATE site_sections SET content = ${aboutJson}::jsonb WHERE page = 'about' AND section = 'intro'`;
    console.log('7. Updated about/intro with quote, images, and production credits');
  }

  // 8. Update showreel sections to hidden
  await sql`UPDATE site_sections SET is_visible = false WHERE page = 'showreel'`;
  console.log('8. Set showreel sections to is_visible = false');

  // 9. Update tracks with cover art and YouTube URLs
  await sql`UPDATE tracks SET cover_path = '/assets/ricky-music-jacket-sm.jpg', youtube_url = 'https://www.youtube.com/@LateNightRicky'`;
  console.log('9. Updated all tracks with cover art and YouTube URL');

  // 10. Update show_cards with correct data matching front end
  await sql`UPDATE show_cards SET title = 'MISFITS BOXING', venue = 'Ministry of Sound', location = 'London', season = '2025', description = 'In the studio, crafting the sound.', image_path = '/assets/highlight-studio.jpg', href = '/show-misfits-boxing' WHERE id = 21`;
  await sql`UPDATE show_cards SET title = 'IBIZA ROCKS', venue = 'Ibiza Rocks', location = 'Ibiza', season = '2024', description = 'Sunset sets and poolside energy in the White Isle.', image_path = '/assets/highlight-arena.jpg', href = '/show-ibiza' WHERE id = 23`;
  await sql`UPDATE show_cards SET title = 'BACK TO BACK', venue = 'Private Events', location = 'London', season = '2024', description = 'Intimate sets and electric crowds.', image_path = '/assets/highlight-club.jpg', href = '/show-club' WHERE id = 24`;

  // Add missing show cards
  await sql`INSERT INTO show_cards ("order", title, venue, location, season, description, image_path, href, is_active) VALUES (4, 'O2 ARENA', 'O2 Arena', 'London', '2025', 'Major arena appearance, packed to capacity.', '/assets/highlight-misfits.jpg', '/show-arena', true)`;
  await sql`INSERT INTO show_cards ("order", title, venue, location, season, description, image_path, href, is_active) VALUES (5, 'ABU DHABI GP', 'Skyline Festival', 'Abu Dhabi', '2025', 'Performing at the Abu Dhabi Grand Prix.', '/assets/press-bg2.jpg', '/show-abu-dhabi', true)`;
  await sql`INSERT INTO show_cards ("order", title, venue, location, season, description, image_path, href, is_active) VALUES (6, 'ROYAL WEDDING', 'Private Events', 'London', '2025', 'The most exclusive private event of the year.', '/assets/ricky-fricktion.jpg', '/show-royal-wedding', true)`;
  console.log('10. Updated and added show cards');

  // 11. Create home/contact section with all contact details
  const contactContent = {
    heading: 'Get in Touch',
    bookingEmail: 'samir@wearemediahive.com',
    instagram: '@latenightricky',
    instagramUrl: 'https://instagram.com/latenightricky',
    youtubeUrl: 'https://youtube.com/@latenightricky',
    spotifyUrl: 'https://open.spotify.com/artist/3lOtUgicoyDn2qKe5zc3dl',
    appleMusicUrl: 'https://music.apple.com/gb/artist/late-night-ricky/1759491226',
    tiktokUrl: 'https://tiktok.com/@latenightricky',
    twitterUrl: 'https://twitter.com/latenightricky',
    facebookUrl: 'https://facebook.com/latenightricky'
  };

  await sql`INSERT INTO site_sections (page, section, content, "order", is_active, is_visible)
    VALUES ('home', 'contact_section', ${JSON.stringify(contactContent)}::jsonb, 10, true, true)
    ON CONFLICT DO NOTHING`;
  console.log('11. Created home/contact_section with social links');

  // 12. Create home/footer section
  const footerContent = {
    copyright: 'Late Night Ricky',
    poweredBy: 'Nuelo CoLab',
    poweredByUrl: 'https://nuelo.co',
    logo: '/assets/ricky-logo.png',
    links: [
      { text: 'Privacy', href: '/privacy' },
      { text: 'Terms', href: '/terms' },
      { text: 'Admin Login', href: '/admin' }
    ]
  };

  await sql`INSERT INTO site_sections (page, section, content, "order", is_active, is_visible)
    VALUES ('home', 'footer', ${JSON.stringify(footerContent)}::jsonb, 11, true, true)
    ON CONFLICT DO NOTHING`;
  console.log('12. Created home/footer section');

  // Verify all sections
  const sections = await sql`SELECT page, section, is_visible, content::text FROM site_sections ORDER BY page, "order"`;
  console.log('\n=== All CMS Sections After Seed ===');
  sections.forEach(s => {
    const preview = s.content ? s.content.substring(0, 80) + '...' : 'null';
    console.log(`${s.page}/${s.section} visible:${s.is_visible} => ${preview}`);
  });

  const cards = await sql`SELECT id, title, venue, location FROM show_cards ORDER BY "order"`;
  console.log('\n=== Show Cards ===');
  cards.forEach(c => console.log(`  ${c.id}: ${c.title} @ ${c.venue}, ${c.location}`));

  const trackList = await sql`SELECT id, title, cover_path, youtube_url FROM tracks ORDER BY "order"`;
  console.log('\n=== Tracks ===');
  trackList.forEach(t => console.log(`  ${t.id}: ${t.title} cover:${t.cover_path ? 'yes' : 'no'} yt:${t.youtube_url ? 'yes' : 'no'}`));

  await sql.end();
  console.log('\nSeed complete!');
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});