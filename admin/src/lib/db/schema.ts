import { pgTable, text, integer, real, serial, jsonb, boolean, timestamp, date } from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  views: integer("views").default(1),
  uniqueVisitors: integer("unique_visitors").default(1),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  pinHash: text("pin_hash").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const siteSections = pgTable("site_sections", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  section: text("section").notNull(),
  content: jsonb("content"),
  images: jsonb("images"),
  videos: jsonb("videos"),
  links: jsonb("links"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  isVisible: boolean("is_visible").default(true),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const showCards = pgTable("show_cards", {
  id: serial("id").primaryKey(),
  order: integer("order").default(0),
  imagePath: text("image_path"),
  venue: text("venue").notNull(),
  location: text("location").notNull(),
  season: text("season").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  href: text("href").default("#"),
  momentId: text("moment_id"),
  isActive: boolean("is_active").default(true),
});

export const partnerLogos = pgTable("partner_logos", {
  id: serial("id").primaryKey(),
  order: integer("order").default(0),
  imagePath: text("image_path"),
  name: text("name").notNull(),
  href: text("href"),
  isActive: boolean("is_active").default(true),
});

export const clientNames = pgTable("client_names", {
  id: serial("id").primaryKey(),
  order: integer("order").default(0),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
});

export const venueTicker = pgTable("venue_ticker", {
  id: serial("id").primaryKey(),
  venues: jsonb("venues").default([]),
});

export const carouselImages = pgTable("carousel_images", {
  id: serial("id").primaryKey(),
  order: integer("order").default(0),
  imagePath: text("image_path"),
  alt: text("alt").default(""),
  page: text("page").default("home"),
  isActive: boolean("is_active").default(true),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  type: text("type").notNull(),
  size: integer("size"),
  path: text("path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  usedIn: jsonb("used_in"),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  artistName: text("artist_name"),
  trackTitle: text("track_title"),
  genre: text("genre"),
  bpm: integer("bpm"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  instagramHandle: text("instagram_handle"),
  status: text("status").default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'booking' | 'private_message'
  name: text("name").notNull(),
  email: text("email").notNull(),
  clubName: text("club_name"),
  city: text("city"),
  fee: text("fee"),
  eventDate: text("event_date"),
  message: text("message"),
  status: text("status").default("new"), // new, read, replied, archived
  notes: text("notes"),
  replies: jsonb("replies").default([]),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  title: text("title").notNull(),
  type: text("type").default("dj-booking"),
  status: text("status").default("inquiry"),
  venue: text("venue"),
  eventDate: text("event_date"),
  fee: real("fee"),
  currency: text("currency").default("GBP"),
  notes: text("notes"),
  description: text("description"),
  priority: text("priority").default("medium"),
  deadline: text("deadline"),
  progress: integer("progress").default(0),
  services: jsonb("services").default([]),
  team: jsonb("team").default([]),
  files: jsonb("files").default([]),
  tasks: jsonb("tasks").default([]),
  moodBoard: jsonb("mood_board").default([]),
  contractNumber: text("contract_number"),
  quoteId: integer("quote_id"),
  invoiceId: integer("invoice_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  clientCompany: text("client_company"),
  projectTitle: text("project_title"),
  lineItems: jsonb("line_items").default([]),
  notes: text("notes"),
  subtotal: real("subtotal").default(0),
  taxRate: real("tax_rate").default(0),
  vatEnabled: boolean("vat_enabled").default(true),
  discount: jsonb("discount").default({ enabled: false, type: 'friends-family', percent: 10, amount: 0 }),
  total: real("total").default(0),
  status: text("status").default("draft"),
  paymentTerms: text("payment_terms").default("net-30"),
  paymentTermsType: text("payment_terms_type").default("net-30"),
  paymentTermsLabel: text("payment_terms_label").default("Net 30"),
  paymentMethod: text("payment_method").default("bank-transfer"),
  paymentSchedule: jsonb("payment_schedule").default([]),
  pdfUrl: text("pdf_url"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  emailSentAt: timestamp("email_sent_at", { mode: "date" }),
  expiryDate: text("expiry_date"),
  acceptToken: text("accept_token"),
  convertedToInvoice: boolean("converted_to_invoice").default(false),
  invoiceId: integer("invoice_id"),
  quoteNumber: text("quote_number"),
});

export const invoiceTemplates = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  clientCompany: text("client_company"),
  projectTitle: text("project_title"),
  lineItems: jsonb("line_items").default([]),
  notes: text("notes"),
  taxRate: real("tax_rate").default(20),
  vatEnabled: boolean("vat_enabled").default(true),
  discount: jsonb("discount").default({ enabled: false, type: 'friends-family', percent: 10, amount: 0 }),
  paymentTermsType: text("payment_terms_type").default("net-30"),
  paymentTermsLabel: text("payment_terms_label").default("Net 30"),
  paymentMethod: text("payment_method").default("bank-transfer"),
  paymentSchedule: jsonb("payment_schedule").default([]),
  ccEmails: text("cc_emails"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  clientCompany: text("client_company"),
  projectTitle: text("project_title"),
  performanceDate: text("performance_date"),
  invoiceNumber: text("invoice_number").notNull().unique(),
  lineItems: jsonb("line_items").default([]),
  notes: text("notes"),
  subtotal: real("subtotal").default(0),
  taxRate: real("tax_rate").default(0),
  vatEnabled: boolean("vat_enabled").default(true),
  discount: jsonb("discount").default({ enabled: false, type: 'friends-family', percent: 10, amount: 0 }),
  total: real("total").default(0),
  status: text("status").default("draft"),
  paymentTerms: text("payment_terms").default("net-30"),
  paymentTermsType: text("payment_terms_type").default("net-30"),
  paymentTermsLabel: text("payment_terms_label").default("Net 30"),
  paymentMethod: text("payment_method").default("bank-transfer"),
  paymentSchedule: jsonb("payment_schedule").default([]),
  pdfUrl: text("pdf_url"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  emailSentAt: timestamp("email_sent_at", { mode: "date" }),
  paidAt: timestamp("paid_at", { mode: "date" }),
  dueDate: text("due_date"),
  paymentToken: text("payment_token"),
  paymentConfirmedByClient: boolean("payment_confirmed_by_client").default(false),
  paymentConfirmedAt: timestamp("payment_confirmed_at", { mode: "date" }),
  paymentConfirmation: jsonb("payment_confirmation").default({}),
  quoteId: integer("quote_id"),
  ccEmails: text("cc_emails"),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  instagram: text("instagram"),
  notes: text("notes"),
  totalBookings: integer("total_bookings").default(0),
  totalRevenue: real("total_revenue").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const moodBoards = pgTable("mood_boards", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  shareToken: text("share_token"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const moodBoardPins = pgTable("mood_board_pins", {
  id: serial("id").primaryKey(),
  boardId: integer("board_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  positionX: integer("position_x").default(0),
  positionY: integer("position_y").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  order: integer("order").default(0),
  title: text("title").notNull(),
  filePath: text("file_path"),
  coverPath: text("cover_path"),
  duration: text("duration").default("0:30"),
  spotifyUrl: text("spotify_url"),
  appleMusicUrl: text("apple_music_url"),
  youtubeUrl: text("youtube_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Royalties ───
export const royalties = pgTable("royalties", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  source: text("source").notNull(), // spotify, apple_music, sync, performance, publishing, other
  amount: real("amount").default(0),
  currency: text("currency").default("GBP"),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  streams: integer("streams"),
  status: text("status").default("pending"), // pending, received, forecast
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Contracts ───
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  fileUrl: text("file_url"),
  status: text("status").default("draft"), // draft, sent, signed, expired, cancelled
  contractType: text("contract_type").default("general"), // dj_booking, production, remix, sync, management, other
  signedAt: timestamp("signed_at", { mode: "date" }),
  expiryDate: text("expiry_date"),
  terms: text("terms"),
  counterpartyName: text("counterparty_name"),
  counterpartyEmail: text("counterparty_email"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ─── Referrals ───
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  commission: real("commission").default(0),
  commissionPercent: real("commission_percent"),
  status: text("status").default("active"), // active, paid, cancelled
  paidAt: timestamp("paid_at", { mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ─── Show Pages ───
export const showPages = pgTable("show_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  location: text("location").notNull(),
  season: text("season").notNull(),
  description: text("description"),
  heroImage: text("hero_image"),
  setLength: text("set_length"),
  galleryImages: jsonb("gallery_images").default([]),
  testimonials: jsonb("testimonials").default([]),
  content: jsonb("content").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});
