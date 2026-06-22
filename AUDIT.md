# LNR Admin vs Nuelo Admin — Full Audit (5 June 2026)

---

# LNR Technical Health Audit (15 June 2026)
**Status:** Audit only — no changes made. Pending client feedback before fixes.

## Deployment Health
- **Preview URL:** https://late-night-ricky.vercel.app — live, returning 200 ✅
- **Build:** TypeScript clean (no errors) ✅
- **Lint:** Only warnings, no errors ✅
- **Git:** Clean working tree, latest commit `v187-mobile` ✅

## Critical Issues

**1. `next.config.mjs` hardcodes absolute local path**
The webpack alias override points to `/home/node/.openclaw/workspace/late-night-ricky/admin/src`. Next.js already resolves `@` via `tsconfig.json` — this override is unnecessary and will break on Vercel (path won't exist).

**2. Cloudinary credentials exposed in source**
`src/lib/storage.ts` lines 8-10 contain hardcoded `cloud_name`, `api_key`, and `api_secret` in plaintext.

**3. Migration system is untracked / broken**
`drizzle/meta/_journal.json` only knows about migration `0000_fat_shaman`. Migrations `0024` through `0029` exist as raw SQL files but are not registered in the journal. Two files are both numbered `0028`. If you run `drizzle-kit migrate` on a fresh DB, none of the quote/invoice/enquiry/show-page columns get created.

**4. Show Pages feature is half-wired**
- Admin CRUD exists, DB table exists, API routes exist.
- BUT: only 4 hardcoded static pages exist (`/show-sidemen`, `/show-abu-dhabi`, `/show-gin-juice`, `/show-royal-wedding`). There is no dynamic `[slug]` route. Creating a new show page in admin won't create a public-facing page unless a developer manually adds a new `.tsx` file.

## High Issues

**5. Dual auth system (one is dead code)**
- Active: `src/lib/auth.ts` — uses `lnr_session`, DB-backed users, hardcoded seed PIN `7291`
- Dead code: `src/lib/auth/index.ts` — uses `lnr_admin_session`, defaults `ADMIN_PIN` to `"0000"`, never imported anywhere
- Some API routes try reading both cookies as a fallback workaround. The dead file should be removed.

**6. Hardcoded initial PIN in active auth**
`src/lib/auth.ts` hardcodes `PIN = '7291'` for auto-creating the admin user. Visible in source.

## Medium Issues

**7. Missing local env variables**
`.env.local` only has `DATABASE_URL`, `POSTGRES_URL`, `BLOB_READ_WRITE_TOKEN`. Missing for local dev: `RESEND_API_KEY`, `SMTP_FROM`, `NEXT_PUBLIC_SITE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

**8. No error boundaries**
No custom `not-found.tsx` or `error.tsx` in the app.

**9. `src/lib/api.ts` fragile on local dev**
Falls back to empty string if `ADMIN_API_URL` and `VERCEL_URL` are missing. Server-side `fetch` with relative URLs can be unreliable in Next.js server components.

**10. Console noise in client bundles**
Multiple `console.log` / `console.error` statements in client components (track upload flow, submissions, settings, etc.).

## Low / Polish Issues

**11. Image optimization warnings**
ESLint flags 20+ uses of raw `<img>` instead of Next.js `<Image />` across show pages, showreel, navbar, components.

**12. `HomeContactSection.tsx` — `useEffect` missing dependency**
Missing dependencies on `contactInfo.email` and `contactInfo.image`.

**13. Show pages use generic fallback images**
The static show pages pull `heroImage` from the DB, but the photo grid sections all use hardcoded generic images instead of the `galleryImages` field that exists in the schema.

**14. `showPages.galleryImages` and `testimonials` in schema are unused**
Defined in DB schema but never rendered anywhere.

## Summary Table

| Area | Status | Notes |
|---|---|---|
| Build / TS / Lint | ✅ Clean | Warnings only, no fatal errors |
| Preview deployment | ✅ Live | 200 OK |
| Auth | ⚠️ Messy | Dead code file, hardcoded seed PIN |
| Database migrations | 🔴 Broken | Journal out of sync with SQL files |
| Show Pages (public) | 🔴 Half-built | No dynamic route — admin creates orphaned records |
| Show Pages (admin) | ✅ Works | CRUD + API functional |
| Cloudinary | 🔴 Exposed | Hardcoded credentials in `storage.ts` |
| next.config | 🔴 Fragile | Hardcoded absolute path alias |
| Email (Resend) | ✅ Configured | Memory confirms Vercel env set |
| Quotes / Invoices | ✅ Functional | Accept, convert, payment tokens |
| Enquiries | ✅ Functional | Modal, reply thread, convert |
| Dashboard | ✅ Functional | Stats, revenue, recent activity |
| Mobile responsiveness | ✅ Fixed | v187 addressed hamburger + padding |
| SEO / Nav editors | ✅ Functional | Global nav + meta editable |

## Recommended Fix Priority Order
1. Remove or fix webpack alias in `next.config.mjs` — highest deployment risk
2. Rotate Cloudinary credentials and move them to env vars — security
3. Fix migration journal — regenerate Drizzle migrations or switch to tracked workflow
4. Add dynamic show page route (`/show/[slug]/page.tsx`) or remove the admin feature until it's wired
5. Delete dead auth file (`src/lib/auth/index.ts`)
6. Add `not-found.tsx` and `error.tsx` — polish
7. Clean up console statements — polish

---


## Structure Comparison

| Feature | Nuelo Admin | LNR Admin | Gap |
|---------|------------|-----------|-----|
| Dashboard | Stats, calendar, site activity, quick actions | Stats, upcoming gigs, calendar, quick actions, recent activity | **CLOSE** - LNR now has calendar + gig data |
| Content Hub | Section-by-section cards with preview tags, grouped (Pages, Global, Media), seed DB button | Flat grid of boxes with icons, no section preview tags, no seed button | **GAP** - LNR needs section tags, seed button, clearer grouping |
| Projects | 1992 lines. Full detail panel with services, team assignments, mood board, file uploads, contracts, tasks, progress bar, linked quotes/invoices | Kanban + detail page with financial cards, status workflow, quotes/invoices tables | **MAJOR GAP** |
| Quotes | Table with status filters, QuoteDetail modal (603 lines) with line items, send, PDF, status workflow | Table with create/view modals, line items, payment terms, status workflow | **MODERATE** - LNR has most features but detail modal less polished |
| Invoices | Table with InvoiceDetail modal (687 lines), payment, PDF, status workflow | Table with create/view, payment status, PDF download | **MODERATE** - similar to quotes |
| Clients | 957 lines. Client list + detail page with related projects/quotes/invoices | Client list + detail page with contact, stats, related items | **CLOSE** |
| Messages/Inbox | Full messages page with table, status, reply | Submissions page (music sub inbox) | **N/A** - different concept |
| Staff | Staff management page | None | **N/A** - not needed for DJ |
| Suppliers | Supplier management + link to projects | None | **N/A** - not needed for DJ |
| Tasks | Task management page | None | **N/A** - could be useful |
| Settings | Settings page exists | Settings page exists (basic) | **LOW** |
| Shows | N/A (not DJ-specific) | Show cards management | LNR-only feature |
| Media | N/A (Nuelo uses Cloudinary) | Media library page | LNR-only feature |

## Detailed Gap Analysis

### 1. Content Hub (HIGH PRIORITY)

**Nuelo**: Each page card shows:
- Icon with colored background (not bordered box)
- Page title in serif font
- Description text
- Section tags as small pills (e.g. "Hero", "Marquee", "About", "Services", "CTA")
- Grouped into "Pages", "Global Settings" sections
- Database Setup/Seed section at top
- 3-column grid on desktop

**LNR**: Flat 2-column grid of cards:
- Icon in rounded container with tint background
- Title + description
- No section tags
- No seed/initialise button
- Global Settings and Media are separate groups but same visual weight

**Fix needed**: Add section tags to each content card, add seed button, better visual grouping.

### 2. Project Detail (HIGHEST PRIORITY)

**Nuelo** (1992 lines) has:
- **Progress bar** - visual percentage indicator
- **Services section** - add service line items with status (Pending/In Progress/Delivered), linked to service categories
- **Team assignments** - add team members with role, fee, payment terms, notes; staff list integration
- **Mood board** - image grid with Cloudinary upload, drag reorder
- **Files & deliverables** - upload files (PDFs, images, MP3s) with phase categorisation, upload progress bar
- **Contracts** - linked contract with send/resend functionality
- **Tasks** - add tasks with assignee, due date, phase, completion checkbox
- **Linked quote/invoice** - show related quote with status
- **Client info** - client name, email, company in overview
- **Deadline tracking** - overdue indicators with days remaining
- **Priority** - High/Medium/Low badges

**LNR** (360 lines) has:
- Financial summary cards (Agreed Fee, Total Quoted, Total Invoiced, Outstanding)
- Status workflow buttons
- Edit form (title, status, type, venue, date, fee, notes)
- Quotes table
- Invoices table

**Missing entirely from LNR**:
1. Services / line items per project
2. Team assignments
3. Mood board / image gallery
4. File & document uploads (contracts, MP3s)
5. Task management
6. Progress bar
7. Contract linking
8. Deadline tracking
9. Priority levels
10. Client info in detail view

### 3. Dashboard (CLOSE)

LNR dashboard now has calendar, upcoming gigs, gig modal, stats, quick actions. This is close to Nuelo's quality.

**Minor gaps**:
- Nuelo shows site activity (CMS edits), LNR shows recent activity from site_sections updates
- Nuelo has more client-focused stats. LNR is DJ-focused which is correct.

### 4. Quotes (MODERATE)

**LNR has**: Line items, tax, payment terms, status workflow (Draft → Sent → Accepted/Declined → Create Invoice), project linking, view modal

**Missing**:
- Friends & Family discount toggle (Nuelo specific, not needed for LNR)
- Email sending (neither has this fully working)
- PDF generation (API exists but no UI download button in list view)

### 5. Invoices (MODERATE)

**LNR has**: Create with line items, view modal, Mark Paid/Unpaid, PDF download

**Missing**:
- Invoice detail page/route (Nuelo has `/invoices/[id]` route)
- Payment confirmation detail view
- Overdue status visual indicators

### 6. Invoices/Quotes Detail Views

Nuelo has dedicated route-based detail pages (`/quotes/[id]`, `/invoices/[id]`). LNR uses modals, which is acceptable but less navigable.

### 7. DB Schema Gaps

LNR projects table lacks:
- `description` (text)
- `priority` (text)
- `deadline` (date)
- `progress` (integer 0-100)
- `services` (jsonb array)
- `team` (jsonb array)
- `files` (jsonb array)
- `tasks` (jsonb array)
- `moodBoard` (jsonb array)
- `contractNumber` (text)
- `clientName` (text) - currently only has `clientId`

## Priority Order for Dev Work

### Phase 1 — Match Nuelo Structure (Highest Impact)
1. **Content Hub polish** — Add section tags, seed button, better grouping
2. **Project Detail overhaul** — Services, progress bar, deadline, priority, team, files, mood board
3. **DB migration** — Add missing columns to projects table

### Phase 2 — Matching Quality
4. **Invoice/Quote detail pages** — Route-based detail views
5. **File upload system** — Document/contract/MP3 upload with phase tagging
6. **Overdue indicators** — Deadline tracking visual feedback

### Phase 3 — Nice to Have
7. **Task management** within projects
8. **Contract send/resend**
9. **Mood board drag-reorder**