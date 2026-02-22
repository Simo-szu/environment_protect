-- ============================================================================
-- YouthLoop Game Schema Migration V009
-- Schema: game
-- Purpose: Add runtime gameplay parameter config
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_runtime_param_config (
  config_id smallint PRIMARY KEY CHECK (config_id = 1),
  core_hand_limit integer NOT NULL DEFAULT 6 CHECK (core_hand_limit >= 1),
  policy_hand_limit integer NOT NULL DEFAULT 2 CHECK (policy_hand_limit >= 1),
  max_combo_per_turn integer NOT NULL DEFAULT 2 CHECK (max_combo_per_turn >= 1),
  max_turn integer NOT NULL DEFAULT 30 CHECK (max_turn >= 1),
  hand_discard_decision_seconds integer NOT NULL DEFAULT 10 CHECK (hand_discard_decision_seconds >= 1),
  trade_window_interval integer NOT NULL DEFAULT 2 CHECK (trade_window_interval >= 1),
  trade_window_seconds integer NOT NULL DEFAULT 3 CHECK (trade_window_seconds >= 1),
  base_carbon_price double precision NOT NULL DEFAULT 2.0 CHECK (base_carbon_price > 0),
  max_carbon_quota integer NOT NULL DEFAULT 200 CHECK (max_carbon_quota >= 1),
  domain_progress_card_cap integer NOT NULL DEFAULT 15 CHECK (domain_progress_card_cap >= 1),
  config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_runtime_param_enabled
  ON game.game_runtime_param_config(is_enabled, config_id);

INSERT INTO game.game_runtime_param_config (
  config_id, core_hand_limit, policy_hand_limit, max_combo_per_turn, max_turn,
  hand_discard_decision_seconds, trade_window_interval, trade_window_seconds,
  base_carbon_price, max_carbon_quota, domain_progress_card_cap, config_snapshot
) VALUES (
  1, 6, 2, 2, 30, 10, 2, 3, 2.0, 200, 15,
  '{"coreHandLimit":6,"policyHandLimit":2,"maxComboPerTurn":2,"maxTurn":30,"handDiscardDecisionSeconds":10,"tradeWindowInterval":2,"tradeWindowSeconds":3,"baseCarbonPrice":2.0,"maxCarbonQuota":200,"domainProgressCardCap":15}'::jsonb
)
ON CONFLICT (config_id) DO UPDATE SET
  core_hand_limit = EXCLUDED.core_hand_limit,
  policy_hand_limit = EXCLUDED.policy_hand_limit,
  max_combo_per_turn = EXCLUDED.max_combo_per_turn,
  max_turn = EXCLUDED.max_turn,
  hand_discard_decision_seconds = EXCLUDED.hand_discard_decision_seconds,
  trade_window_interval = EXCLUDED.trade_window_interval,
  trade_window_seconds = EXCLUDED.trade_window_seconds,
  base_carbon_price = EXCLUDED.base_carbon_price,
  max_carbon_quota = EXCLUDED.max_carbon_quota,
  domain_progress_card_cap = EXCLUDED.domain_progress_card_cap,
  config_snapshot = EXCLUDED.config_snapshot,
  is_enabled = true,
  updated_at = now();
