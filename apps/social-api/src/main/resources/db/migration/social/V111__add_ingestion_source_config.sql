-- ============================================================================
-- Add per-source ingestion configuration table.
-- ============================================================================

CREATE TABLE IF NOT EXISTS social.ingestion_source_config (
  source_key text PRIMARY KEY,
  is_enabled boolean NOT NULL DEFAULT true,
  max_pages int NOT NULL DEFAULT 2,
  max_articles int NOT NULL DEFAULT 30,
  request_interval_ms bigint,
  content_type int,
  placement text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_ingestion_source_key_not_blank CHECK (length(trim(source_key)) > 0),
  CONSTRAINT chk_ingestion_source_max_pages CHECK (max_pages > 0),
  CONSTRAINT chk_ingestion_source_max_articles CHECK (max_articles > 0),
  CONSTRAINT chk_ingestion_source_request_interval CHECK (request_interval_ms IS NULL OR request_interval_ms >= 0),
  CONSTRAINT chk_ingestion_source_content_type CHECK (content_type IS NULL OR content_type IN (1, 2, 3, 4))
);

INSERT INTO social.ingestion_source_config (
  source_key, is_enabled, max_pages, max_articles, request_interval_ms, content_type, placement
) VALUES
  ('earth', true, 2, 30, 300, 1, 'home'),
  ('ecoepn', true, 2, 30, 300, 4, 'home'),
  ('kepuchina_wiki', true, 2, 24, 400, 4, 'home'),
  ('inen_co2', true, 2, 30, 400, 4, 'home'),
  ('sceex_market', true, 3, 30, 250, 2, 'home'),
  ('tanpaifang_cases', true, 2, 30, 350, 2, 'home'),
  ('cteam_cases', true, 1, 50, 350, 2, 'home'),
  ('iea_policy', true, 2, 20, 500, 3, 'home'),
  ('owid_data_news', true, 1, 20, 400, 1, 'science'),
  ('pudding_data_news', false, 1, 10, 500, 1, 'science')
ON CONFLICT (source_key) DO NOTHING;

