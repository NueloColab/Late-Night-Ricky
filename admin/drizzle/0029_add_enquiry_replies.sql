-- Migration: Add replies column to enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS replies JSONB DEFAULT '[]';
