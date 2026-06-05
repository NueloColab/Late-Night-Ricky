# LNR Admin vs Nuelo Admin — Full Audit (5 June 2026)

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