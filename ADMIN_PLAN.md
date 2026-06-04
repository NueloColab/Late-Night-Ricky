# Late Night Ricky — Admin Backend + CRM Plan

## Overview
Lightweight admin dashboard for project/quote/invoice pipeline + music submission inbox. Cherry-picks patterns from ListMe (PIN auth, Drizzle, card layouts). Designed to feel premium — steel blue, bold type, zero clutter.

---

## Project Pipeline Flow

```
INQUIRY → QUOTED → APPROVED → IN PROGRESS → COMPLETED → INVOICED → PAID
   ↑        ↑         ↑            ↑            ↑           ↑         ↑
  Email   You send  Client       You do       You wrap    You bill  Client
  comes   quote     agrees       the work     it up       them      pays
  in                              the gig
```

Each stage = a column. Cards drag between columns. Click a card = full detail view.

---

## Data Model (Drizzle/SQLite)

```typescript
// Users — single admin account
users: { id, pinHash, name, email, createdAt }

// Clients — contact book
clients: { id, name, email, phone, instagram, notes, totalBookings, totalRevenue, createdAt }

// Projects — the pipeline
projects: {
  id, clientId, title, type ("dj-booking"|"production"|"remix"|"consulting"),
  status ("inquiry"|"quoted"|"approved"|"in-progress"|"completed"|"invoiced"|"paid"),
  venue, eventDate, fee, currency, notes, quoteId, invoiceId, createdAt, updatedAt
}

// Quotes — line items + PDF
quotes: {
  id, projectId, lineItems: {desc, qty, rate, total}[],
  subtotal, taxRate, total, status ("draft"|"sent"|"approved"|"rejected"),
  pdfUrl, sentAt, expiryDate
}

// Invoices — mirror of quotes, numbered
invoices: {
  id, projectId, invoiceNumber, lineItems[],
  subtotal, taxRate, total, status ("draft"|"sent"|"paid"|"overdue"),
  pdfUrl, sentAt, paidAt, dueDate
}

// Music Submissions — fan/artist uploads
submissions: {
  id, email, artistName, trackTitle, filePath, fileSize, fileType,
  status ("new"|"reviewed"|"shortlisted"|"rejected"), notes, createdAt
}
```

---

## Admin Pages & Routes

| Route | What It Does |
|-------|-------------|
| `/admin/login` | PIN entry. Simple bcrypt, no NextAuth. Session cookie. |
| `/admin` | Dashboard — 4 stat cards (active projects, new submissions this week, monthly revenue, pending quotes). Below: recent activity feed. |
| `/admin/projects` | Kanban board. 7 columns = pipeline stages. Drag cards. Filter by type (DJ/Production/Remix). |
| `/admin/projects/[id]` | Project detail. Client info, event date, venue, fee, notes, linked quote/invoice, status changelog. |
| `/admin/quotes` | Quote list. "New Quote" button → pick client/project → line item builder → preview → generate PDF. |
| `/admin/invoices` | Invoice list. Numbered sequentially (LNR-001, LNR-002...). Mark paid, download PDF, resend. |
| `/admin/submissions` | Music inbox. Filter: New / Reviewed / Shortlisted / Rejected. Inline audio player. Download button. Bulk select. |
| `/admin/clients` | Contact book. Search. Click = client profile with full booking history + total spent. |
| `/admin/settings` | Change PIN, set tax rate, default quote terms, invoice footer text. |

---

## Frontend Additions (Public Site)

### 1. "Share Your Music" Page `/share-music`
- Form: Email (required), Artist Name, Track Title, File upload (MP3/WAV, max 20MB)
- Drag-and-drop zone with steel blue border
- Success: "Track received — we'll be in touch"
- Files saved to `uploads/submissions/YYYY-MM/`

### 2. "As Heard On" Player Section (index.html)
- 5 snippet cards in a horizontal scroll/grid
- Each: track title, play/pause button, fake waveform visual (CSS bars), duration
- Uses existing `assets/snippet-1.mp3` etc.

---

## Design Direction

- **Palette:** Same as frontend — `#1B3A4C` steel blue, `#8FA8BE` light steel, `#E3E8ED` cream, white, black
- **Fonts:** Playfair Display (headers) + Inter (body)
- **Cards:** White on cream, 16px radius, subtle shadow
- **Status badges:** Steel blue pills, no green/red/orange
- **Tables:** Clean, no zebra striping, hover highlight only
- **Kanban:** Minimal columns, cards show client + event + fee
- **Nav:** Left sidebar on desktop, bottom tab bar on mobile

**Reference vibe:** Your attached screenshots — bold type, steel blue accents, portrait splits, clean hierarchy.

---

## Tech Stack

- **Framework:** Next.js 14 App Router (same as ListMe)
- **DB:** SQLite via `better-sqlite3` (simple, no external service) or Postgres if you want cloud
- **ORM:** Drizzle (cherry-pick from ListMe `lib/db/schema.ts` + actions pattern)
- **Auth:** bcrypt PIN in cookie session (cherry-pick from ListMe bouncer)
- **PDF:** `react-pdf` or `@react-pdf/renderer` for quote/invoice generation
- **Uploads:** Local disk for now (`/uploads/`). Easy to swap to R2/S3 later.
- **Audio:** Native HTML5 `<audio>` with custom play button styling

---

## Cherry-Pick from ListMe/Nuelo

| What We Need | Where It Lives in ListMe |
|-------------|-------------------------|
| PIN auth pattern | `lib/auth/pin.ts`, bouncer cookie session |
| Drizzle schema + actions | `lib/db/schema.ts`, `lib/db/actions/` |
| Card component structure | Dashboard cards, bouncer event cards |
| Status badge styling | Event status pills (adapted to steel blue) |
| File upload handling | Mother dashboard image upload |
| Table layout | Admin tables (events, bookings, etc.) |
| PDF generation pattern | `react-pdf` usage if any, or build fresh |

---

## Build Order (Suggested)

1. **Scaffold Next.js app** in `/admin/` or separate repo
2. **Set up Drizzle + SQLite** — copy ListMe schema pattern
3. **Build PIN login** — copy bouncer auth, single user
4. **Dashboard shell** — sidebar nav, stat cards, empty states
5. **Clients page** — simplest CRUD, gets you data flowing
6. **Projects kanban** — the core pipeline
7. **Quote builder + PDF** — line items, preview, download
8. **Invoice mirror** — clone quote logic, add numbering
9. **Submissions inbox** — file upload API, list view, audio player
10. **Frontend: Share Music form** — wire to submission API
11. **Frontend: Snippet player** — CSS bars + audio element

---

## Open Questions

1. **Hosting:** Same Vercel project as frontend, or separate? (Same = shared domain, easier. Separate = cleaner separation.)
2. **Invoicing:** Do you want Stripe integration for online payment, or just generate PDF and he sends it manually?
3. **Email:** Should quotes/invoices auto-email from the system, or just download and he sends himself?
4. **Submissions storage:** Local disk OK for now, or do you want cloud storage from day 1?

---

**Verdict:** This is a solid ~2-week build if we cherry-pick aggressively from ListMe. The kanban + quote builder are the heaviest lifts. Everything else is CRUD with nice styling.
