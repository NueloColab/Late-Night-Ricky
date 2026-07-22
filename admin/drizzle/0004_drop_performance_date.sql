-- Migration: Drop performance_date from invoices and invoice_templates
-- (moved to per-line-item date field)

ALTER TABLE invoices DROP COLUMN IF EXISTS performance_date;
ALTER TABLE invoice_templates DROP COLUMN IF EXISTS performance_date;