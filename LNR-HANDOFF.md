# LNR Website — Handoff Document (2 July 2026)

## Project Overview
- **Client**: Late Night Ricky (DJ/entertainer)
- **Type**: Portfolio website, Martin Garrix-inspired design
- **Repo**: `NueloColab/Late-Night-Ricky` on GitHub
- **Local**: `/home/node/.openclaw/workspace/late-night-ricky/`
- **Production URL**: late-night-ricky.vercel.app
- **Preview URL**: lnr-preview.vercel.app
- **Vercel Projects**: 
  - Production: `prj_oivAKZOdTTM9KX2vdzgvdUtgdqsk` (branch: main)
  - Preview: `prj_EpPaJoRs8r5suulN4yrNGCKv5ktS` (branch: test)
- **Framework**: Next.js (App Router), deployed from `admin/` directory
- **Latest commit**: `9ebb8d2` — "Rename Radio section: 'As Heard On' → 'Music & Mixes', tag → 'Late Night Moments'"
- **Status**: All work committed, clean working tree. No uncommitted changes.

## Page Structure (Top to Bottom)
1. **Navbar** — `<Navbar />` component, fixed top
2. **Hero** — Full-viewport hero with video background, "LATE NIGHT RICKY" title
3. **Showreel** — Video section with play button, "WATCH SHOWREEL" CTA
4. **About** — Dark leather texture background, B&W jacket image with blend mode, noise overlay
5. **Late Night Moments** — `<LateNightMoments />` component, 3x2 grid, B&W images, click for modal with gallery swipe + video. Tag: "Late Night Moments". Title: "Music & Mixes" (renamed from "As Heard On")
6. **Artists (Acts & Private Clients)** — Two-column layout, 20 real artist names from EPK, staggered reveal, carousel
7. **Trusted By / Partner Logos** — `<TrustedBySection />` + `<PartnerLogosSection />`
8. **Venues (Worldwide Performances)** — Two-row infinite marquee with venue names, left-aligned straight lines
9. **Collage** — Garrix-style photo collage with video overlay, play button, perspective parallax
10. **Radio (Music & Mixes)** — `<RadioPlayer />`, streaming audio snippets, "Music & Mixes" section
11. **Share Music CTA** — `<ShareMusicCTA />`
12. **Contact** — `<HomeContactSection />`

## Key Components
All in `admin/src/components/`:
- `LateNightMoments.tsx` — 3x2 grid of moment cards with modal (gallery, video, context)
- `TrustedBySection.tsx` — Artists carousel with staggered reveal
- `ScrollReveal.tsx` — Scroll animation + parallax JS
- `RadioPlayer.tsx` — Audio player with 5 snippets
- `ShareMusicCTA.tsx` — CTA section
- `VideoShowreelSection.tsx` — Showreel video
- `MoodBoardSection.tsx` — Mood board
- `PartnerLogosSection.tsx` — Partner logos
- `HomeContactSection.tsx` — Contact form
- `Footer.tsx` — Footer
- `Navbar.tsx` — Navigation

## Brand & Design
- **Style**: Dark, editorial, Garrix-inspired
- **Palette**: Steel blue (#1B3A4C), midnight navy (#0a0e17), accent light steel (#6B8FAB), cream/parchment for moments section
- **Typography**: Oswald (headings), Inter/Geist (body), Rockybilly (script/brand)
- **Font files**: Rockybilly.ttf/woff/woff2 in `admin/public/assets/`
- **Noise texture**: SVG fractalNoise overlay on multiple sections
- **Animations**: Scroll reveal, staggered reveals, parallax, collage video overlay

## Tech Stack
- Next.js 14 (App Router)
- PostgreSQL via Drizzle ORM
- Cloudinary for media
- Resend for emails
- Vercel deployment
- Entry point: `admin/src/app/page.tsx`
- Styles: `admin/src/app/globals.css` (all CSS in one file, Garrix-style classes)
- DB schema: `admin/src/db/` (Drizzle)
- API routes: `admin/src/app/api/`

## Branch Strategy
- `main` = production (deploys to late-night-ricky.vercel.app)
- `test` = preview (deploys to lnr-preview.vercel.app)
- Both Vercel projects have `rootDirectory: "admin"`

## Known Issues / TODO
- Collage layout needs further refinement to match Garrix reference
- Gallery snippet animation may need testing on live site
- Highlights sticky stacking needs verification on mobile
- Client hasn't provided final assets (photos, videos, copy) — most are still placeholders
- Video in Late Night Moments modal uses a sample clip, needs real content

## Recent Changes (29 June - 2 July)
- Full Garrix-inspired redesign
- Late Night Moments: 3x2 B&W grid with modal (gallery swipe + video)
- Artists section: two-column layout with real EPK data
- Venues: infinite marquee with left-aligned straight lines
- Collage: perspective parallax + video overlay
- Radio renamed to "Music & Mixes"
- Animated V arrow scroll prompt
- About section: dark leather texture, noise overlay, B&W jacket with blend mode
- All builds passing, deployed to production

## How to Resume Work
1. Read this file first
2. Read `admin/src/app/page.tsx` for the full page structure
3. Read `admin/src/app/globals.css` for all styles
4. Check `git log --oneline -20` for recent changes
5. Run `npm run dev` from `admin/` to start local dev server
6. Push to `main` for production deploys, `test` for preview