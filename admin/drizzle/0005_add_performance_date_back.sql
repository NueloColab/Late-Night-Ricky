-- Migration: Add performance_date back to invoices (invoice-level date, optional)

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS performance_date TEXT;
ALTER TABLE invoice_templates ADD COLUMN IF NOT EXISTS performance_date TEXT;