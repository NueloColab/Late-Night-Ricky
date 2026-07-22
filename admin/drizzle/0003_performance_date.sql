-- Migration: Add performance_date to invoices and invoice_templates
-- Apply with: drizzle-kit push or run manually on Neon

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS performance_date TEXT;
ALTER TABLE invoice_templates ADD COLUMN IF NOT EXISTS performance_date TEXT;