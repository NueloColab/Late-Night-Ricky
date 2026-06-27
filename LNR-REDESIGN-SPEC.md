# LNR Redesign Spec: Garrix-Adapted Layout
## Complete Study of martin2smoove.com + Adaptation Plan for Late Night Ricky

---

## PART 1: MARTIN GARRIX SITE ANALYSIS (martin2smoove.com)

### Global Design Language

**Color Palette:**
- Primary background: Warm cream/off-white (#F0EFE9 ish)
- Brand accent: Deep forest green (#1B4332 ish)
- Dark sections: Near-black charcoal
- Muted text: Sage/gray-green
- Images: Strictly monochrome (black and white)
- No neon, no gradients on content, no bright colors

**Typography System:**
- **Script/Brand**: Handwritten brush script for the artist name (logo only)
- **Display/Headings**: High-contrast serif (like Playfair Display / Didot) for all section titles, quotes, and card titles
- **UI/Body**: Clean geometric sans-serif for labels, buttons, metadata (seasons, dates)
- **All buttons**: Pill-shaped outline (rounded-full, thin border) in forest green or white, uppercase sans-serif text

**Spacing Philosophy:**
- Extreme vertical breathing room between sections (150-200px+)
- Content areas feel like gallery walls, not a web page
- Every section is its own vignette with generous margins
- Nothing is cramped

**Image Treatment:**
- All photography is strictly black and white (monochrome)
- Square aspect ratio for card images
- No border radius, no shadows, no frames
- Dark gradient overlays from bottom for text readability on cards
- Atmospheric, desaturated hero images

**Button Language:**
- Two button types only:
  1. **Pill outline**: Rounded-full, thin border (1-2px), uppercase sans-serif, transparent fill, hover fills solid
  2. **Circle arrow**: Small (40-50px) circular outline with right-pointing arrow inside, used for card links and navigation

---

### Page 1: Homepage (martin2smoove.com)

**Section A: Hero**
- Full-viewport height
- Atmospheric desaturated photo of artist (silhouette, moody)
- Script logo centered over photo
- Circular scroll indicator below logo
- Play button on right edge
- Minimal nav: green clover logo top-left, hamburger top-right

**Section B: Concert Photo**
- Full-bleed, edge-to-edge cinematic shot (stage, crowd, spotlight)
- No text overlay, no buttons
- Serves as a visual "chapter break"
- Pure editorial moment

**Section C: Tour Intro Text**
- Warm cream/off-white background
- Large serif headline: "From London to New York / LA to Las Vegas / Miami to Ibiza / Sydney to Hong Kong / Tokyo to Monaco and many more."
- Smaller sans-serif subtext: "More than 270 shows around the world and an incredible US tour. Martin's busiest year yet."
- Thin horizontal rule below text
- Circular arrow button beside the rule
- Massive vertical padding (150px+ top and bottom)

**Section D: Shows/Stories Cards**
- Cream/off-white background (continues from Section C)
- 2-column grid of editorial photo cards
- Each card: Square B&W photo, season label (small, muted), title (bold serif), circular arrow button
- Carousel navigation: solid circle arrow buttons on left and right edges
- Only 2 cards visible at a time on desktop, swipeable/scrollable
- "ALL SHOWS & STORIES" link at bottom

**Section E: Quote/Testimonial**
- Full-width deep forest/emerald green background
- Atmospheric blurred gradient texture overlay
- Large serif italic quote centered: "One of the best DJs in the world"
- Smaller attribution: "Just ask Rihanna, Sir Paul McCartney, Ed Sheeran or any of the biggest brands on the planet."
- 120-160px vertical padding
- Small circular navigation dots (suggesting carousel of quotes)

**Section F: Contact CTA + Footer**
- Dark charcoal/near-black background
- Serif heading: "Reach out, let's collaborate"
- Pill outline button: "GET IN TOUCH" (white border, white text)
- B&W portrait photo on the right side
- Small copyright text at bottom center

---

### Page 2: Shows & Stories (martin2smoove.com/shows-stories)

**Section A: Title**
- Cream background
- Large serif "Shows & Stories" heading (left-aligned or centered)
- Minimal, spacious

**Section B: Card Grid**
- 2-column grid, 3 rows = 6 cards total
- Each card: Square B&W photo, season/year label (small muted text), title (bold serif), circular arrow button
- Cards are evenly spaced with consistent gutters
- No stacking/overlap effect on this page (that's the homepage carousel)
- Clean grid, no parallax, no hover effects visible

**Section C: Footer CTA**
- Same as homepage footer: dark charcoal, "Reach out, let's collaborate", "GET IN TOUCH" pill button, portrait

---

### Page 3: Partnerships (martin2smoove.com/partnerships)

**Section A: Title**
- Cream background
- Large serif "Partnerships" heading

**Section B: Partnership Cards**
- 2-column grid
- Each card: Square B&W photo, date range ("2025 - Ongoing"), brand name (bold serif), circular arrow button
- Same card template as shows but for brands
- Ultra-generous spacing between cards

**Section C: Footer CTA**
- Same as homepage footer

---

### Page 4: About Martin (martin2smoove.com/about-martin)

**Section A: Hero Quote**
- Cream background with subtle warm gradient
- MASSIVE serif quote: "It's always been about the crowd and giving them the time of their lives"
- Line-broken for dramatic rhythm
- Circular play button to the right of the text (video/audio trigger)
- The rest of the page is almost entirely empty space
- This is a STATEMENT page, not an info page

**Section B: Footer CTA**
- Same as homepage footer

---

### Page 5: Contact (martin2smoove.com/contact)

**Section A: Form**
- Cream background
- Large serif heading: "Get in touch"
- Minimal form: just a "Name" input field (thin green border, transparent fill)
- Circular submit button next to the field (arrow icon)
- Massive empty space below the form (intentional)

**Section B: Footer CTA**
- Same as homepage footer: "Reach out, let's collaborate", "GET IN TOUCH" pill, portrait

---

### Key Patterns Across All Pages

1. **Every page ends with the same footer**: Dark charcoal, serif "Reach out, let's collaborate", pill "GET IN TOUCH" button, portrait photo, copyright
2. **Cream/off-white is the default background** for all content. Dark sections are used sparingly (only the quote section on homepage, and the footer)
3. **Card template is universal**: Square B&W photo, small label, bold serif title, circular arrow button. Used for shows, partnerships, everything
4. **Serif for emotion, sans-serif for function**: Headlines, quotes, and titles = serif. Labels, buttons, metadata = sans-serif
5. **Circular buttons are the universal UI element**: Arrows, play buttons, navigation all use circles
6. **Extreme whitespace**: Every section has 150px+ vertical padding. Nothing touches anything else
7. **No scrolling marquees, no animated text tickers**: Content is static, designed, and carefully placed
8. **Photography is ALWAYS black and white**: No color photos anywhere on the site

---

## PART 2: ADAPTATION PLAN FOR LATE NIGHT RICKY

### Brand Translation: Garrix Green → LNR Navy

Garrix uses forest green as the brand accent. LNR uses navy/midnight blue. The adaptation:

| Garrix Element | Garrix Color | LNR Equivalent |
|---|---|---|
| Brand accent | Forest green (#1B4332) | Navy/midnight (#0d1f3d) |
| Content background | Warm cream (#F0EFE9) | Warm cream (#F0EDE5) — SAME |
| Dark sections | Near-black charcoal | Deep navy (#0a0e17) |
| Muted text | Sage/gray-green | Muted blue (#6B8FAB) |
| Headings | Forest green serif | Navy serif OR white serif on dark |
| Images | B&W monochrome | B&W monochrome with blue tints on hover |
| Button outline | Forest green | Navy on cream, white on dark |
| Script logo | Green handwritten | White Rockybilly script (existing) |

### Typography Translation

| Usage | Garrix | LNR |
|---|---|---|
| Brand logo | Custom brush script | Rockybilly script (existing) |
| Section headings | Didot/Playfair serif | Playfair Display serif (existing) |
| Card titles | Bold serif | Bold serif (Playfair Display) |
| Labels/metadata | Clean sans-serif uppercase | Inter uppercase (existing) |
| Buttons | Uppercase sans-serif | Inter 900 uppercase (existing) |

---

### Section-by-Section Redesign for LNR Homepage

#### Section 1: HERO (KEEP — already close)
- Full-viewport hero with Ricky's photo, logo, scroll indicator
- Keep the existing v231 hero (it already works well)
- Minor adjustment: change background tint from blue-grey to warm cream overlay for Garrix alignment
- **NO changes to layout or structure**

#### Section 2: TOUR INTRO (NEW — replaces venue marquee)
**Adapts from**: Garrix homepage Section C (tour intro text)

**Design:**
- **Background**: Warm cream (#F0EDE5)
- **Layout**: Centered text block with 120px+ vertical padding
- **Typography**:
  - Large Playfair Display serif (italic): "From London to New York / Dubai to Ibiza / Las Vegas to Monaco and beyond"
  - Uses slashes between cities (Garrix style)
  - Smaller Inter text below: "150+ shows worldwide. The UK's most in-demand DJ."
- **Accent**: Thin horizontal rule below text, small circular arrow icon beside it
- **NO scrolling marquees, NO outlined text, NO racing animations**
- **CMS data**: Pulls city/location names from the venues data, but presents them as a designed editorial statement, not a ticker

#### Section 3: SHOW CARDS (REDESIGN — stacked on scroll)
**Adapts from**: Garrix homepage Section D (shows/stories cards) + Rory's scroll-stacking request

**Design:**
- **Background**: Continues warm cream from Section 2
- **Section heading**: "Selected Shows" in bold serif, centered above cards
- **Layout**: Show cards in a 2-column grid (desktop) or single column (mobile)
- **Card template** (matches Garrix):
  - Square photo with B&W/desaturated treatment + dark gradient overlay from bottom
  - Small season label above title (e.g., "Spring / Summer 2025")
  - Title in bold serif (e.g., "Sidemen vs YouTube All Stars")
  - Circular arrow button for link
  - Venue/location as secondary info
- **Scroll-stacking interaction**: As the user scrolls, cards use `position: sticky` with decreasing `top` values. Card 1 stays at the top while Card 2 slides over it. Card 3 slides over Card 2, etc. By the end, you see the top 2 cards stacked with slight offset (like a deck of cards)
- **"VIEW ALL SHOWS"** pill outline button at the bottom
- **CMS data**: Uses `getShowCards()` with DEFAULT_SHOWS fallback
- **Images**: Use existing show images (show-sidemen.png, show-gin-juice.png, show-abu-dhabi.png, show-royal-wedding.png)

#### Section 4: QUOTE / TESTIMONIAL (ADAPT — from Garrix green section)
**Adapts from**: Garrix homepage Section E (quote on green background)

**Design:**
- **Background**: Deep navy (#0d1f3d) with subtle atmospheric gradient texture (existing `textured-bg` class)
- **Layout**: Centered quote with 120px+ vertical padding
- **Typography**:
  - Large Playfair Display serif italic (white): "The best DJ I've heard."
  - Attribution below: "Cristiano Ronaldo" (muted blue, #A8D5F0)
  - Description: "Trusted by A-list artists, global brands, and sold-out crowds worldwide."
- **CMS data**: Uses `partnersQuote`, `partnersAttribution`, `partnersDescription`

#### Section 5: PARTNERS (KEEP — already works)
- Logo grid with Grammy badges
- No changes from v231

#### Section 6: CLIENTS (REDESIGN — static grid replaces marquee)
**Adapts from**: Garrix's restrained approach (no scrolling text anywhere)

**Design:**
- **Background**: Warm cream (#F0EDE5)
- **Section heading**: "Trusted By The Best" in bold serif
- **Subtext**: "A few names we've shared the stage with" in small uppercase Inter
- **Layout**: 4-column grid (desktop) / 2-column grid (mobile)
- **Typography**: Bold uppercase Inter, navy (#1a1a1a) text
- **NO scrolling marquee, NO outlined text**
- **CMS data**: Uses `getClientNames()` with DEFAULT_CLIENTS fallback

#### Section 7: RADIO (KEEP — already works)
- Two-column: photo with equalizer, track list, streaming buttons
- No changes from v231

#### Section 8: SHARE MUSIC CTA (SIMPLIFY)
**Design:**
- **Background**: Deep navy, moody photo overlay
- **Simplified layout**: Centered serif heading, description, sharp-cornered white button
- Remove any marquee or outlined text
- Keep it clean and editorial

#### Section 9: CONTACT CTA + FORM (KEEP — already works)
- Two-column: serif heading + outline button on left, image on right
- Followed by contact form
- No changes from v231

---

### What's REMOVED from current redesign:

1. **3-row venue marquee** — replaced by editorial serif intro (Section 2)
2. **Photo collage** (7 scattered images) — removed. Stacked show cards serve the same purpose
3. **2-row client marquee** — replaced by static 4-column grid (Section 6)
4. **Bottom venue ticker** — absorbed into Section 2 intro text
5. **All scrolling/animated text tickers** — Garrix doesn't use them, neither should we

### What's ADDED:

1. **Tour intro section** (Section 2) — editorial serif text on cream background
2. **Scroll-stacking show cards** (Section 3) — the key interaction Rory described
3. **Quote/testimonial section** (Section 4) — editorial breather between shows and clients
4. **Static client grid** (Section 6) — clean, readable names
5. **Consistent warm cream (#F0EDE5)** for light sections (replaces alternating dark blocks)

---

### Animation Rules

- **Marquee scrolling**: ELIMINATED. Zero scrolling text tickers on the entire site
- **Show card stacking**: CSS `position: sticky` with `top` offset values (no JS needed)
- **Scroll reveal**: Keep existing ScrollReveal component (fade up on viewport entry)
- **Hover**: Photo scale (1.03), 0.6s transition only
- **Equalizer bars**: Keep existing animation in Radio section
- **No other animations**: The Garrix site is almost entirely static. The design works because of typography, spacing, and image treatment, not motion

### Mobile Approach

- Hero: Same responsive layout
- Tour intro: Full-width text, smaller font sizes via clamp()
- Show cards: Single column, same stacking effect with sticky
- Quote: Centered, smaller text
- Client grid: 2 columns on mobile, 4 on desktop
- Radio: Stack vertically on mobile
- Contact: Stack vertically on mobile

---

### Implementation Priority

1. **Section 3 (Show Cards with stacking)** — the hero interaction, most complex
2. **Section 2 (Tour Intro)** — replaces broken venue marquee
3. **Section 4 (Quote/Testimonial)** — new section
4. **Section 6 (Client Grid)** — replaces broken client marquee
5. Remove: venue marquee, photo collage, venue ticker
6. Keep: Hero, Partners, Radio, Contact (already working)

### Files to Change (STRICTLY 2)

- `admin/src/app/page.tsx` — restructure sections, add stacking card markup, remove marquee/collage
- `admin/src/app/globals.css` — new stacking card CSS, remove marquee CSS, add cream backgrounds, static grid styles

**Zero Vercel config changes. Zero other files touched.**

---

### LNR Assets Available for Show Cards

Existing images in `/admin/public/assets/`:
- `show-sidemen.png` — Sidemen vs YouTube All Stars
- `show-gin-juice.png` — Gin & Juice Launch
- `show-abu-dhabi.png` — Abu Dhabi Grand Prix
- `show-royal-wedding.png` — Royal Wedding of the Year
- `ricky-hero-new.jpg`, `ricky-hero-v2.jpg` — Hero/Ricky portraits
- `ricky-fricktion.jpg` — DJing shot
- `press-bg2.jpg` — Performance shot
- `ricky-radio-new.jpg` — Radio shot
- `carousel-1.jpg`, `carousel-2.jpg`, `carousel-3.jpg` — Additional photos

For B&W treatment: CSS `filter: grayscale(100%)` on card images, same as Garrix