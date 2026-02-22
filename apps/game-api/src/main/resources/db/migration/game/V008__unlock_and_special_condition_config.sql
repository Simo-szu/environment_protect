-- ============================================================================
-- YouthLoop Game Schema Migration V008
-- Schema: game
-- Purpose: Add configurable policy unlock rules and core special conditions
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

CREATE TABLE IF NOT EXISTS game.game_core_special_condition_config (
  card_id text PRIMARY KEY,
  required_event_type text NOT NULL DEFAULT '',
  min_industry_cards integer NOT NULL DEFAULT 0,
  min_ecology_cards integer NOT NULL DEFAULT 0,
  min_science_cards integer NOT NULL DEFAULT 0,
  min_society_cards integer NOT NULL DEFAULT 0,
  config_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_game_core_special_condition_card FOREIGN KEY (card_id) REFERENCES game.game_card(card_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_core_special_condition_enabled
  ON game.game_core_special_condition_config(is_enabled, card_id);

INSERT INTO game.game_core_special_condition_config (
  card_id, required_event_type,
  min_industry_cards, min_ecology_cards, min_science_cards, min_society_cards,
  config_snapshot
) VALUES
  ('card056', 'flood', 0, 0, 0, 0, '{"cardId":"card056","rule":"requires flood in history"}'::jsonb),
  ('card059', '', 0, 2, 0, 0, '{"cardId":"card059","rule":"requires ecology cards >=2"}'::jsonb)
ON CONFLICT (card_id) DO UPDATE SET
  required_event_type = EXCLUDED.required_event_type,
  min_industry_cards = EXCLUDED.min_industry_cards,
  min_ecology_cards = EXCLUDED.min_ecology_cards,
  min_science_cards = EXCLUDED.min_science_cards,
  min_society_cards = EXCLUDED.min_society_cards,
  config_snapshot = EXCLUDED.config_snapshot,
  is_enabled = true,
  updated_at = now();
