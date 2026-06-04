import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  pinHash: text("pin_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const siteSections = sqliteTable("site_sections", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  page: text("page", { enum: ["home", "about", "showreel", "contact", "global"] }).notNull(),
  section: text("section").notNull(),
  content: text("content", { mode: "json" }),
  images: text("images", { mode: "json" }),
  videos: text("videos", { mode: "json" }),
  links: text("links", { mode: "json" }),
  order: integer("order").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const showCards = sqliteTable("show_cards", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  order: integer("order").default(0),
  imagePath: text("image_path"),
  venue: text("venue").notNull(),
  location: text("location").notNull(),
  season: text("season").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  href: text("href").default("#"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const partnerLogos = sqliteTable("partner_logos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  order: integer("order").default(0),
  imagePath: text("image_path"),
  name: text("name").notNull(),
  href: text("href"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const clientNames = sqliteTable("client_names", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  order: integer("order").default(0),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const venueTicker = sqliteTable("venue_ticker", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  venues: text("venues", { mode: "json" }).$defaultFn(() => []),
});

export const assets = sqliteTable("assets", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  type: text("type", { enum: ["image", "video", "audio"] }).notNull(),
  size: integer("size"),
  path: text("path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  usedIn: text("used_in", { mode: "json" }),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const submissions = sqliteTable("submissions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  artistName: text("artist_name"),
  trackTitle: text("track_title"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  status: text("status", { enum: ["new", "reviewed", "shortlisted", "rejected"] }).default("new"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const projects = sqliteTable("projects", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  clientId: integer("client_id"),
  title: text("title").notNull(),
  type: text("type", { enum: ["dj-booking", "production", "remix", "consulting"] }).default("dj-booking"),
  status: text("status", { enum: ["inquiry", "quoted", "approved", "in-progress", "completed", "invoiced", "paid"] }).default("inquiry"),
  venue: text("venue"),
  eventDate: text("event_date"),
  fee: real("fee"),
  currency: text("currency").default("GBP"),
  notes: text("notes"),
  quoteId: integer("quote_id"),
  invoiceId: integer("invoice_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const quotes = sqliteTable("quotes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId: integer("project_id"),
  lineItems: text("line_items", { mode: "json" }).$defaultFn(() => []),
  subtotal: real("subtotal").default(0),
  taxRate: real("tax_rate").default(0),
  total: real("total").default(0),
  status: text("status", { enum: ["draft", "sent", "approved", "rejected"] }).default("draft"),
  pdfUrl: text("pdf_url"),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  expiryDate: text("expiry_date"),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  projectId: integer("project_id"),
  invoiceNumber: text("invoice_number").notNull().unique(),
  lineItems: text("line_items", { mode: "json" }).$defaultFn(() => []),
  subtotal: real("subtotal").default(0),
  taxRate: real("tax_rate").default(0),
  total: real("total").default(0),
  status: text("status", { enum: ["draft", "sent", "paid", "overdue"] }).default("draft"),
  pdfUrl: text("pdf_url"),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  dueDate: text("due_date"),
});

export const clients = sqliteTable("clients", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  instagram: text("instagram"),
  notes: text("notes"),
  totalBookings: integer("total_bookings").default(0),
  totalRevenue: real("total_revenue").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
