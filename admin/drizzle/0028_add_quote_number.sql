-- Migration 0028: Add quote_number to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number) WHERE quote_number IS NOT NULL;
