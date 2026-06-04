# Late Night Ricky — CMS + CRM Architecture (Revised)

## What We're Building

A **content management system** that mirrors the frontend page-for-page, section-for-section, plus the project/quote/invoice pipeline on top. Ricky logs in, edits text, uploads images/videos, hits save — the live site updates instantly. All current content is pre-populated so nothing is re-entered.

---

## Frontend → CRM Mapping

| Frontend Page | Frontend Section | CRM Section | What Ricky Can Edit |
|--------------|------------------|-------------|-------------------|
| **index.html** | Hero (wordmark + bg image) | **Home → Hero** | Upload wordmark PNG, upload hero background image/video |
| | Video section | **Home → Showreel Video** | Upload/replace video file, edit heading text |
| | Geographic Reach | **Home → Reach** | Edit headline, subtext |
| | Recent Shows & Stories (4 cards) | **Home → Shows** | Edit each card: image, venue, location, season, title, description. Reorder cards. |
| | Partnerships (quote + logos) | **Home → Partners** | Edit Ronaldo quote, upload/replace 7 partner logos |
| | Radio / As Heard On | **Home → Radio** | Upload portrait image, edit text, edit Spotify/Apple Music/YouTube links |
| | Clients (celeb names) | **Home → Clients** | Edit 20 celeb names, edit venue ticker text |
| | Share Music | **Home → Share Music** | Edit form intro text, toggle on/off |
| | Contact / Footer | **Home → Contact** | Edit email, Instagram link, footer text |
| **about.html** | Split portrait + bio | **About Page** | Upload portrait image, edit bio paragraphs, edit stats (Grammy, Platinum, etc.) |
| **showreel.html** | Video + cards | **Showreel Page** | Upload main video, edit cards (image, title, date, description) |
| **contact.html** | Contact form | **Contact Page** | Edit email, form fields toggle |
| **Nav + Global** | Logo, nav links | **Global → Nav** | Upload nav logo, toggle nav links on/off, edit link labels |
| | Meta / SEO | **Global → SEO** | Edit page titles, meta descriptions, favicon |

---

## Data Model (CMS Tables)

```typescript
// Each section = one row, JSON blob for flexible fields
siteSections: {
  id,
  page: "home"|"about"|"showreel"|"contact"|"global",
  section: "hero"|"video"|"reach"|"shows"|"partners"|"radio"|"clients"|"share-music"|"contact"|"nav"|"seo"|"bio",
  content: JSON,        // all text fields for this section
  images: JSON,        // { fieldName: imagePath } map
  videos: JSON,        // { fieldName: videoPath } map
  links: JSON,         // { fieldName: url } map
  order: number,       // for sortable sections/cards
  isActive: boolean,   // toggle section on/off
  updatedAt,
  updatedBy
}

// Reusable image/video assets library
assets: {
  id,
  filename,
  originalName,
  type: "image"|"video"|"audio",
  size,
  path,
  thumbnailPath,      // for videos
  usedIn: JSON,        // [{page, section, field}]
  uploadedAt
}

// Show cards (separate table for easier reordering + querying)
showCards: {
  id,
  order,
  imagePath,
  venue,
  location,
  season,
  title,
  description,
  href,
  isActive
}

// Partner logos
partnerLogos: {
  id,
  order,
  imagePath,
  name,
  href,
  isActive
}

// Client names (celeb grid)
clientNames: {
  id,
  order,
  name,
  isActive
}

// Venue ticker (comma-separated in CMS, parsed to array)
venueTicker: {
  id,
  venues: string[]     // ["LIV", "Hakkasan", "Ministry of Sound", ...]
}

// Music submissions (from public upload form)
submissions: {
  id, email, artistName, trackTitle, filePath, fileSize, status, notes, createdAt
}

// Projects / Quotes / Invoices (pipeline CRM)
projects: { id, clientId, title, type, status, venue, eventDate, fee, notes, createdAt }
quotes: { id, projectId, lineItems[], total, status, pdfUrl }
invoices: { id, projectId, invoiceNumber, total, status, pdfUrl, paidAt }
clients: { id, name, email, phone, instagram, notes, totalBookings, totalRevenue }

// Admin user
users: { id, pinHash, name, email }
```

---

## CRM Pages & Routes

| Route | What It Shows |
|-------|--------------|
| `/admin/login` | PIN entry |
| `/admin/dashboard` | Site overview: last updated section, submission count, pending projects, quick links to each page editor |
| `/admin/pages/home` | **Section list** — Hero, Video, Reach, Shows, Partners, Radio, Clients, Share Music, Contact. Click a section = edit panel slides in. |
| `/admin/pages/about` | About editor — portrait upload + bio text (rich text or plain) |
| `/admin/pages/showreel` | Showreel editor — video upload + showreel cards |
| `/admin/pages/contact` | Contact editor — email, form toggle |
| `/admin/global/nav` | Nav logo upload, nav link labels, show/hide toggles |
| `/admin/global/seo` | Page titles, meta descriptions, favicon |
| `/admin/media` | **Media library** — all uploaded images/videos. Search, filter by type, see where each is used. Upload new. |
| `/admin/submissions` | Music inbox — play, download, mark status |
| `/admin/projects` | Pipeline kanban (from original plan) |
| `/admin/quotes` | Quote builder |
| `/admin/invoices` | Invoice list |
| `/admin/clients` | Contact book |
| `/admin/settings` | Change PIN, tax rate, quote template |

---

## CMS Editor UI Pattern

**Layout:**
- Left sidebar: Page list (Home, About, Showreel, Contact, Global, CRM)
- Center: Section list for selected page (cards with preview thumbnail + section name + last edited)
- Right panel (slides in): Editor for selected section

**Section Editor Panel:**
- Section preview thumbnail (live preview of how it looks on site)
- Text fields: label + textarea/input
- Image fields: thumbnail + "Replace" button → opens media library or upload
- Video fields: same pattern
- Link fields: label + URL input with "test link" icon
- Reorder handle for cards/lists
- "Save" button (auto-saves draft, publish on save)
- "View on site" link

**Media Library:**
- Grid of thumbnails
- Upload dropzone (drag & drop)
- Filter: All / Images / Videos
- Search by filename
- Click to select for insertion
- Show "Used in: Home → Shows card 2" badge

---

## Pre-Population Strategy

On first install / migration:

1. **Read current `index.html`, `about.html`, `showreel.html`, `contact.html`**
2. **Extract text content** into `siteSections.content` JSON
3. **Map image paths** (`assets/...`) into `siteSections.images` JSON
4. **Map video paths** into `siteSections.videos` JSON
5. **Parse show cards** from HTML into `showCards` table
6. **Parse partner logos** from HTML into `partnerLogos` table
7. **Parse client names** from HTML into `clientNames` table
8. **Parse venue ticker** into `venueTicker` table

**Result:** Ricky logs in on day 1, everything is already filled in. He edits text, swaps images, saves.

---

## How the Frontend Reads CMS Data

Two approaches — pick one:

### Option A: Static Generation (Recommended)
- Build time: Next.js reads from SQLite → generates static HTML
- Ricky edits → hits "Publish" → triggers rebuild → Vercel redeploys in ~30s
- Pros: Fastest site, no DB queries on load, works with current static hosting
- Cons: 30s delay between edit and live

### Option B: Dynamic Rendering
- Site is Next.js app, each page fetches from API on load
- Edits are instant (no rebuild)
- Pros: Real-time updates
- Cons: Slightly slower loads, needs API running

**Recommendation:** Option A. A 30-second delay is fine for a DJ website. Keeps it simple and fast.

---

## Build Order (Revised)

### Phase 1: Foundation (Week 1)
1. Next.js scaffold + Drizzle + SQLite
2. PIN auth (copy ListMe bouncer)
3. Data models: `siteSections`, `showCards`, `partnerLogos`, `clientNames`, `venueTicker`, `assets`
4. Migration script: parse current HTML → seed database
5. Media library page + upload API

### Phase 2: CMS Editors (Week 2)
6. Home page section editor (all 9 sections)
7. About page editor
8. Showreel page editor
9. Contact + Global editors
10. Frontend API routes → serve CMS data as JSON

### Phase 3: Frontend Becomes Dynamic (Week 3)
11. Refactor `index.html` → Next.js page reading from CMS
12. Refactor `about.html`, `showreel.html`, `contact.html`
13. Image/video delivery from `/uploads/` or API
14. Test: edit in CMS → verify on live site

### Phase 4: CRM + Extras (Week 4)
15. Music submissions (public form + admin inbox)
16. Project pipeline kanban
17. Quote/invoice builder
18. Polish, mobile admin, settings

---

## Key Decisions

| Question | Answer |
|----------|--------|
| **Separate repo or same?** | Same repo, `/admin/` folder in existing project. One Vercel project with `/admin/*` routes protected by auth. |
| **Frontend stays static HTML or becomes Next.js?** | Must become Next.js to read from DB. Or we generate static HTML from CMS on publish. |
| **Images/videos: local or cloud?** | Local `/uploads/` for MVP. Cloud (R2/S3) when storage grows. |
| **Pre-population: manual or scripted?** | Scripted — parse current HTML automatically. |
| **Show cards: fixed 4 or unlimited?** | Unlimited. Reorder, add new, archive old. |
| **Undo/version history?** | Phase 2 — skip for MVP. |

---

## What Changes on the Frontend

- Currently: hardcoded HTML + CSS
- After: Next.js (or static generator) that reads from SQLite
- URLs stay the same: `/`, `/about`, `/showreel`, `/contact`
- Images served from `/uploads/` instead of `/assets/`
- Current `assets/` folder becomes seed content, then deprecated

---

## Verdict

This is a **full CMS rebuild** — not just an admin panel on the side. The frontend must become dynamic to read from the database. This is bigger than the original CRM-only plan, but it's the right call if Ricky needs to self-manage content.

**Trade-off:** 3-4 week build vs. the original 2-week CRM-only build. But once done, Ricky never needs a developer to change text or swap an image again.
