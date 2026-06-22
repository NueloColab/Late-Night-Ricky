# LNR Editorial Baseline — Snapshot v191 (22 June 2026)

**Status:** Archived baseline. Preserved before premium/exciting redesign pivot.
**Tag:** `v191-editorial-archive` on GitHub

---

## What This Design Looks Like

### Overall Aesthetic
- **Dark, editorial, minimal** — navy (`#1B3A4C`) and near-black (`#0a0f14`) palette
- **Serif typography** — Georgia for headlines, clean sans-serif for UI
- **Flat color sections** — solid white or dark backgrounds, no gradients or imagery on most sections
- **High contrast** — white text on dark, black text on white, minimal accent colors
- **Black-and-white hero** — grayscale portrait with navy overlay

### Key Visual Elements
1. **Centered logo** — "Late Night Ricky" script in fixed top-center
2. **Circle hamburger** — white pill button top-right, unified across mobile/desktop
3. **Full-screen menu overlay** — dark background with radial navy glow, staggered serif links
4. **Hero section** — grayscale photo, navy overlay, large serif headline left-aligned, scroll indicator
5. **Video section** — fullscreen looping video with "Watch Showreel" CTA
6. **Reach section** — solid navy block, large headline, Grammy badge, partner quote
7. **Shows grid** — white background, large card images with dark overlay, venue names
8. **Partners section** — dark navy, centered quote, white brand logos in 3-column grid
9. **Music section** — white background, split layout (photo + track list + streaming links)
10. **Clients section** — white background, large bold names in grid, "Trusted By The Best"
11. **Reach out section** — dark split layout, "Let's collaborate" with signature script, grayscale photo
12. **Contact form** — white background, split (photo + form), minimal fields

### Typography
- Headlines: `font-family: 'Georgia', serif` — large, tracking-tight, uppercase
- Body: System sans-serif, uppercase, tracking wide, small size (13px labels)
- Signature: `Rockybilly` cursive font for personal touches

### Color Palette
- Primary navy: `#1B3A4C`
- Accent silver: `#8FA8BE`
- Dark backgrounds: `#0a0f14`, `#0c1218`, `#111`
- White sections: `#fff` with `#E3E8ED` borders
- Text: `#111` on light, `#fff` on dark, `#5B7A8E` muted

### What Makes It "Editorial"
- Flat solid-color sections (no textures, gradients, or imagery behind text)
- Serif headlines feel magazine-like
- Minimal color — mostly monochrome with navy as the only accent
- Clean grid layouts, generous whitespace
- No animated effects beyond menu transitions and video
- Professional but restrained — reads as "serious artist" rather than "high-energy performer"

---

## Why It Works as a Reusable Template
- Clean component structure (Navbar, ScrollReveal, AudioTrackList, PartnerLogosSection, etc.)
- CMS-driven content via API routes
- Responsive grid system
- Admin panel with content editors
- Well-organized file structure, full-stack Next.js 14 + Drizzle + Postgres

---

## To Revert to This Design
```bash
git checkout v191-editorial-archive
# or create a branch from it:
git checkout -b editorial-revival v191-editorial-archive
```

---

**Snapshot created:** 22 June 2026 by Dev2
**Tag:** `v191-editorial-archive`
