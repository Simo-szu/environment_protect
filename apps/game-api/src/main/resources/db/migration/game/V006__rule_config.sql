-- ============================================================================
-- YouthLoop Game Schema Migration V006
-- Schema: game
-- Purpose: Add event and combo rule config tables
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
