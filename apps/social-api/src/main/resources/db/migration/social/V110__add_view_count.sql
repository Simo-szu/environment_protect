-- ============================================================================
-- YouthLoop Social Schema Migration V110
-- Schema: social
-- Purpose: Add view_count to content_stats for article view tracking
-- ============================================================================

ALTER TABLE social.content_stats
  ADD COLUMN IF NOT EXISTS view_count bigint NOT NULL DEFAULT 0;
