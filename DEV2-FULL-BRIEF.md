# LNR Homepage Redesign — Full Brief for Dev2

**Last updated:** 29 June 2026, 12:00 UTC
**Written by:** Brian (main orchestrator), based on multiple iterations with Rory

---

## 1. PROJECT OVERVIEW

**Project:** Late Night Ricky (LNR) website homepage redesign
**Client:** Rory May / Nuelo CoLab
**Design Direction:** Martin Garrix-inspired editorial style (martin2smoove.com)
**Repo:** `/home/node/.openclaw/workspace/late-night-ricky/`
**Branch:** `test` (ALL work goes here, never `main`)
**Production site:** `late-night-ricky.vercel.app` (builds from `main` — DO NOT TOUCH)
**Preview site:** `lnr-preview.vercel.app` — currently BLOCKED (see section 9)

**Tech stack:** Next.js App Router, React 18, Tailwind CSS + custom CSS in globals.css, Neon Postgres for CMS data

---

## 2. WHO IS LATE NIGHT RICKY?

Late Night Ricky (formerly DJ Fricktion) is an international DJ and Grammy-winning producer. He's performed with/for: 50 Cent, Bruno Mars, Chris Brown, Dr. Dre & Jimmy Iovine, Drake, Neymar Jnr, Cristiano Ronaldo, Lewis Hamilton, and many more A-list names. The website needs to feel premium, editorial, and befitting someone at that level.

---

## 3. DESIGN SYSTEM (STRICT — NO EXCEPTIONS)

### Typography
- **Playfair Display** (serif) — quotes, emotional headings, editorial text
- **Montserrat** (sans-serif) — UI labels, buttons, body text, metadata
- **Oswald** — carousel name text (big outlined/solid stroke text)

### Colours
- **Dark backgrounds:** #0a0e17 (midnight navy)
- **White text** on dark sections
- **Gold (#D4AF37)** — ONLY for Ronaldo's attribution name, nowhere else
- **NO PINK, NO RED, NO AMBER, NO GREEN** anywhere on the site (this has been confirmed multiple times)
- **No random invented colours** — if you need a colour, it comes from the design system

### Photography
- All photos: B&W/grayscale, no rounded corners, no shadows, no borders
- Use CSS `filter: grayscale()` on colour images

### Buttons
- Pill-outline style ONLY (rounded-full, thin 1px border)
- Hover: fill solid (white bg, dark text)
- NO sharp-cornered buttons anywhere

### Spacing
- Extreme whitespace between sections (Garrix-style 150-200px+)
- Every section is its own vignette with generous margins

### Hero Logo
- `mix-blend-mode: screen`
- `filter: brightness(0) invert(1) drop-shadow(0 4px 30px rgba(168, 213, 240, 0.4))`
- This makes it appear BLUE/TEAL on the dark background
- **DO NOT change to white** — Rory has confirmed this multiple times

---

## 4. CURRENT PAGE STRUCTURE (top to bottom)

### Section 1: Loader (RE-ENABLED)
- Outlined/stroke text "LATE / NIGHT / RICKY" in 3 lines
- Scramble animation per character
- Now a separate client component: `admin/src/components/Loader.tsx`
- Fades out after ~3 seconds, reveals page
- **Status:** Component exists, re-enabled in page.tsx. Needs visual verification.

### Section 2: Hero (DO NOT TOUCH)
- Full-viewport hero with grayscale photo background (`mix-blend-mode: multiply`)
- LNR logo centred (`mix-blend-mode: screen`, teal drop shadow)
- "Scroll" indicator at bottom
- **Status:** Complete, confirmed by Rory. DO NOT MODIFY.

### Section 3: Showreel
- Video background with outlined "LATE NIGHT RICKY" text overlay
- "WATCH SHOWREEL" pill button
- **Status:** Built, needs no changes.

### Section 4: Reach (Editorial Collage)
- Dark background, ghost "RICKY" watermark behind
- Portrait photo (upper left), dark card with serif quote (overlapping right), secondary texture strip (bottom right)
- Quote: "International DJ & Grammy Winning Producer. From London to New York / LA to Las Vegas / Miami to Ibiza and beyond."
- **Status:** Built, visually verified.

### Section 5: Trusted by the Best (NEEDS FIXING)
- **This is the main problem area.** See Section 5 below for full detail.
- **Status:** Structure updated but NOT visually verified. Layout may still be broken.

### Section 6: Highlights (Stacking Cards)
- Vertical "HIGHLIGHTS" label on left edge
- Serif heading "RECENT HIGHLIGHTS"
- 4 stacking show cards that pile up on scroll (position: sticky)
- B&W images, serif titles
- **Status:** Built, basic functionality works.

### Section 7: Collage (Asymmetric Photo Scatter)
- Ghost "RICKY" watermark behind
- 4 photos in asymmetric grid layout
- Quote overlay on one photo, outlined text "LATE NIGHT" on another
- **Status:** Built, needs visual polish.

### Section 8: Life is Crazy Banner
- Outlined stroke text "LATE NIGHT RICKY" full-width
- Dark background
- **Status:** Built, basic.

### Section 9: Radio
- Vertical "MUSIC" label on left edge
- Image with EQ bars animation
- Track list (AudioTrackList component)
- Spotify/Apple/YouTube pill buttons
- **Status:** Built, functional.

### Section 10: Share Music CTA
- Background image with dark overlay
- Serif heading, description, "Submit Your Track" pill button
- **Status:** Built, basic.

### Section 11: Contact (HomeContactSection)
- Contact form section
- **Status:** Pre-existing component, unchanged.

### Section 12: Footer
- 4-column grid (Shows, Music, Partners, Contact)
- Logo at bottom, copyright, privacy/terms links
- **Status:** Built, basic.

---

## 5. SECTION 5 — TRUSTED BY THE BEST (MAIN PROBLEM)

This is the section that's been iterated on the most and is still not right. Read this carefully.

### What It Should Look Like (Rory's Vision)
A full-viewport editorial section with three clear zones:

1. **TOP (black/empty space):**
   - "Trusted by A-list artists, global brands, and sold-out crowds worldwide." (small caps, Montserrat, muted)
   - "The best DJ I've heard." (large serif italic, Playfair Display)
   - "— Cristiano Ronaldo" (Montserrat, gold #D4AF37 for "Cristiano Ronaldo")

2. **MIDDLE (image zone):**
   - A background photo (60% width, centred, feathered/faded edges, frost overlay) that crossfades when you hover/click client names
   - 3 rows of scrolling client names overlaid on the image, full viewport width
   - Row 1: 7 names scrolling right → left
   - Row 2: 7 names scrolling left → right
   - Row 3: 6 names scrolling right → left (slower)
   - Names in outlined/stroke text when inactive, solid white fill when active (hover or auto-rotate)
   - Active name also scales up slightly (1.08x) with white glow
   - Font size: clamp(28px, 5.5vw, 72px) — BIG, Garrix-style
   - 3-second auto-rotate between names

3. **BOTTOM (black/empty space):**
   - "Artist Gallery" pill-outline button, centred
   - Hover: white fill, dark text

### Additional Details
- Vertical "ARTISTS" label on far left (writing-mode: vertical-rl, rotated 180deg)
- Thin gradient line below the label
- The image uses `mask-image: radial-gradient(...)` for feathered edges
- Image uses `filter: grayscale(40%) brightness(0.65) contrast(1.1)`
- Frost overlay: `linear-gradient` from top/bottom dark to middle transparent
- Each client name has an associated image that crossfades as background when that name is active

### Current Implementation
The component (`TrustedBySection.tsx`) uses `.lnr-trusted-top`, `.lnr-trusted-middle`, `.lnr-trusted-bottom` divs for the three zones. The CSS in `globals.css` (starting around line 1252) matches this structure.

### Known Issues (from Rory's screenshots, 28 June 2026)
- Quote text and "Trusted by A-list artists" were overlapping the background image instead of sitting in separate black space above it
- "Artist Gallery" pill was overlapping the image instead of sitting in black space below it
- Carousel name text was not enlarged as requested
- Hero logo was changed to white (wrong) — this has been fixed back to teal
- **These issues may or may not be fixed in the current push. The layout needs visual verification.**

### Artist Names (from official EPK — use exactly these)
50 Cent, Bruno Mars, Chris Brown, Dr. Dre & Jimmy Iovine, Drake, Future, Jason Momoa, Jason Statham, Justin Bieber, Kendrick Lamar, Leonardo DiCaprio, Lewis Hamilton, Mick Jagger, **Neymar Jnr** (not "Neymar Jr"), Paul McCartney, Rihanna, Ronaldo, Travis Scott, Usain Bolt, Vin Diesel

---

## 6. SCROLL-REVEAL ANIMATIONS

### What Was Built
`ScrollReveal.tsx` adds CSS classes (`reveal-left`, `reveal-right`, `reveal-scale`, `reveal-fade`) when sections scroll into view. Each section in `page.tsx` has one of these classes.

### What Was Broken
A broken CSS property (`font-family: '"Playfair`) at ~line 962 of `globals.css` created an unclosed string that corrupted all subsequent CSS parsing. The `.reveal-*` animation rules (defined later in the file) were never parsed by the browser, so elements with these classes stayed at `opacity: 0` permanently.

### What Dev2 Fixed
Removed the orphaned CSS block and ~240 lines of orphaned property blocks. This should now work, but **needs visual verification**.

### How It Should Work
- Sections slide in from left, right, or scale up as you scroll down
- Elements start at `opacity: 0` and transition to `opacity: 1` when visible
- Some elements have `data-delay` attributes for staggered reveals

---

## 7. KEY FILES TO KNOW

| File | Purpose |
|------|---------|
| `admin/src/app/page.tsx` | Homepage layout, all sections |
| `admin/src/app/globals.css` | All custom CSS (Garrix + LNR classes) |
| `admin/src/components/TrustedBySection.tsx` | Section 5 component |
| `admin/src/components/ScrollReveal.tsx` | Scroll animation observer |
| `admin/src/components/Loader.tsx` | Loader animation (new) |
| `admin/src/components/HomeContactSection.tsx` | Contact form |
| `admin/src/components/Navbar.tsx` | Nav menu |
| `admin/src/components/AudioTrackList.tsx` | Radio section track player |
| `LNR-REDESIGN-SPEC.md` | Full design spec with Garrix analysis |

---

## 8. WHAT NOT TO DO

- **DO NOT touch the Hero section** (section 2) — Rory has confirmed it multiple times
- **DO NOT touch admin pages** — only public-facing homepage
- **DO NOT change the hero logo colour** — it must be blue/teal (mix-blend-mode: screen with teal drop shadow)
- **DO NOT use pink, red, amber, or green** anywhere on the homepage
- **DO NOT use sharp-cornered buttons** — pill-outline only
- **DO NOT push to `main` branch** — all work on `test`
- **DO NOT touch the Vercel production project** — only the preview project
- **DO NOT add scrolling marquees** except for the client name carousel (Rory approved this one specifically)
- **DO NOT use Lucide icons** — LNR uses custom icons only
- **DO NOT change the showreel section** — it's confirmed

---

## 9. DEPLOYMENT

### Git
- Branch: `test`
- Push to: `origin test`
- Remote: `https://github.com/NueloColab/Late-Night-Ricky.git`

### Vercel (BLOCKED)
- **Production project:** `prj_oivAKZOdTTM9KX2vdzgvdUtgdqsk` (late-night-ricky.vercel.app, builds from `main`)
- **Preview project:** `prj_EpPaJoRs8r5suulN4yrNGCKv5ktS` (lnr-preview.vercel.app, production branch set to `main`)
- **THE PROBLEM:** The preview project's production branch is set to `main`, so pushes to `test` only create SSO-protected preview URLs, NOT the public `lnr-preview.vercel.app` URL
- **FIX NEEDED:** Rory must go to Vercel Dashboard > lnr-preview > Settings > Git > Production Branch and change it from `main` to `test`
- **No Vercel API token available** — can't fix this programmatically
- **Database:** Production DB is `ep-blue-mountain-aba1iy84` (eu-west-2), preview uses `lnr_cms_preview` schema

### How to Verify Changes
1. Push to `origin test`
2. Check Vercel build logs (auto-triggered)
3. Visit `lnr-preview-git-test-nuelo-co-lab.vercel.app` (requires Vercel SSO login)
4. Ask Rory to verify on his device (he can access the SSO-protected URL)

---

## 10. PRIORITY TASKS (in order)

1. **Fix Section 5 (Trusted)** — Verify the layout works: quote in black space above, image+carousel in middle, pill in black space below. The CSS was cleaned up but the visual result has NOT been confirmed on a real browser.

2. **Verify scroll-reveal animations** — The CSS bug is fixed, but confirm animations actually trigger on scroll. Check `.reveal-left`, `.reveal-right`, `.reveal-scale`, `.reveal-fade` classes all work.

3. **Verify loader animation** — Re-enabled as a client component. Confirm it shows "LATE / NIGHT / RICKY" outlined text and fades out properly.

4. **Mobile responsive testing** — Check all sections on mobile viewports (375px, 768px). Current responsive rules exist but haven't been tested.

5. **Continue redesigning remaining sections** — Highlights (6), Collage (7), Radio (9), Share Music CTA (10) can all be improved to match the Garrix editorial style more closely.

6. **Remind Rory about the Vercel branch** — He needs to change lnr-preview production branch from `main` to `test`.

---

## 11. DESIGN REFERENCE

Study `martin2smoove.com` for the Garrix style. Key techniques to replicate:
- Extreme whitespace between sections
- Serif italic for emotional/quote text, sans-serif for UI
- Outlined/stroke text for headings (large, bold, uppercase)
- Photos in B&W with no borders/shadows
- Pill-outline buttons
- Dark sections with editorial serif text
- Parallax-style depth (photos at different visual layers)
- Ghost watermarks behind photos ("RICKY" in huge faded text)
- Deliberate negative space

The full design spec is at: `/home/node/.openclaw/workspace/late-night-ricky/LNR-REDESIGN-SPEC.md`

---

## 12. GIT DISCIPLINE

- **ALWAYS branch from current `test`** — never from `main` or old branches
- **Keep branches small** — cherry-pick unique commits
- **Never push to `origin/main`**
- **Commit messages should be clear and specific** — describe what changed, not just "fix"
- **Brian reviews and pushes to `test`** — but if you're working directly on test, push yourself
- **Report branch base + unique commits** when done

---

## 13. RECENT COMMIT HISTORY (for context)

```
d5c10f0 fix: consolidate trusted CSS, remove broken orphaned rules, fix scroll-reveal, re-enable loader
867536f Section 4: complete restructure - quote above image, carousel over image, pill below, logo restored
013553e Disable loader animation during testing - page goes straight to hero
5a2fa2e Section 4 restructure: quote above image, pill below image, carousel in between, bigger text
28e60c4 Fix: hero logo back to screen blend mode, scroll-reveal animations should now trigger
eb336c8 Section 4: background image positioned lower, carousel names cover image
9fbccff Section 4: bigger carousel font, Artist Gallery pill button, vertical section line on left
93d9b2a Aggressive scroll-reveal animations: sections slide in from left/right/scale/fade
6e4f108 Section 4: Ronaldo name back to normal size, header pushed above image into black space
688e46c Section 4: Ronaldo name in gold/bigger on attribution
338c82e Section 4: split names across 3 rows, frost overlay, gold Ronaldo, header line above image
84f09c5 Section 4: update artist names to match official EPK
dc5ae8a Section 4: faster carousel, names appear once per loop
ba05a0a Section 4: scrolling marquee names (alternate dirs), feathered bg edges
29244a5 Section 4 fixes: moved after Reach, brighter bg, contained image, bolder active names
b06a259 Section 4: Trusted by the Best - Garrix-style interactive names with background crossfade
1db054b Section 3: remove X wedges, keep editorial collage layout
040f2e0 Section 3: Garrix-style editorial collage
2680b4a Loader: outlined/stroke text in 3 lines
```

---

## 14. RULES FROM RORY (confirmed multiple times)

1. No pink, red, amber, or green colours anywhere on the homepage
2. No sharp-cornered buttons — pill-outline only
3. Hero section is DONE, do not touch it
4. The hero logo must be blue/teal, not white
5. Client name carousel IS allowed (Rory explicitly requested it despite "no marquees" in the spec)
6. The only scrolling text is the client name carousel — no other marquees or tickers
7. "Neymar Jnr" not "Neymar Jr"
8. "Dr. Dre & Jimmy Iovine" not just "Dr. Dre"
9. Cristiano Ronaldo's name is gold (#D4AF37) in the attribution, same font size as the rest
10. All photos must be B&W/grayscale
11. Extreme whitespace between sections
12. When something isn't working, STOP and tell Rory. No silent pivots.