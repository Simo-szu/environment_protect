-- ============================================================================
-- YouthLoop Social Schema Migration V107
-- Purpose: Add shipping information to exchange_order
-- ============================================================================

-- Add shipping information columns to exchange_order
ALTER TABLE social.exchange_order
ADD COLUMN IF NOT EXISTS recipient_name text,
ADD COLUMN IF NOT EXISTS recipient_phone text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS shipping_note text;
