-- Migration 0028: Add missing payment_terms column to invoices

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'net-30';

-- Also add quote_number to quotes for proper numbering
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number) WHERE quote_number IS NOT NULL;
