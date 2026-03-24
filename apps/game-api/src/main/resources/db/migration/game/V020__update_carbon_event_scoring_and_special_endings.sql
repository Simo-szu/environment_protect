-- ============================================================================
-- YouthLoop Game Schema Migration V020
-- Schema: game
-- Purpose: Align carbon threshold/event unlock and add special ending content
-- ============================================================================

-- 1) Negative event threshold: high-carbon abnormal event starts at carbon >= 130.
UPDATE game.game_event_rule_config
SET
    min_carbon = 130,
    updated_at = now()
WHERE event_type = 'sea_level_rise';

-- 2) Policy unlock threshold: industrial carbon control policy unlock at carbon >= 110.
UPDATE game.game_policy_unlock_rule_config
SET
    min_carbon = 110,
    config_snapshot = COALESCE(config_snapshot, '{}'::jsonb)
        || jsonb_build_object('rule', 'industry>=8 and carbon>=110'),
    updated_at = now()
WHERE policy_id = 'card062';

-- 3) Low-carbon carbon-tier scoring update.
UPDATE game.game_balance_rule_config
SET
    carbon_tier_1_max = 80,
    carbon_tier_1_score = 3,
    carbon_tier_2_max = 90,
    carbon_tier_2_score = 0,
    carbon_tier_3_max = 110,
    carbon_tier_3_score = -2,
    carbon_tier_4_max = 140,
    carbon_tier_4_score = -5,
    carbon_tier_5_score = -8,
    low_carbon_over_limit_carbon_threshold = 90,
    low_carbon_over_limit_streak_threshold = 3,
    low_carbon_over_limit_streak_penalty = 15,
    config_snapshot = jsonb_set(
        jsonb_set(
            jsonb_set(
                COALESCE(config_snapshot, '{}'::jsonb),
                '{scoring,carbonTier}',
                '{"tier1Max":80,"tier1Score":3,"tier2Max":90,"tier2Score":0,"tier3Max":110,"tier3Score":-2,"tier4Max":140,"tier4Score":-5,"tier5Score":-8}'::jsonb,
                true
            ),
            '{scoring,overLimitStreak}',
            '{"carbonThreshold":90,"streakThreshold":3,"penalty":15}'::jsonb,
            true
        ),
        '{tuningVersion}',
        '"v020"'::jsonb,
        true
    ),
    updated_at = now()
WHERE config_id = 1;

-- 4) Add special ending content.
INSERT INTO game.game_ending_content_config (
  ending_id, ending_name, image_key, default_reason,
  failure_reason_high_carbon, failure_reason_trade, failure_reason_low_score, failure_reason_boundary_default, config_snapshot
) VALUES
  ('zero_trade_ecology_priority', '零交易稳健・生态优先', 'endings/生态优先结局.jpg',
   '你坚持生态优先与零交易稳健策略，在不依赖碳交易的前提下，持续控碳并达成高质量低碳发展。',
   '', '', '', '',
   '{"endingId":"zero_trade_ecology_priority"}'::jsonb),
  ('speedrun_efficient_layout', '快速通关・高效布局', 'endings/创新科技结局.jpg',
   '你在较少回合内完成高效布局，兼顾盈利与控碳，以极强执行力实现速通目标。',
   '', '', '', '',
   '{"endingId":"speedrun_efficient_layout"}'::jsonb)
ON CONFLICT (ending_id) DO UPDATE SET
  ending_name = EXCLUDED.ending_name,
  image_key = EXCLUDED.image_key,
  default_reason = EXCLUDED.default_reason,
  config_snapshot = EXCLUDED.config_snapshot,
  is_enabled = true,
  updated_at = now();
