import { pgTable, text, integer, real, serial, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";

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
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  status: text("status").default("new"),
  notes: text("notes"),
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
  lineItems: jsonb("line_items").default([]),
  subtotal: real("subtotal").default(0),
  taxRate: real("tax_rate").default(0),
  total: real("total").default(0),
  status: text("status").default("draft"),
  paymentTerms: text("payment_terms").default("net-30"),
  pdfUrl: text("pdf_url"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  expiryDate: text("expiry_date"),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  invoiceNumber: text("invoice_number").notNull().unique(),
  lineItems: jsonb("line_items").default([]),
  subtotal: real("subtotal").default(0),
  taxRate: real("tax_rate").default(0),
  total: real("total").default(0),
  status: text("status").default("draft"),
  pdfUrl: text("pdf_url"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  paidAt: timestamp("paid_at", { mode: "date" }),
  dueDate: text("due_date"),
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

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  order: integer("order").default(0),
  title: text("title").notNull(),
  filePath: text("file_path"),
  duration: text("duration").default("0:30"),
  spotifyUrl: text("spotify_url"),
  appleMusicUrl: text("apple_music_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
