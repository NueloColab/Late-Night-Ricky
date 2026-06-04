CREATE TABLE `assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`type` text NOT NULL,
	`size` integer,
	`path` text NOT NULL,
	`thumbnail_path` text,
	`used_in` text,
	`uploaded_at` integer
);
--> statement-breakpoint
CREATE TABLE `client_names` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order` integer DEFAULT 0,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`instagram` text,
	`notes` text,
	`total_bookings` integer DEFAULT 0,
	`total_revenue` real DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`invoice_number` text NOT NULL,
	`line_items` text,
	`subtotal` real DEFAULT 0,
	`tax_rate` real DEFAULT 0,
	`total` real DEFAULT 0,
	`status` text DEFAULT 'draft',
	`pdf_url` text,
	`sent_at` integer,
	`paid_at` integer,
	`due_date` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE TABLE `partner_logos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order` integer DEFAULT 0,
	`image_path` text,
	`name` text NOT NULL,
	`href` text,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` integer,
	`title` text NOT NULL,
	`type` text DEFAULT 'dj-booking',
	`status` text DEFAULT 'inquiry',
	`venue` text,
	`event_date` text,
	`fee` real,
	`currency` text DEFAULT 'GBP',
	`notes` text,
	`quote_id` integer,
	`invoice_id` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`line_items` text,
	`subtotal` real DEFAULT 0,
	`tax_rate` real DEFAULT 0,
	`total` real DEFAULT 0,
	`status` text DEFAULT 'draft',
	`pdf_url` text,
	`sent_at` integer,
	`expiry_date` text
);
--> statement-breakpoint
CREATE TABLE `show_cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order` integer DEFAULT 0,
	`image_path` text,
	`venue` text NOT NULL,
	`location` text NOT NULL,
	`season` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`href` text DEFAULT '#',
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE TABLE `site_sections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page` text NOT NULL,
	`section` text NOT NULL,
	`content` text,
	`images` text,
	`videos` text,
	`links` text,
	`order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`artist_name` text,
	`track_title` text,
	`file_path` text,
	`file_size` integer,
	`status` text DEFAULT 'new',
	`notes` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`pin_hash` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `venue_ticker` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`venues` text
);
