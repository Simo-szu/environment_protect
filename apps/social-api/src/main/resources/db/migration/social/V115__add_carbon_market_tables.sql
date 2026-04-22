-- ============================================================================
-- Add national carbon market realtime snapshot and daily kline tables.
-- ============================================================================

CREATE TABLE social.carbon_market_realtime_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_date date NOT NULL,
  quote_time time NOT NULL,
  last_price numeric(10, 2) NOT NULL,
  change_percent numeric(8, 4),
  open_price numeric(10, 2),
  high_price numeric(10, 2),
  low_price numeric(10, 2),
  previous_close_price numeric(10, 2),
  daily_volume_tons bigint,
  daily_turnover_cny numeric(20, 2),
  cumulative_volume_tons bigint,
  cumulative_turnover_cny numeric(20, 2),
  daily_volume_text text,
  daily_turnover_text text,
  cumulative_volume_text text,
  cumulative_turnover_text text,
  source_curr_date text,
  source_curr_time text,
  synced_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_carbon_market_realtime_snapshot_trade_time UNIQUE (trade_date, quote_time)
);

CREATE INDEX idx_carbon_market_realtime_snapshot_latest
  ON social.carbon_market_realtime_snapshot (trade_date DESC, quote_time DESC);

CREATE TABLE social.carbon_market_daily_kline (
  trade_date date PRIMARY KEY,
  open_price numeric(10, 2) NOT NULL,
  close_price numeric(10, 2) NOT NULL,
  low_price numeric(10, 2) NOT NULL,
  high_price numeric(10, 2) NOT NULL,
  volume_tons bigint NOT NULL,
  synced_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_carbon_market_daily_kline_trade_date
  ON social.carbon_market_daily_kline (trade_date DESC);

CREATE TABLE social.carbon_market_sync_state (
  id int PRIMARY KEY,
  last_success_at timestamptz,
  last_trade_date date,
  last_quote_time time,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_carbon_market_sync_state_singleton CHECK (id = 1)
);

INSERT INTO social.carbon_market_sync_state (
  id,
  updated_at
) VALUES (
  1,
  now()
)
ON CONFLICT (id) DO NOTHING;
