CREATE TABLE "invoice_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"client_name" text,
	"client_email" text,
	"client_company" text,
	"project_title" text,
	"line_items" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"tax_rate" real DEFAULT 20,
	"vat_enabled" boolean DEFAULT true,
	"discount" jsonb DEFAULT '{"enabled":false,"type":"friends-family","percent":10,"amount":0}'::jsonb,
	"payment_terms_type" text DEFAULT 'net-30',
	"payment_terms_label" text DEFAULT 'Net 30',
	"payment_method" text DEFAULT 'bank-transfer',
	"payment_schedule" jsonb DEFAULT '[]'::jsonb,
	"cc_emails" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"views" integer DEFAULT 1,
	"unique_visitors" integer DEFAULT 1
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "performance_date" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "cc_emails" text;--> statement-breakpoint
ALTER TABLE "show_cards" ADD COLUMN "moment_id" text;--> statement-breakpoint
ALTER TABLE "site_sections" ADD COLUMN "is_visible" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "genre" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "bpm" integer;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "instagram_handle" text;