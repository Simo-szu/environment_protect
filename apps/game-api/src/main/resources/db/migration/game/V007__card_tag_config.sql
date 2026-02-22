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
