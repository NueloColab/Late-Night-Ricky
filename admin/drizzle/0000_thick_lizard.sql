CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"type" text NOT NULL,
	"size" integer,
	"path" text NOT NULL,
	"thumbnail_path" text,
	"used_in" jsonb,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carousel_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer DEFAULT 0,
	"image_path" text,
	"alt" text DEFAULT '',
	"page" text DEFAULT 'home',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "client_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer DEFAULT 0,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"instagram" text,
	"notes" text,
	"total_bookings" integer DEFAULT 0,
	"total_revenue" real DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"file_url" text,
	"status" text DEFAULT 'draft',
	"contract_type" text DEFAULT 'general',
	"signed_at" timestamp,
	"expiry_date" text,
	"terms" text,
	"counterparty_name" text,
	"counterparty_email" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"club_name" text,
	"city" text,
	"fee" text,
	"event_date" text,
	"message" text,
	"status" text DEFAULT 'new',
	"notes" text,
	"replies" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"client_name" text,
	"client_email" text,
	"client_company" text,
	"project_title" text,
	"invoice_number" text NOT NULL,
	"line_items" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"subtotal" real DEFAULT 0,
	"tax_rate" real DEFAULT 0,
	"vat_enabled" boolean DEFAULT true,
	"discount" jsonb DEFAULT '{"enabled":false,"type":"friends-family","percent":10,"amount":0}'::jsonb,
	"total" real DEFAULT 0,
	"status" text DEFAULT 'draft',
	"payment_terms" text DEFAULT 'net-30',
	"payment_terms_type" text DEFAULT 'net-30',
	"payment_terms_label" text DEFAULT 'Net 30',
	"payment_method" text DEFAULT 'bank-transfer',
	"payment_schedule" jsonb DEFAULT '[]'::jsonb,
	"pdf_url" text,
	"sent_at" timestamp,
	"email_sent_at" timestamp,
	"paid_at" timestamp,
	"due_date" text,
	"payment_token" text,
	"payment_confirmed_by_client" boolean DEFAULT false,
	"payment_confirmed_at" timestamp,
	"payment_confirmation" jsonb DEFAULT '{}'::jsonb,
	"quote_id" integer,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "mood_board_pins" (
	"id" serial PRIMARY KEY NOT NULL,
	"board_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"position_x" integer DEFAULT 0,
	"position_y" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mood_boards" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"share_token" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_logos" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer DEFAULT 0,
	"image_path" text,
	"name" text NOT NULL,
	"href" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"title" text NOT NULL,
	"type" text DEFAULT 'dj-booking',
	"status" text DEFAULT 'inquiry',
	"venue" text,
	"event_date" text,
	"fee" real,
	"currency" text DEFAULT 'GBP',
	"notes" text,
	"description" text,
	"priority" text DEFAULT 'medium',
	"deadline" text,
	"progress" integer DEFAULT 0,
	"services" jsonb DEFAULT '[]'::jsonb,
	"team" jsonb DEFAULT '[]'::jsonb,
	"files" jsonb DEFAULT '[]'::jsonb,
	"tasks" jsonb DEFAULT '[]'::jsonb,
	"mood_board" jsonb DEFAULT '[]'::jsonb,
	"contract_number" text,
	"quote_id" integer,
	"invoice_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"client_name" text,
	"client_email" text,
	"client_company" text,
	"project_title" text,
	"line_items" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"subtotal" real DEFAULT 0,
	"tax_rate" real DEFAULT 0,
	"vat_enabled" boolean DEFAULT true,
	"discount" jsonb DEFAULT '{"enabled":false,"type":"friends-family","percent":10,"amount":0}'::jsonb,
	"total" real DEFAULT 0,
	"status" text DEFAULT 'draft',
	"payment_terms" text DEFAULT 'net-30',
	"payment_terms_type" text DEFAULT 'net-30',
	"payment_terms_label" text DEFAULT 'Net 30',
	"payment_method" text DEFAULT 'bank-transfer',
	"payment_schedule" jsonb DEFAULT '[]'::jsonb,
	"pdf_url" text,
	"sent_at" timestamp,
	"email_sent_at" timestamp,
	"expiry_date" text,
	"accept_token" text,
	"converted_to_invoice" boolean DEFAULT false,
	"invoice_id" integer,
	"quote_number" text
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"commission" real DEFAULT 0,
	"commission_percent" real,
	"status" text DEFAULT 'active',
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "royalties" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"source" text NOT NULL,
	"amount" real DEFAULT 0,
	"currency" text DEFAULT 'GBP',
	"period_start" text,
	"period_end" text,
	"streams" integer,
	"status" text DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "show_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer DEFAULT 0,
	"image_path" text,
	"venue" text NOT NULL,
	"location" text NOT NULL,
	"season" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"href" text DEFAULT '#',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "show_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"venue" text NOT NULL,
	"location" text NOT NULL,
	"season" text NOT NULL,
	"description" text,
	"hero_image" text,
	"set_length" text,
	"gallery_images" jsonb DEFAULT '[]'::jsonb,
	"testimonials" jsonb DEFAULT '[]'::jsonb,
	"content" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "show_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"section" text NOT NULL,
	"content" jsonb,
	"images" jsonb,
	"videos" jsonb,
	"links" jsonb,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"artist_name" text,
	"track_title" text,
	"file_path" text,
	"file_size" integer,
	"status" text DEFAULT 'new',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer DEFAULT 0,
	"title" text NOT NULL,
	"file_path" text,
	"cover_path" text,
	"duration" text DEFAULT '0:30',
	"spotify_url" text,
	"apple_music_url" text,
	"youtube_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"pin_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "venue_ticker" (
	"id" serial PRIMARY KEY NOT NULL,
	"venues" jsonb DEFAULT '[]'::jsonb
);
