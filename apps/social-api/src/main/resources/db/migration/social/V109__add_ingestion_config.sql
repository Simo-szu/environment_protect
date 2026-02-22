-- ============================================================================
-- Add ingestion configuration table managed by admin.
-- ============================================================================

CREATE TABLE social.ingestion_config (
  id int PRIMARY KEY,
  cron text NOT NULL,
  zone_id text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  publish_status int NOT NULL DEFAULT 1,
  request_timeout_ms int NOT NULL,
  request_interval_ms bigint NOT NULL,
  earth_enabled boolean NOT NULL DEFAULT true,
  earth_max_pages int NOT NULL DEFAULT 2,
  earth_max_articles int NOT NULL DEFAULT 30,
  ecoepn_enabled boolean NOT NULL DEFAULT true,
  ecoepn_max_pages int NOT NULL DEFAULT 2,
  ecoepn_max_articles int NOT NULL DEFAULT 30,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_ingestion_config_singleton CHECK (id = 1),
  CONSTRAINT chk_ingestion_request_timeout CHECK (request_timeout_ms > 0),
  CONSTRAINT chk_ingestion_request_interval CHECK (request_interval_ms >= 0),
  CONSTRAINT chk_ingestion_earth_max_pages CHECK (earth_max_pages > 0),
  CONSTRAINT chk_ingestion_earth_max_articles CHECK (earth_max_articles > 0),
  CONSTRAINT chk_ingestion_ecoepn_max_pages CHECK (ecoepn_max_pages > 0),
  CONSTRAINT chk_ingestion_ecoepn_max_articles CHECK (ecoepn_max_articles > 0)
);

INSERT INTO social.ingestion_config (
  id,
  cron,
  zone_id,
  is_enabled,
  publish_status,
  request_timeout_ms,
  request_interval_ms,
  earth_enabled,
  earth_max_pages,
  earth_max_articles,
  ecoepn_enabled,
  ecoepn_max_pages,
  ecoepn_max_articles,
  created_at,
  updated_at
) VALUES (
  1,
  '0 30 3 * * ?',
  'Asia/Shanghai',
  true,
  1,
  10000,
  300,
  true,
  2,
  30,
  true,
  2,
  30,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
