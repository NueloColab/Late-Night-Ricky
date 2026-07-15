-- LNR Invoice + Settings Updates

-- Add CC emails to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cc_emails text;

-- Add bank details to settings (stored as JSONB in site_sections, no schema change needed)
-- We'll use the existing site_sections table with page='global', section='settings'
