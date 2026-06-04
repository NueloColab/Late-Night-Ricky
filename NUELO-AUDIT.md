# Nuelo vs LNR Admin Audit — 5 June 2026

## NUELO ADMIN — Full Breakdown

### Sidebar Structure
- **Fixed 280px** white sidebar, left side
- **Logo** at top: Nuelo logo image + "Admin Portal" text with horizontal dividers
- **Main items** (top, no grouping labels):
  - Overview (LayoutDashboard icon)
  - Messages (Mail icon)
  - Projects (FileText icon)
  - Quotes (Quote icon) — note: custom icon component
  - Invoices (Receipt icon)
  - Clients (Users icon)
  - Suppliers (Truck icon)
- **Bottom section** in a **separate grey box** (bg-gray-50, border):
  - Staff (Users icon)
  - CMS (PenTool icon)
  - Case Studies (FolderOpen icon)
  - Nuelo Edit (Newspaper icon)
  - Edit Store (ShoppingBag icon)
  - Ad Banners (Image icon)
  - Settings (Settings icon)
- **Logout** button at very bottom, full width, bordered
- **Active state**: black background, white text
- **Hover**: bg-gray-100
- **Animation**: framer-motion slide-in on mobile, stagger animation on items

### Dashboard (`/admin`, 981 lines)
- **Stats cards row** (4 cards):
  - Total Clients (Users icon, bronze bg)
  - Total Revenue (PoundSterling, bronze)
  - Projects Active (FolderOpen, steel blue)
  - Quotes Pending (FileText, steel blue)
- **Two-column layout**:
  - **Left (8 columns)**: Recent Activity feed
    - Each item: coloured dot, title, description, time ago, arrow icon
    - Categories: new client, new project, new quote, invoice, payment
  - **Right (4 columns)**: Calendar Widget
    - Fully interactive month calendar
    - Click a day to see events (invoices due, project deadlines, quote sends, meetings)
    - Prev/next month navigation
    - Colour-coded event dots on days
    - Links to relevant admin pages
- **Site Activity Card** (below calendar):
  - Period toggle (7D/30D/12M/All)
  - Mini bar chart showing page views
  - Metrics: Page Views, Edit Views, Enquiries, Quotes Created
- **Quick Actions Card**:
  - Create Quote, New Project, Create Invoice (linked buttons)

### Projects (`/admin/projects`, 1992 lines)
- **Header**: "Projects" serif heading, "Project Management" subtitle, "+ New Project" button
- **Stats cards** (4): Total Projects, Active, Deadline Soon (red), Total Revenue
- **Filter bar**: Search input + Status dropdown (All/Active/In Progress/On Hold/Completed/Cancelled)
- **List view** (each project is a full card, not a table row):
  - Project name (large serif heading)
  - Client name below
  - Status badge (colour-coded pill)
  - Priority badge (High/Medium/Low, colour-coded)
  - Deadline info (overdue = red, soon = amber, future = green)
  - Services section (expandable): service name, category, price, status
  - Team section: assigned team members with roles
  - Mood board section (image uploads)
  - Action buttons: Edit, Create Quote, Create Invoice, View Client, Delete
- **New/Edit Project Modals**:
  - Full form with: name, client autocomplete, description, deadline, priority, status
  - Services section with add/remove, category selector, price
  - Team member assignment
- **Quote/Invoice creation**: Can create directly from project detail

### Quotes (`/admin/quotes`, 356 lines page + 550 QuoteForm + 603 QuoteDetail + 486 QuotesTable)
- **Header**: "Quotes" serif heading, "Quote Management" subtitle with divider, "+ New Quote" button
- **Stats cards** (4): Total Quotes, Sent, Accepted, Total Value
- **Filter bar**: Search + Status filter dropdown
- **Table view** with columns: Quote #, Client, Amount, Status, Date, Actions
- **Actions per row**: View, Edit, Delete
- **Create/Edit Modal** (QuoteForm, 550 lines):
  - Client autocomplete (search-as-you-type)
  - Client company & email auto-filled from selection
  - Project title field
  - Services section with add/remove, category selector, price per service
  - **Service categories**: Brand Creation & Development, Brand Communication & Activation, Tech & Digital Solutions, Investment Growth & Advisory
  - Friends & Family discount toggle (10%)
  - VAT toggle with rate input
  - Payment terms selector (Due on Receipt, Net 7/14/30/60, 50/50 Split, 25/50/25, Dev Standard, Custom)
  - Payment schedule preview (auto-generated based on terms)
  - Totals box: Subtotal, Discount, VAT, Total
  - Notes field
- **Quote Detail Modal** (QuoteDetail, 603 lines):
  - Full quote preview with client info, services table, totals
  - Status change buttons (Draft → Sent → Accepted/Declined)
  - Send email button
  - Edit button
  - PDF download

### Invoices (`/admin/invoices`, 336 lines page + 733 InvoiceForm + 687 InvoiceDetail + 522 InvoicesTable)
- **Same pattern as Quotes**: header, stats, table, filter, actions
- **Stats cards** (4): Total Invoices, Awaiting Payment, Paid Value, Overdue
- **Create/Edit Modal** (InvoiceForm, 733 lines):
  - Client autocomplete + project link
  - Line items with add/remove
  - Subtotal, tax rate, total
  - Due date
  - Status selector
- **Invoice Detail Modal** (InvoiceDetail, 687 lines):
  - Full invoice preview
  - Status workflow buttons (Draft → Sent → Paid)
  - Payment confirmation
  - PDF download

### Clients (`/admin/clients`, 957 lines page + 1561 [id] detail)
- **List view**:
  - Stats cards (Total Clients, Active, Total Revenue, etc.)
  - Search + Status filter + Industry filter
  - Grid of client cards (not table):
    - Client name, company, industry tag, status badge
    - Email, phone, address icons
    - Revenue, projects count
    - Actions: View, Edit, Delete
- **Client Detail Modal** (from list page):
  - Edit mode toggle
  - Full client info display
- **Client Detail Page** (`/admin/clients/[id]`, 1561 lines!):
  - Back arrow + client name
  - Edit/Save toggle
  - Client info section: name, company, email, phone, address, industry, status, source, tags
  - **Related Quotes section**: list of client's quotes with amount, status, date
  - **Related Invoices section**: list of client's invoices with amount, status, due date
  - **Related Projects section**: list of client's projects with deadline, status
  - **Notes section**: client notes with add/remove
  - **Documents section**: uploaded files (briefs, contracts, etc.)

### Messages (`/admin/messages`, 773 lines)
- Message/conversation list
- Message detail view
- Mark as read/unread
- Reply functionality

### Other Nuelo Pages:
- **Suppliers** (798 lines): CRUD with categories, similar to clients
- **Tasks** (81 lines): Simple task list
- **Contracts** (255 lines): Contract management
- **Staff** (243 lines): Staff management
- **Settings** (195 lines): Business settings, tax rate, quote template
- **CMS** (multi-page): Home, About, Services, Why Nuelo, Contact, Navigation, Case Studies
- **Nuelo Edit**: Magazine content management
- **Nuelo Edit Store**: Product/order management for magazine store

---

## LNR ADMIN — Current State

### Sidebar
- ✅ White background, 280px width
- ✅ Logo: "Late Night Ricky" serif + "Admin Portal" label with dividers
- ✅ Main items with Lucide icons: Overview, Submissions, Projects, Quotes, Invoices, Clients
- ✅ Bottom section in grey box: Media, Shows, Content, Settings
- ✅ Logout at bottom
- ✅ Active state: black bg, white text
- ✅ Mobile hamburger + slide-in overlay
- ❌ Missing: Framer-motion animations (not critical, no framer-motion dependency)

### Dashboard (`/admin`, 185 lines)
- ❌ **WAY TOO SIMPLE** vs Nuelo (981 lines)
- Has: Stats cards (sections, assets, submissions, projects)
- Has: Quick actions, Recent activity, Pending projects
- **MISSING**: Calendar widget with events
- **MISSING**: Revenue stats, client count, quote/invoice counts
- **MISSING**: Site activity card with period toggle
- **MISSING**: Activity feed linking to specific quotes/invoices/projects

### Projects (`/admin/projects`, 262 lines)
- ✅ Kanban board with pipeline stages
- ✅ Mobile list view with status dropdowns
- ✅ Stats cards (total, inquiries, in progress, value)
- ✅ DJ/music producer project types
- ❌ **MISSING**: Table/list view toggle (Nuelo has card-based list with expandable details)
- ❌ **MISSING**: Detailed project view page (`/admin/projects/[id]`)
- ❌ **MISSING**: Service line items per project
- ❌ **MISSING**: Team member assignment
- ❌ **MISSING**: Mood board section
- ❌ **MISSING**: Create Quote/Invoice from project
- ❌ **MISSING**: Priority badges
- ❌ **MISSING**: Deadline tracking/overdue highlighting
- ❌ **MISSING**: Client link on project card

### Quotes (`/admin/quotes`, 524 lines)
- ✅ Stats cards (Total, Sent, Accepted, Total Value)
- ✅ Search + Status filter
- ✅ Table view with columns
- ✅ Modal-based create with line items + auto-totals
- ✅ View modal with quote detail
- ❌ **MISSING**: Client autocomplete (just project dropdown, no client name/email search)
- ❌ **MISSING**: Quote detail modal with status workflow (Draft → Sent → Accepted/Declined)
- ❌ **MISSING**: Edit quote modal
- ❌ **MISSING**: Friends & Family discount toggle
- ❌ **MISSING**: VAT/tax toggle with rate
- ❌ **MISSING**: Payment terms selector with schedule preview
- ❌ **MISSING**: PDF download
- ❌ **MISSING**: Send email functionality
- ❌ **MISSING**: Service category selector

### Invoices (`/admin/invoices`, 524 lines — just rebuilt)
- ✅ Stats cards (Total, Awaiting Payment, Paid, Overdue)
- ✅ Search + Status filter
- ✅ Table view
- ✅ Modal-based create with line items + auto-totals + tax
- ✅ View modal
- ✅ Status workflow dropdown in table
- ✅ PDF download link
- ❌ **MISSING**: Invoice detail modal with full preview (Nuelo has 687 lines for this)
- ❌ **MISSING**: Client autocomplete
- ❌ **MISSING**: Payment confirmation button
- ❌ **MISSING**: Edit invoice modal

### Clients (`/admin/clients`, ~300 lines — just rebuilt)
- ✅ Stats cards (Total, Bookings, Revenue)
- ✅ Search
- ✅ Table view with view/edit/delete
- ✅ Modal-based create/edit
- ❌ **MISSING**: Client detail page (`/admin/clients/[id]`) — Nuelo has 1561 lines!!
- ❌ **MISSING**: Status filter (lead/active/completed/inactive)
- ❌ **MISSING**: Industry filter
- ❌ **MISSING**: Client card grid (Nuelo uses cards, not just table)
- ❌ **MISSING**: Related quotes/invoices/projects on client page
- ❌ **MISSING**: Industry tags, source tracking
- ❌ **MISSING**: Delete confirmation modal
- ❌ **MISSING**: Client status badges

### Pages LNR Has That Nuelo Doesn't:
- ✅ Content editing: Home, About, Showreel, Contact pages
- ✅ Global: Nav & Logo, SEO
- ✅ Media Library
- ✅ Submissions (music inbox)
- ✅ Shows page (DJ gigs)

---

## GAP ANALYSIS — What Needs Building

### Priority 1: Structural (must have)
1. **Client Detail Page** (`/admin/clients/[id]`) — 1561 lines in Nuelo
   - Client info, edit mode toggle
   - Related Quotes section
   - Related Invoices section
   - Related Projects section
   - Notes section
   
2. **Quote Detail/View Modal** — full quote preview with status workflow buttons
   - Draft → Sent → Accepted/Declined buttons
   - PDF download
   - Edit quote option

3. **Invoice Detail/View Modal** — full invoice preview
   - Status workflow: Draft → Sent → Paid
   - Payment confirmation
   - PDF download
   - Edit invoice option

4. **Client Autocomplete** — search-as-you-type when creating quotes/invoices

### Priority 2: Important (should have)
5. **Dashboard improvement** — add calendar widget, revenue stats, activity feed
6. **Project Detail Page** (`/admin/projects/[id]`) — services, team, mood board
7. **Payment Terms** in quote builder — due on receipt, net 30, 50/50, etc. with schedule preview
8. **Friends & Family discount** toggle in quotes
9. **VAT toggle** in quotes and invoices with rate input

### Priority 3: Nice to have
10. **Framer-motion animations** — sidebar stagger, page transitions
11. **Site activity card** on dashboard with period toggle
12. **Staff page** (LNR probably doesn't need this)
13. **Suppliers** (LNR doesn't need this — replaced by Shows)
14. **Contracts page** (could add later)

---

## DESIGN SYSTEM — Nuelo's Visual Language

### Colours
- **Primary headings**: `#1a1a1a` (near-black)
- **Secondary text**: `#666`
- **Muted text/labels**: `#999`
- **Steel blue accent**: `#5c7a94` (buttons, active states, sent status)
- **Bronze/warm accent**: `#91715c` (accepted status, headings divider, CTA)
- **Burnt orange**: `#c4632e` (declined, overdue, deadline alerts)
- **Green**: `#2d8a4e` (paid, completed)
- **Background**: `#f8f7f6` (warm off-white)
- **Surface/cards**: `white` with `border border-gray-200` or `border-gray-100`
- **Status badges**: tinted-bg + matching text (e.g., `bg-[#91715c]/10 text-[#91715c]`)
- **Divider lines**: `#5c7a94` (steel blue) for accent dividers

### Typography
- **Page headings**: `text-3xl md:text-4xl font-serif font-light text-[#1a1a1a]` (Playfair Display, light weight)
- **Section labels**: `text-xs uppercase tracking-widest text-[#5c7a94] font-medium` (Inter, uppercase)
- **Subheadings**: `text-lg font-serif font-light text-[#1a1a1a]`
- **Stat numbers**: `text-2xl font-serif font-semibold`
- **Stat labels**: `text-[10px] uppercase tracking-[0.15em] text-[#8FA8BE] font-medium`
- **Card headers**: `text-sm font-semibold text-gray-900 uppercase tracking-wide`

### Components
- **Stats cards**: White bg, subtle border, icon in coloured square (bg-[accent]/15), number in serif, label in tiny tracking-wide uppercase
- **Buttons**: Primary = `bg-[#5c7a94] text-white rounded-md`, Secondary = `border border-gray-300 text-gray-700 rounded-md`
- **Input fields**: White bg, border-gray-200, rounded-md, focus:ring-2 focus:ring-[#5c7a94]
- **Modals**: White bg, max-w-5xl, shadow-2xl, close button top-right, serif title
- **Tables**: White bg, border-gray-100, rounded corners, hover:bg-[#f8f7f6]
- **Status badges**: Rounded-full pills, tiny text, uppercase tracking-wide, tinted background