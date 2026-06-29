# LNR Homepage Redesign — Handoff Brief for Dev2

## Project Overview
**Project:** Late Night Ricky (LNR) website homepage redesign
**Client:** Rory May / Nuelo
**Design Direction:** Martin Garrix-inspired editorial style (martin2smoove.com)
**Repo:** `/home/node/.openclaw/workspace/late-night-ricky/`
**Branch:** `test` (all work goes here)
**Live Preview:** `lnr-preview-git-test-nuelo-co-lab.vercel.app` (requires Vercel SSO login)
**Production Site:** `late-night-ricky.vercel.app` (builds from `main` branch — DO NOT TOUCH)

## Key Files
- `admin/src/app/page.tsx` — homepage layout, all sections
- `admin/src/app/globals.css` — all custom CSS (Garrix-style classes + LNR classes)
- `admin/src/app/globals/trusted.css` — Trusted section CSS (separate file, appended to globals.css)
- `admin/src/components/TrustedBySection.tsx` — Trusted section component
- `admin/src/components/ScrollReveal.tsx` — scroll-reveal animation component
- `admin/src/components/HomeContactSection.tsx` — contact form
- `admin/src/components/Navbar.tsx` — navigation
- `admin/src/components/AudioTrackList.tsx` — radio section track player

## CRITICAL: Vercel Deployment Blocker
The `lnr-preview` Vercel project has its production branch set to `main`, NOT `test`. This means pushes to `test` create SSO-protected preview URLs, but `lnr-preview.vercel.app` still shows old code. **Rory needs to change this in Vercel Dashboard > lnr-preview > Settings > Git > Production Branch from `main` to `test`.** Until he does, you can only verify changes via the git preview URL.

## Current Section Order (top to bottom)
1. **Loader** — Currently DISABLED (commented out in page.tsx). Outlined/stroke text "LATE / NIGHT / RICKY" with scramble animation. Re-enable when design is finalised.
2. **Hero** — Full-viewport hero with grayscale photo, LNR logo (mix-blend-mode: screen, teal drop shadow), "Scroll" indicator. **DO NOT TOUCH** (per Rory).
3. **Showreel** — Video section with outlined "LATE NIGHT RICKY" text and "WATCH SHOWREEL" pill button.
4. **Reach** — Garrix-style editorial collage: portrait photo (left), dark card with serif quote (overlapping right), secondary texture strip (bottom right), ghost "RICKY" watermark.
5. **Trusted by the Best** — Interactive section with background photo, client name carousel. **BROKEN — NEEDS FIXING (see below)**.
6. **Highlights** — Stacking show cards with vertical "HIGHLIGHTS" label.
7. **Collage** — Asymmetric photo scatter with ghost "RICKY" watermark.
8. **Life is Crazy banner** — Outlined text "LATE NIGHT RICKY".
9. **Radio** — Music section with image, EQ bars, AudioTrackList.
10. **Share Music CTA** — Background image with overlay, serif heading, pill button.
11. **Contact** — Contact form (HomeContactSection component).
12. **Footer** — 4-column footer grid.

## Design System (LOCKED IN)
- **Colours:** Dark navy (#0a0e17) backgrounds, white text, #D4AF37 gold for Ronaldo attribution only
- **Typography:** Playfair Display (serif, for quotes/emotion), Montserrat (sans-serif, for UI/labels), Oswald (for carousel names)
- **Buttons:** Pill-outline style (rounded-full, thin border), NOT sharp corners
- **Photos:** B&W/grayscale, no shadows, no rounded corners
- **Whitespace:** Extreme — 150-200px+ between sections (Garrix-style)
- **NO scrolling marquees** (per spec), BUT Rory explicitly requested scrolling carousel for client names, so it stays
- **Outlined/stroke text** for inactive carousel names, solid white fill for active (Rory confirmed)
- **Hero logo:** `mix-blend-mode: screen` with `filter: brightness(0) invert(1)` and teal drop shadow `rgba(168, 213, 240, 0.4)` — appears blue/teal on dark bg. DO NOT change to white.

## Section 5 (Trusted) — CURRENTLY BROKEN
This is the main thing that needs fixing. Here's what's wrong:

### What Rory Wants
The section should be a clear vertical stack:
1. **TOP (black space):** "Trusted by A-list artists..." header + "The best DJ I've heard" quote + gold "Cristiano Ronaldo" attribution
2. **MIDDLE:** Background image (60% width, centred, feathered edges, frost overlay) with 3 rows of scrolling client names (outlined text, full viewport width) layered on top of it
3. **BOTTOM (black space):** "Artist Gallery" pill button

### What's Broken
The CSS had duplicate selectors from multiple edits, and the layout was using `position: absolute` for the image container, causing content to overlap the image instead of sitting in separate black spaces above/below it. I've just pushed a restructure (commit 867536f) that uses a flex column layout with three children (`.lnr-trusted-top`, `.lnr-trusted-middle`, `.lnr-trusted-bottom`), but it hasn't been visually verified yet.

### Specific Issues from Rory's Screenshots (28 June)
1. Quote text and "Trusted by A-list artists" line were overlapping the image instead of sitting in black space above it
2. "Artist Gallery" pill was overlapping the image instead of sitting in black space below it
3. Carousel names (BRUNO MARS, CHRIS BROWN etc.) were not enlarged as requested — should be `clamp(28px, 5.5vw, 72px)`
4. Hero logo appeared white instead of blue/teal — **now fixed** (restored teal drop shadow)

### Trusted Section Component Structure
```
<section className="lnr-trusted-section">
  <div className="lnr-trusted-label">ARTISTS</div>  <!-- vertical label -->
  <div className="lnr-trusted-line" />  <!-- thin line -->
  <div className="lnr-trusted-top">  <!-- BLACK SPACE ABOVE -->
    <p className="lnr-trusted-header">Trusted by A-list artists...</p>
    <div className="lnr-trusted-quote">
      <h2 className="lnr-trusted-quote-text">"The best DJ I've heard."</h2>
      <p className="lnr-trusted-attribution">— <span>Ronaldo</span></p>
    </div>
  </div>
  <div className="lnr-trusted-middle">  <!-- IMAGE + CAROUSEL -->
    <div className="lnr-trusted-bg-container">  <!-- absolute positioned, 60% wide -->
      <div className="lnr-trusted-frost" />
      <!-- background images that crossfade on hover/active -->
    </div>
    <div className="lnr-trusted-names">  <!-- 3 scrolling rows of outlined names -->
      <div className="lnr-trusted-row lnr-trusted-row-forward">...</div>
      <div className="lnr-trusted-row lnr-trusted-row-reverse">...</div>
      <div className="lnr-trusted-row lnr-trusted-row-forward-slow">...</div>
    </div>
  </div>
  <div className="lnr-trusted-bottom">  <!-- BLACK SPACE BELOW -->
    <a className="lnr-trusted-gallery-pill">Artist Gallery</a>
  </div>
</section>
```

### Known CSS Issues
- The CSS for this section is split between `globals.css` and `globals/trusted.css`. The trusted.css file is APPENDED to globals.css via `cat >>` which was a mistake — it should be a proper `@import` or the CSS should be consolidated into globals.css directly.
- There may still be duplicate/overlapping CSS rules. Clean this up.
- The `::before` and `::after` pseudo-elements for the section were replaced by dedicated `.lnr-trusted-label` and `.lnr-trusted-line` divs. Make sure the old `::before`/`::after` rules don't still exist.

## Scroll-Reveal Animations
A `ScrollReveal` component was added (`admin/src/components/ScrollReveal.tsx`) that adds CSS classes (`reveal-left`, `reveal-right`, `reveal-scale`, `reveal-fade`) when sections scroll into view. These are applied via `revealClass` prop on sections. **NOT YET VERIFIED ON LIVE SITE** — Rory reported zero animations visible.

## Loader
Commented out in `page.tsx`. It shows "LATE / NIGHT / RICKY" with outlined stroke text and scramble animation. Re-enable once the page design is finalised and stable.

## Artist Names (from official EPK)
- Use "Neymar Jnr" (not "Neymar Jr")
- Use "Dr. Dre & Jimmy Iovine" (not just "Dr. Dre")
- Full list: 50 Cent, Bruno Mars, Chris Brown, Dr. Dre & Jimmy Iovine, Drake, Future, Jason Momoa, Jason Statham, Justin Bieber, Kendrick Lamar, Leonardo DiCaprio, Lewis Hamilton, Mick Jagger, Neymar Jnr, Paul McCartney, Rihanna, Ronaldo, Travis Scott, Usain Bolt, Vin Diesel

## Git Discipline
- **ALWAYS branch from current `test`**, never from `main` or old branches
- **NEVER push to origin/test directly** unless you're sure. Brian reviews and pushes.
- Keep branches small, cherry-pick unique commits
- Report branch base + unique commits

## What Needs Doing (Priority Order)
1. **Fix Section 5 (Trusted)** — Make the layout work: quote in black space above, image with carousel overlaid, pill in black space below. Verify on actual preview URL.
2. **Fix scroll-reveal animations** — They're not triggering on the live site. Debug the ScrollReveal component.
3. **Re-enable loader** — Once page is stable, uncomment the loader animation in page.tsx.
4. **Mobile responsive testing** — Check all sections on mobile viewports.
5. **Continue redesigning remaining sections** — Highlights, Collage, Radio, etc. can all be improved to match the Garrix editorial style.
6. **Clean up CSS** — Consolidate trusted section CSS (remove `globals/trusted.css` and put it all in `globals.css` properly, remove any duplicate rules).
7. **Vercel deployment** — Remind Rory to change production branch from `main` to `test` in the lnr-preview Vercel project settings.

## Reference Files
- Design spec: `/home/node/.openclaw/workspace/late-night-ricky/LNR-REDESIGN-SPEC.md`
- Garrix design system: `/home/node/.openclaw/workspace/memory/garrix-design-system-reference.md`
- Memory file: `/home/node/.openclaw/workspace/memory/2026-06-27-lnr-redesign-v2.md`
- Memory file: `/home/node/.openclaw/workspace/memory/2026-06-26b-lnr-vercel-deployment.md`