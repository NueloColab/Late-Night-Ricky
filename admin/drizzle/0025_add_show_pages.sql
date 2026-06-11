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
	"gallery_images" jsonb DEFAULT '[]',
	"testimonials" jsonb DEFAULT '[]',
	"content" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "show_pages_slug_unique" UNIQUE("slug")
);
