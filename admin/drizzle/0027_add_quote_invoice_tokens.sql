-- Migration 0027: Add quote/invoice client-facing flow fields

-- Add acceptToken and email tracking to quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS accept_token TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS converted_to_invoice BOOLEAN DEFAULT FALSE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS invoice_id INTEGER;

-- Add paymentToken and payment tracking to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_token TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_confirmed_by_client BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_confirmation JSONB DEFAULT '{}';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS quote_id INTEGER;

-- Add unique constraints on tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_accept_token ON quotes(accept_token) WHERE accept_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_payment_token ON invoices(payment_token) WHERE payment_token IS NOT NULL;

-- Add foreign key from quotes to invoices (optional, for tracking conversion)
-- ALTER TABLE quotes ADD CONSTRAINT fk_quote_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id);
