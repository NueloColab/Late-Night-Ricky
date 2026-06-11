-- Migration: Add enhanced quote and invoice fields
-- Created: 2026-06-11

-- Quotes table enhancements
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS client_company TEXT,
  ADD COLUMN IF NOT EXISTS project_title TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS vat_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS discount JSONB DEFAULT '{"enabled": false, "type": "friends-family", "percent": 10, "amount": 0}',
  ADD COLUMN IF NOT EXISTS payment_terms_type TEXT DEFAULT 'net-30',
  ADD COLUMN IF NOT EXISTS payment_terms_label TEXT DEFAULT 'Net 30',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank-transfer',
  ADD COLUMN IF NOT EXISTS payment_schedule JSONB DEFAULT '[]';

-- Invoices table enhancements
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS client_company TEXT,
  ADD COLUMN IF NOT EXISTS project_title TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS vat_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS discount JSONB DEFAULT '{"enabled": false, "type": "friends-family", "percent": 10, "amount": 0}',
  ADD COLUMN IF NOT EXISTS payment_terms_type TEXT DEFAULT 'net-30',
  ADD COLUMN IF NOT EXISTS payment_terms_label TEXT DEFAULT 'Net 30',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank-transfer',
  ADD COLUMN IF NOT EXISTS payment_schedule JSONB DEFAULT '[]';
