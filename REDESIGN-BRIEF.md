# Late Night Ricky CMS Redesign Brief

## Problem
The current CMS/admin panel is a generic, corporate-looking form interface that doesn't match the front-end's premium dark editorial aesthetic. Rory's explicit instruction:

**"Match Nuelo CRM structure and quote/invoice flow TO A T, then adjust the design to match LNR."**

So the priority is: **function/structure first** (copy Nuelo), **then theme** (dark LNR style).

## PHASE 1: Match Nuelo CRM Structure (DO THIS FIRST)

Reference codebase: `/home/node/.openclaw/workspace/nuelo-client-mgmt/`

### What Nuelo CRM Has That LNR Needs

**Dashboard** (`/nuelo-client-mgmt/app/admin/page.jsx` - 981 lines)
- Stats cards at top (total revenue, active projects, pending quotes, etc)
- Recent activity feed
- Calendar widget with events (invoices due, project deadlines, meetings)
- Quick actions (+ New Project, + New Quote, + New Invoice)
- Status badges colour system (draft=silver, sent=steel blue, accepted=bronze, declined=burnt orange)

**Quotes** (`quotes/page.jsx` + `QuoteForm.jsx` + `QuoteDetail.jsx` + `QuotesTable.jsx`)
- Table view with status filter tabs + search
- Quote builder MODAL with line items, auto-calculating totals
- Quote detail/view modal
- Status workflow: Draft → Sent → Accepted/Declined
- Client autocomplete when creating quote
- PDF download

**Invoices** (`invoices/page.jsx` + `InvoiceForm.jsx` + `InvoiceDetail.jsx` + `InvoicesTable.jsx`)
- Table view with status filter + search
- Invoice builder MODAL with line items, subtotal, tax, total
- Invoice detail/view modal
- Status workflow: Draft → Sent → Paid
- Client autocomplete when creating invoice
- Link invoices to projects
- PDF download

**Projects** (`projects/page.jsx` - 500+ lines)
- TABLE/LIST view (not just kanban - Nuelo has a proper table)
- Detailed project view with services breakdown, team assignment, notes
- Status badges: Active, In Progress, On Hold, Completed, Cancelled
- Priority indicators (high/medium/low)
- Service categories
- Deadline tracking with overdue highlighting
- Client link on each project

**Clients** (`clients/page.jsx` + `clients/[id]/page.jsx`)
- Client list with search
- Client detail view showing related projects, quotes, invoices
- Contact info (name, email, phone, company)

**Sidebar/Navigation** (`AdminSidebar.jsx`)
- Main items: Overview, Messages, Projects, Quotes, Invoices, Clients
- Bottom items: Settings
- Clean icons, grouped logically
- Active state highlighting

### Nuelo Design Language to Copy (then retheme in Phase 2)
- Serif headings (`font-serif font-light`)
- `tracking-widest text-xs uppercase` for labels
- Status badges: pill-shaped with subtle tinted backgrounds
  - Bronze: `#91715c` for accepted/active states
  - Steel blue: `#5c7a94` for sent/in-progress
  - Burnt orange: `#c4632e` for declined/overdue
  - Muted: `#666` for draft/cancelled
- Framer Motion animations for page transitions
- Stats cards with icon backgrounds
- Modal system for create/edit (not inline forms)
- Calendar widget on dashboard

### LNR Adaptations (in Phase 1)
- Replace "Suppliers" nav item with "Shows" (DJ gig listings)
- Replace "Messages" with "Submissions" (music submissions inbox)
- Project types should include: DJ Booking, Album Release, Track/Single Release, Remix Project, Mix/Podcast, Brand Partnership, Live Stream, Consulting
- Add optional project fields: genre, bpm, streams, platforms, releaseDate

## PHASE 2: Dark Theme Conversion (AFTER structure matches Nuelo)

Once the structure matches Nuelo, retheme everything to LNR's dark editorial front-end:
- Background: #0A0A0A (deep black, NO grey)
- Surface/cards: #111318 or #1A1D24
- Text primary: #FFFFFF, secondary: #8FA3B3, muted: #5A6A7A
- Borders: #2A2E36 (subtle dark borders)
- Accent: #1B3A4C for active/selected states only
- Headings: Playfair Display serif (same as front-end)
- Body/labels: Inter sans-serif, uppercase tracking-widest
- Form inputs: dark bg (#1A1D24), subtle borders (#2A2E36), white text
- Status badges: same Nuelo logic but on dark backgrounds (tinted not solid)
- NO light grey (#E3E8ED) anywhere
- NO bright green/red/orange accents (use the bronze/steel blue/burnt orange system)

## PHASE 3: Mobile Fixes
- Add env(safe-area-inset-bottom) padding
- Fix Safari bottom bar overlap
- Fix horizontal table truncation on narrow screens
- Test every page at 375px width

## Database Credentials
Host: ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech
DB: lnr_cms
Connection: postgresql://neondb_owner:npg_Ic2BXrqLTa0S@ep-blue-mountain-aba1iy84-pooler.eu-west-2.aws.neon.tech/lnr_cms?sslmode=require

## Vercel
Project: prj_oivAKZOdTTM9KX2vdzgvdUtgdqsk
URL: https://late-night-ricky.vercel.app
Root directory: admin
Blob token: vercel_blob_rw_JQMq48agnqlLtkXg_iG9GHxj02oUt6uHJJW7gy12gee1pbs
Admin PIN: 0000

## Files to Work On
Codebase: `/home/node/.openclaw/workspace/late-night-ricky/admin/`

Key files:
- `src/app/admin/layout.tsx` - sidebar + shell
- `src/app/admin/page.tsx` - dashboard
- `src/app/admin/projects/page.tsx` - projects
- `src/app/admin/quotes/page.tsx` - quotes
- `src/app/admin/invoices/page.tsx` - invoices
- `src/app/admin/clients/page.tsx` - clients
- `src/app/admin/submissions/page.tsx` - submissions (was "Messages")
- `src/app/admin/settings/page.tsx` - settings
- `tailwind.config.ts` - theme tokens

## DO NOT
- Do NOT change the front-end (website) code
- Do NOT remove existing functionality
- Do NOT push to git - Brian reviews and pushes
- Test with `cd /home/node/.openclaw/workspace/late-night-ricky/admin && npx next build` before saying done