-- ============================================================================
-- YouthLoop Game Schema Migration V004
-- Schema: game
-- Purpose: Rebuilt history - initialize rule/config tables (event/combo/tag/policy/runtime/balance/ending)
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_event_rule_config (
  event_type text PRIMARY KEY,
  trigger_probability_pct integer NOT NULL DEFAULT 30 CHECK (trigger_probability_pct >= 0 AND trigger_probability_pct <= 100),
  min_green integer,
  min_carbon integer,
  max_satisfaction integer,
  min_population integer,
  require_even_turn boolean NOT NULL DEFAULT false,
  weight integer NOT NULL DEFAULT 1 CHECK (weight > 0),
  duration_turns integer NOT NULL DEFAULT 1 CHECK (duration_turns >= 1),
  green_delta integer NOT NULL DEFAULT 0,
  carbon_delta integer NOT NULL DEFAULT 0,
  satisfaction_delta integer NOT NULL DEFAULT 0,
  green_pct_delta integer NOT NULL DEFAULT 0,
  population_pct_delta integer NOT NULL DEFAULT 0,
  quota_delta integer NOT NULL DEFAULT 0,
  display_name text NOT NULL DEFAULT '',
  effect_summary text NOT NULL DEFAULT '',
  resolution_hint text NOT NULL DEFAULT '',
  resolvable_policy_ids_csv text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game.game_combo_rule_config (
  combo_id text PRIMARY KEY,
  priority_order integer NOT NULL CHECK (priority_order >= 1),
  required_policy_id text NOT NULL DEFAULT '',
  min_industry integer NOT NULL DEFAULT 0,
  min_ecology integer NOT NULL DEFAULT 0,
  min_science integer NOT NULL DEFAULT 0,
  min_society integer NOT NULL DEFAULT 0,
  min_low_carbon_industry integer NOT NULL DEFAULT 0,
  min_shenzhen_ecology integer NOT NULL DEFAULT 0,
  min_link_cards integer NOT NULL DEFAULT 0,
  min_industry_low_carbon_adjacent_pairs integer NOT NULL DEFAULT 0,
  min_science_science_adjacent_pairs integer NOT NULL DEFAULT 0,
  min_science_industry_adjacent_pairs integer NOT NULL DEFAULT 0,
  min_industry_ecology_adjacent_pairs integer NOT NULL DEFAULT 0,
  min_society_ecology_adjacent_pairs integer NOT NULL DEFAULT 0,
  effect_industry_delta integer NOT NULL DEFAULT 0,
  effect_tech_delta integer NOT NULL DEFAULT 0,
  effect_population_delta integer NOT NULL DEFAULT 0,
  effect_green_delta integer NOT NULL DEFAULT 0,
  effect_carbon_delta integer NOT NULL DEFAULT 0,
  effect_satisfaction_delta integer NOT NULL DEFAULT 0,
  effect_quota_delta integer NOT NULL DEFAULT 0,
  effect_low_carbon_delta integer NOT NULL DEFAULT 0,
  effect_tech_pct integer NOT NULL DEFAULT 0,
  effect_population_pct integer NOT NULL DEFAULT 0,
  effect_industry_pct integer NOT NULL DEFAULT 0,
  effect_low_carbon_pct integer NOT NULL DEFAULT 0,
  effect_green_pct integer NOT NULL DEFAULT 0,
  effect_global_pct integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_event_rule_enabled ON game.game_event_rule_config(is_enabled);
CREATE INDEX IF NOT EXISTS idx_game_combo_rule_priority_enabled ON game.game_combo_rule_config(priority_order, is_enabled);

INSERT INTO game.game_event_rule_config (
  event_type, trigger_probability_pct, min_green, min_carbon, max_satisfaction, min_population, require_even_turn, weight,
  duration_turns, green_delta, carbon_delta, satisfaction_delta, green_pct_delta, population_pct_delta, quota_delta,
  display_name, effect_summary, resolution_hint, resolvable_policy_ids_csv
) VALUES
  ('flood', 30, NULL, NULL, NULL, NULL, true, 35, 1, -10, 0, 0, -20, 0, 0, '内涝', '绿建度-10，当回合生态效果-20%', '使用 card063 或 card064 可立即化解', 'card063,card064'),
  ('sea_level_rise', 30, NULL, 95, NULL, NULL, false, 40, 1, 0, 15, 0, 0, 0, -2, '海平面上升', '碳排放+15，额外配额消耗+2', '使用 card062 或 card066 可立即化解', 'card062,card066'),
  ('citizen_protest', 30, NULL, NULL, 70, 100, false, 25, 2, 0, 0, -12, 0, -15, 0, '市民抗议', '市民满意度-12，人口产出-15%', '使用 card067 或 card068 可立即化解', 'card067,card068')
ON CONFLICT (event_type) DO UPDATE SET
  trigger_probability_pct = EXCLUDED.trigger_probability_pct,
  min_green = EXCLUDED.min_green,
  min_carbon = EXCLUDED.min_carbon,
  max_satisfaction = EXCLUDED.max_satisfaction,
  min_population = EXCLUDED.min_population,
  require_even_turn = EXCLUDED.require_even_turn,
  weight = EXCLUDED.weight,
  duration_turns = EXCLUDED.duration_turns,
  green_delta = EXCLUDED.green_delta,
  carbon_delta = EXCLUDED.carbon_delta,
  satisfaction_delta = EXCLUDED.satisfaction_delta,
  green_pct_delta = EXCLUDED.green_pct_delta,
  population_pct_delta = EXCLUDED.population_pct_delta,
  quota_delta = EXCLUDED.quota_delta,
  display_name = EXCLUDED.display_name,
  effect_summary = EXCLUDED.effect_summary,
  resolution_hint = EXCLUDED.resolution_hint,
  resolvable_policy_ids_csv = EXCLUDED.resolvable_policy_ids_csv,
  is_enabled = true,
  updated_at = now();

INSERT INTO game.game_combo_rule_config (
  combo_id, priority_order, required_policy_id,
  min_industry, min_ecology, min_science, min_society, min_low_carbon_industry, min_shenzhen_ecology, min_link_cards,
  min_industry_low_carbon_adjacent_pairs, min_science_science_adjacent_pairs, min_science_industry_adjacent_pairs,
  min_industry_ecology_adjacent_pairs, min_society_ecology_adjacent_pairs,
  effect_industry_delta, effect_tech_delta, effect_population_delta, effect_green_delta, effect_carbon_delta,
  effect_satisfaction_delta, effect_quota_delta, effect_low_carbon_delta, effect_tech_pct, effect_population_pct,
  effect_industry_pct, effect_low_carbon_pct, effect_green_pct, effect_global_pct
) VALUES
  ('policy_industry_chain', 101, 'card061', 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  ('policy_ecology_chain', 102, 'card064', 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  ('policy_science_chain', 103, 'card065', 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0),
  ('policy_society_chain', 104, 'card067', 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 20, 0, 0, 0, 0),
  ('cross_science_industry', 201, '', 0, 0, 3, 0, 3, 0, 0, 0, 0, 1, 0, 0, 20, 15, 0, 0, -20, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  ('cross_industry_ecology', 202, '', 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 10, -25, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  ('cross_ecology_society', 203, '', 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 8, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0),
  ('cross_science_ecology', 204, '', 0, 3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 10, 0, 15, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0),
  ('intra_industry_scale', 301, '', 0, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, 0, 0, 0, 0, 30, 0, 0, 0),
  ('intra_ecology_restore', 302, '', 0, 4, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, -8, 8, 0, 0, 0, 0, 0, 0, 0, 0),
  ('intra_science_boost', 303, '', 0, 0, 4, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 0, 0, 8, 0, 0),
  ('intra_society_mobilize', 304, '', 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 10, 0, 0, 0, 25, 0, 0, 0, 0)
ON CONFLICT (combo_id) DO UPDATE SET
  priority_order = EXCLUDED.priority_order,
  required_policy_id = EXCLUDED.required_policy_id,
  min_industry = EXCLUDED.min_industry,
  min_ecology = EXCLUDED.min_ecology,
  min_science = EXCLUDED.min_science,
  min_society = EXCLUDED.min_society,
  min_low_carbon_industry = EXCLUDED.min_low_carbon_industry,
  min_shenzhen_ecology = EXCLUDED.min_shenzhen_ecology,
  min_link_cards = EXCLUDED.min_link_cards,
  min_industry_low_carbon_adjacent_pairs = EXCLUDED.min_industry_low_carbon_adjacent_pairs,
  min_science_science_adjacent_pairs = EXCLUDED.min_science_science_adjacent_pairs,
  min_science_industry_adjacent_pairs = EXCLUDED.min_science_industry_adjacent_pairs,
  min_industry_ecology_adjacent_pairs = EXCLUDED.min_industry_ecology_adjacent_pairs,
  min_society_ecology_adjacent_pairs = EXCLUDED.min_society_ecology_adjacent_pairs,
  effect_industry_delta = EXCLUDED.effect_industry_delta,
  effect_tech_delta = EXCLUDED.effect_tech_delta,
  effect_population_delta = EXCLUDED.effect_population_delta,
  effect_green_delta = EXCLUDED.effect_green_delta,
  effect_carbon_delta = EXCLUDED.effect_carbon_delta,
  effect_satisfaction_delta = EXCLUDED.effect_satisfaction_delta,
  effect_quota_delta = EXCLUDED.effect_quota_delta,
  effect_low_carbon_delta = EXCLUDED.effect_low_carbon_delta,
  effect_tech_pct = EXCLUDED.effect_tech_pct,
  effect_population_pct = EXCLUDED.effect_population_pct,
  effect_industry_pct = EXCLUDED.effect_industry_pct,
  effect_low_carbon_pct = EXCLUDED.effect_low_carbon_pct,
  effect_green_pct = EXCLUDED.effect_green_pct,
  effect_global_pct = EXCLUDED.effect_global_pct,
  is_enabled = true,
  updated_at = now();


-- ============================================================================
-- YouthLoop Game Schema Migration V007
-- Schema: game
-- Purpose: Add configurable card tag mapping
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_card_tag_map (
  card_id text NOT NULL,
  tag_code text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (card_id, tag_code),
  CONSTRAINT fk_game_card_tag_card FOREIGN KEY (card_id) REFERENCES game.game_card(card_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_card_tag_code_enabled ON game.game_card_tag_map(tag_code, is_enabled);

INSERT INTO game.game_card_tag_map (card_id, tag_code) VALUES
  ('card025', 'shenzhen_ecology'),
  ('card026', 'shenzhen_ecology'),
  ('card027', 'shenzhen_ecology'),

  ('card006', 'low_carbon_core'),
  ('card009', 'low_carbon_core'),
  ('card010', 'low_carbon_core'),
  ('card015', 'low_carbon_core'),
  ('card018', 'low_carbon_core'),
  ('card020', 'low_carbon_core'),
  ('card021', 'low_carbon_core'),
  ('card022', 'low_carbon_core'),
  ('card023', 'low_carbon_core'),
  ('card024', 'low_carbon_core'),
  ('card025', 'low_carbon_core'),
  ('card026', 'low_carbon_core'),
  ('card027', 'low_carbon_core'),
  ('card028', 'low_carbon_core'),
  ('card029', 'low_carbon_core'),
  ('card030', 'low_carbon_core'),
  ('card031', 'low_carbon_core'),
  ('card032', 'low_carbon_core'),
  ('card033', 'low_carbon_core'),
  ('card034', 'low_carbon_core'),
  ('card035', 'low_carbon_core'),
  ('card038', 'low_carbon_core'),
  ('card041', 'low_carbon_core'),
  ('card042', 'low_carbon_core'),
  ('card043', 'low_carbon_core'),
  ('card048', 'low_carbon_core'),
  ('card049', 'low_carbon_core'),
  ('card050', 'low_carbon_core'),
  ('card054', 'low_carbon_core'),
  ('card055', 'low_carbon_core'),
  ('card056', 'low_carbon_core'),
  ('card057', 'low_carbon_core'),
  ('card059', 'low_carbon_core'),
  ('card060', 'low_carbon_core'),

  ('card025', 'shenzhen_tag'),
  ('card026', 'shenzhen_tag'),
  ('card027', 'shenzhen_tag'),
  ('card036', 'shenzhen_tag'),
  ('card037', 'shenzhen_tag'),
  ('card054', 'shenzhen_tag'),

  ('card009', 'link_tag'),
  ('card019', 'link_tag'),
  ('card031', 'link_tag'),
  ('card035', 'link_tag'),
  ('card044', 'link_tag'),
  ('card045', 'link_tag'),
  ('card053', 'link_tag'),
  ('card058', 'link_tag'),

  ('card055', 'new_energy_industry'),

  ('card001', 'traditional_industry'),
  ('card002', 'traditional_industry'),
  ('card003', 'traditional_industry'),
  ('card004', 'traditional_industry'),
  ('card005', 'traditional_industry'),
  ('card011', 'traditional_industry'),
  ('card012', 'traditional_industry'),
  ('card013', 'traditional_industry'),
  ('card014', 'traditional_industry'),
  ('card057', 'traditional_industry'),

  ('card006', 'new_energy_effect'),
  ('card018', 'new_energy_effect'),
  ('card055', 'new_energy_effect')
ON CONFLICT (card_id, tag_code) DO UPDATE SET
  is_enabled = true,
  updated_at = now();


-- ============================================================================
-- YouthLoop Game Schema Migration V008
-- Schema: game
-- Purpose: Add configurable policy unlock rules
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_policy_unlock_rule_config (
  policy_id text PRIMARY KEY,
  priority_order integer NOT NULL CHECK (priority_order >= 1),
  min_industry integer NOT NULL DEFAULT 0,
  min_ecology integer NOT NULL DEFAULT 0,
  min_science integer NOT NULL DEFAULT 0,
  min_society integer NOT NULL DEFAULT 0,
  min_industry_resource integer NOT NULL DEFAULT 0,
  min_tech_resource integer NOT NULL DEFAULT 0,
  min_population_resource integer NOT NULL DEFAULT 0,
  min_green integer,
  min_carbon integer,
  max_carbon integer,
  min_satisfaction integer,
  min_tagged_cards integer NOT NULL DEFAULT 0,
  required_tag text NOT NULL DEFAULT '',
  config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_game_policy_unlock_policy_card FOREIGN KEY (policy_id) REFERENCES game.game_card(card_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_policy_unlock_priority_enabled
  ON game.game_policy_unlock_rule_config(priority_order, is_enabled);

INSERT INTO game.game_policy_unlock_rule_config (
  policy_id, priority_order,
  min_industry, min_ecology, min_science, min_society,
  min_industry_resource, min_tech_resource, min_population_resource,
  min_green, min_carbon, max_carbon, min_satisfaction,
  min_tagged_cards, required_tag, config_snapshot
) VALUES
  ('card061', 1, 6, 0, 0, 0, 50, 0, 0, NULL, NULL, NULL, NULL, 0, '', '{"policyId":"card061","rule":"industry>=6 and industryResource>=50"}'::jsonb),
  ('card062', 2, 8, 0, 0, 0, 0, 0, 0, NULL, 100, NULL, NULL, 0, '', '{"policyId":"card062","rule":"industry>=8 and carbon>=100"}'::jsonb),
  ('card063', 3, 0, 6, 0, 0, 0, 0, 0, 70, NULL, NULL, NULL, 0, '', '{"policyId":"card063","rule":"ecology>=6 and green>=70"}'::jsonb),
  ('card064', 4, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, 2, 'shenzhen_ecology', '{"policyId":"card064","rule":"shenzhen_ecology>=2"}'::jsonb),
  ('card065', 5, 0, 0, 6, 0, 0, 70, 0, NULL, NULL, NULL, NULL, 0, '', '{"policyId":"card065","rule":"science>=6 and techResource>=70"}'::jsonb),
  ('card066', 6, 5, 0, 5, 0, 0, 80, 0, NULL, NULL, NULL, NULL, 0, '', '{"policyId":"card066","rule":"science>=5 and industry>=5 and techResource>=80"}'::jsonb),
  ('card067', 7, 0, 5, 0, 5, 0, 0, 0, NULL, NULL, NULL, 75, 0, '', '{"policyId":"card067","rule":"society>=5 and ecology>=5 and satisfaction>=75"}'::jsonb),
  ('card068', 8, 0, 0, 0, 6, 0, 0, 60, NULL, NULL, NULL, NULL, 0, '', '{"policyId":"card068","rule":"society>=6 and populationResource>=60"}'::jsonb)
ON CONFLICT (policy_id) DO UPDATE SET
  priority_order = EXCLUDED.priority_order,
  min_industry = EXCLUDED.min_industry,
  min_ecology = EXCLUDED.min_ecology,
  min_science = EXCLUDED.min_science,
  min_society = EXCLUDED.min_society,
  min_industry_resource = EXCLUDED.min_industry_resource,
  min_tech_resource = EXCLUDED.min_tech_resource,
  min_population_resource = EXCLUDED.min_population_resource,
  min_green = EXCLUDED.min_green,
  min_carbon = EXCLUDED.min_carbon,
  max_carbon = EXCLUDED.max_carbon,
  min_satisfaction = EXCLUDED.min_satisfaction,
  min_tagged_cards = EXCLUDED.min_tagged_cards,
  required_tag = EXCLUDED.required_tag,
  config_snapshot = EXCLUDED.config_snapshot,
  is_enabled = true,
  updated_at = now();


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


-- ============================================================================
-- YouthLoop Game Schema Migration V010
-- Schema: game
-- Purpose: Add balance/scoring/ending parameter config
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_balance_rule_config (
  config_id smallint PRIMARY KEY CHECK (config_id = 1),
  initial_phase text NOT NULL DEFAULT 'early',
  initial_event_cooldown integer NOT NULL DEFAULT 0,
  board_size integer NOT NULL DEFAULT 6 CHECK (board_size >= 1),
  initial_industry integer NOT NULL DEFAULT 30,
  initial_tech integer NOT NULL DEFAULT 20,
  initial_population integer NOT NULL DEFAULT 25,
  initial_green integer NOT NULL DEFAULT 50,
  initial_carbon integer NOT NULL DEFAULT 80,
  initial_satisfaction integer NOT NULL DEFAULT 60,
  initial_low_carbon_score integer NOT NULL DEFAULT 0,
  initial_quota integer NOT NULL DEFAULT 50,
  initial_draw_early integer NOT NULL DEFAULT 4 CHECK (initial_draw_early >= 0),
  draw_count_early integer NOT NULL DEFAULT 4 CHECK (draw_count_early >= 0),
  draw_count_mid integer NOT NULL DEFAULT 3 CHECK (draw_count_mid >= 0),
  draw_count_late integer NOT NULL DEFAULT 2 CHECK (draw_count_late >= 0),
  event_cooldown_reset_turns integer NOT NULL DEFAULT 3 CHECK (event_cooldown_reset_turns >= 1),
  settlement_base_industry_gain integer NOT NULL DEFAULT 2,
  settlement_base_tech_gain integer NOT NULL DEFAULT 1,
  settlement_base_population_gain integer NOT NULL DEFAULT 1,
  satisfaction_max integer NOT NULL DEFAULT 200 CHECK (satisfaction_max >= 1),
  carbon_quota_base_line integer NOT NULL DEFAULT 80,
  carbon_quota_per_n_over integer NOT NULL DEFAULT 10 CHECK (carbon_quota_per_n_over >= 1),
  carbon_industry_emission_per_card integer NOT NULL DEFAULT 3,
  carbon_ecology_reduction_per_card integer NOT NULL DEFAULT 2,
  carbon_science_reduction_per_card integer NOT NULL DEFAULT 1,
  trade_random_base_min double precision NOT NULL DEFAULT 0.8,
  trade_random_span double precision NOT NULL DEFAULT 0.4,
  trade_high_carbon_threshold integer NOT NULL DEFAULT 100,
  trade_high_carbon_factor double precision NOT NULL DEFAULT 1.1,
  trade_low_carbon_threshold integer NOT NULL DEFAULT 60,
  trade_low_carbon_factor double precision NOT NULL DEFAULT 0.9,
  failure_high_carbon_threshold integer NOT NULL DEFAULT 130,
  failure_high_carbon_streak_limit integer NOT NULL DEFAULT 5 CHECK (failure_high_carbon_streak_limit >= 1),
  trade_failure_quota_exhausted_limit integer NOT NULL DEFAULT 4 CHECK (trade_failure_quota_exhausted_limit >= 1),
  trade_failure_profit_threshold double precision NOT NULL DEFAULT 0,
  low_carbon_min_for_positive_ending integer NOT NULL DEFAULT 120,
  low_carbon_domain_threshold integer NOT NULL DEFAULT 8,
  low_carbon_domain_bonus integer NOT NULL DEFAULT 5,
  low_carbon_policy_unlock_score integer NOT NULL DEFAULT 3,
  low_carbon_policy_unlock_all_count integer NOT NULL DEFAULT 8,
  low_carbon_policy_unlock_all_bonus integer NOT NULL DEFAULT 10,
  low_carbon_event_resolved_score integer NOT NULL DEFAULT 10,
  low_carbon_event_triggered_penalty integer NOT NULL DEFAULT 10,
  low_carbon_over_limit_carbon_threshold integer NOT NULL DEFAULT 80,
  low_carbon_over_limit_streak_threshold integer NOT NULL DEFAULT 3,
  low_carbon_over_limit_streak_penalty integer NOT NULL DEFAULT 15,
  low_carbon_trade_profit_divisor double precision NOT NULL DEFAULT 50,
  low_carbon_trade_profit_bonus integer NOT NULL DEFAULT 3,
  low_carbon_quota_exhausted_penalty integer NOT NULL DEFAULT 5,
  low_carbon_invalid_operation_penalty integer NOT NULL DEFAULT 8,
  carbon_tier_1_max integer NOT NULL DEFAULT 70,
  carbon_tier_1_score integer NOT NULL DEFAULT 3,
  carbon_tier_2_max integer NOT NULL DEFAULT 80,
  carbon_tier_2_score integer NOT NULL DEFAULT 0,
  carbon_tier_3_max integer NOT NULL DEFAULT 100,
  carbon_tier_3_score integer NOT NULL DEFAULT -2,
  carbon_tier_4_max integer NOT NULL DEFAULT 130,
  carbon_tier_4_score integer NOT NULL DEFAULT -5,
  carbon_tier_5_score integer NOT NULL DEFAULT -8,
  phase_early_max_cards integer NOT NULL DEFAULT 15,
  phase_early_max_score integer NOT NULL DEFAULT 59,
  phase_mid_min_cards integer NOT NULL DEFAULT 16,
  phase_mid_max_cards integer NOT NULL DEFAULT 30,
  phase_mid_min_score integer NOT NULL DEFAULT 60,
  phase_mid_max_score integer NOT NULL DEFAULT 100,
  phase_late_min_cards integer NOT NULL DEFAULT 31,
  phase_late_min_score integer NOT NULL DEFAULT 101,
  phase_late_remaining_cards_threshold integer NOT NULL DEFAULT 10,
  ending_event_resolve_rate_required double precision NOT NULL DEFAULT 70,
  ending_innovation_min_science integer NOT NULL DEFAULT 14,
  ending_innovation_min_tech integer NOT NULL DEFAULT 220,
  ending_innovation_min_low_carbon integer NOT NULL DEFAULT 170,
  ending_innovation_max_carbon integer NOT NULL DEFAULT 95,
  ending_innovation_min_profit double precision NOT NULL DEFAULT 120,
  ending_ecology_min_ecology integer NOT NULL DEFAULT 14,
  ending_ecology_min_green integer NOT NULL DEFAULT 140,
  ending_ecology_min_low_carbon integer NOT NULL DEFAULT 170,
  ending_ecology_max_carbon integer NOT NULL DEFAULT 70,
  ending_ecology_min_quota integer NOT NULL DEFAULT 30,
  ending_doughnut_min_society integer NOT NULL DEFAULT 12,
  ending_doughnut_min_satisfaction integer NOT NULL DEFAULT 92,
  ending_doughnut_min_population integer NOT NULL DEFAULT 110,
  ending_doughnut_min_domain integer NOT NULL DEFAULT 8,
  ending_doughnut_min_low_carbon integer NOT NULL DEFAULT 165,
  ending_doughnut_max_carbon integer NOT NULL DEFAULT 80,
  ending_doughnut_min_policy_usage_6768 integer NOT NULL DEFAULT 3,
  config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_balance_rule_enabled
  ON game.game_balance_rule_config(is_enabled, config_id);

INSERT INTO game.game_balance_rule_config (
  config_id, config_snapshot
) VALUES (
  1,
  '{"initial":{"phase":"early","eventCooldown":0,"boardSize":6,"resources":{"industry":30,"tech":20,"population":25},"metrics":{"green":50,"carbon":80,"satisfaction":60,"lowCarbonScore":0},"quota":50},"draw":{"initialEarly":4,"early":4,"mid":3,"late":2},"phase":{"earlyMaxCards":15,"earlyMaxScore":59,"midMinCards":16,"midMaxCards":30,"midMinScore":60,"midMaxScore":100,"lateMinCards":31,"lateMinScore":101,"lateRemainingCardsThreshold":10},"trade":{"randomBaseMin":0.8,"randomSpan":0.4,"highCarbonThreshold":100,"highCarbonFactor":1.1,"lowCarbonThreshold":60,"lowCarbonFactor":0.9},"ending":{"lowCarbonMin":120}}'::jsonb
)
ON CONFLICT (config_id) DO UPDATE SET
  is_enabled = true,
  config_snapshot = EXCLUDED.config_snapshot,
  updated_at = now();


-- ============================================================================
-- YouthLoop Game Schema Migration V011
-- Schema: game
-- Purpose: Add ending display content config
-- ============================================================================

CREATE TABLE IF NOT EXISTS game.game_ending_content_config (
  ending_id text PRIMARY KEY,
  ending_name text NOT NULL,
  image_key text NOT NULL,
  default_reason text NOT NULL DEFAULT '',
  failure_reason_high_carbon text NOT NULL DEFAULT '',
  failure_reason_trade text NOT NULL DEFAULT '',
  failure_reason_low_score text NOT NULL DEFAULT '',
  failure_reason_boundary_default text NOT NULL DEFAULT '',
  config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_ending_content_enabled
  ON game.game_ending_content_config(is_enabled, ending_id);

INSERT INTO game.game_ending_content_config (
  ending_id, ending_name, image_key, default_reason,
  failure_reason_high_carbon, failure_reason_trade, failure_reason_low_score, failure_reason_boundary_default, config_snapshot
) VALUES
  ('innovation_technology', '创新科技结局', 'endings/创新科技结局.jpg', '科技板块成为主导，城市通过技术迭代实现减排与增长。', '', '', '', '', '{"endingId":"innovation_technology"}'::jsonb),
  ('ecology_priority', '生态优先结局', 'endings/生态优先结局.jpg', '生态板块成为主导，绿建和碳汇能力达成高水平。', '', '', '', '', '{"endingId":"ecology_priority"}'::jsonb),
  ('doughnut_city', '甜甜圈结局', 'endings/甜甜圈结局.jpg', '社会公平与低碳协同，城市进入甜甜圈稳态。', '', '', '', '', '{"endingId":"doughnut_city"}'::jsonb),
  ('failure', '失败结局', 'endings/失败结局.jpg', '已达到终局边界但未满足任一正向结局条件。',
   '碳排放连续5回合高于130，系统进入失控状态。',
   '配额耗尽记录达到4次且碳交易盈利为负。',
   '终局时低碳总分低于120。',
   '已达到终局边界但未满足任一正向结局条件。',
   '{"endingId":"failure"}'::jsonb)
ON CONFLICT (ending_id) DO UPDATE SET
  ending_name = EXCLUDED.ending_name,
  image_key = EXCLUDED.image_key,
  default_reason = EXCLUDED.default_reason,
  failure_reason_high_carbon = EXCLUDED.failure_reason_high_carbon,
  failure_reason_trade = EXCLUDED.failure_reason_trade,
  failure_reason_low_score = EXCLUDED.failure_reason_low_score,
  failure_reason_boundary_default = EXCLUDED.failure_reason_boundary_default,
  config_snapshot = EXCLUDED.config_snapshot,
  is_enabled = true,
  updated_at = now();


-- ============================================================================
-- YouthLoop Game Schema Migration V012
-- Schema: game
-- Purpose: Add runtime UI configuration for ending display and turn transition
-- ============================================================================

ALTER TABLE game.game_runtime_param_config
  ADD COLUMN IF NOT EXISTS ending_display_seconds integer NOT NULL DEFAULT 5 CHECK (ending_display_seconds >= 1),
  ADD COLUMN IF NOT EXISTS turn_transition_animation_enabled_default boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS turn_transition_animation_seconds integer NOT NULL DEFAULT 2 CHECK (turn_transition_animation_seconds >= 1);

UPDATE game.game_runtime_param_config
SET ending_display_seconds = COALESCE(ending_display_seconds, 5),
    turn_transition_animation_enabled_default = COALESCE(turn_transition_animation_enabled_default, true),
    turn_transition_animation_seconds = COALESCE(turn_transition_animation_seconds, 2),
    config_snapshot = COALESCE(config_snapshot, '{}'::jsonb)
        || jsonb_build_object(
            'endingDisplaySeconds', COALESCE(ending_display_seconds, 5),
            'turnTransitionAnimationEnabledDefault', COALESCE(turn_transition_animation_enabled_default, true),
            'turnTransitionAnimationSeconds', COALESCE(turn_transition_animation_seconds, 2)
        ),
    updated_at = now();


-- ============================================================================
-- YouthLoop Game Schema Migration V013
-- Schema: game
-- Purpose: Add runtime toggle for free board placement
-- ============================================================================

ALTER TABLE game.game_runtime_param_config
  ADD COLUMN IF NOT EXISTS free_placement_enabled boolean NOT NULL DEFAULT true;

UPDATE game.game_runtime_param_config
SET free_placement_enabled = COALESCE(free_placement_enabled, true),
    config_snapshot = COALESCE(config_snapshot, '{}'::jsonb)
        || jsonb_build_object(
            'freePlacementEnabled', COALESCE(free_placement_enabled, true)
        ),
    updated_at = now();
