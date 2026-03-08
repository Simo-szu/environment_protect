-- ============================================================================
-- YouthLoop Game Schema Migration V018
-- Schema: game
-- Purpose: Guarantee early policy loop and increase event interaction frequency
-- ============================================================================

-- Ensure at least one low-threshold policy is always unlockable early.
UPDATE game.game_policy_unlock_rule_config
SET
    min_industry = 0,
    min_ecology = 0,
    min_science = 0,
    min_society = 0,
    min_industry_resource = 0,
    min_tech_resource = 0,
    min_population_resource = 0,
    min_green = NULL,
    min_carbon = NULL,
    max_carbon = NULL,
    min_satisfaction = NULL,
    min_tagged_cards = 0,
    required_tag = '',
    config_snapshot = jsonb_set(
        COALESCE(config_snapshot, '{}'::jsonb),
        '{rule}',
        '"always unlock after first end turn"'::jsonb,
        true
    ),
    updated_at = now()
WHERE policy_id = 'card061';

-- Increase negative-event trigger frequency (must stay consistent across enabled rules).
UPDATE game.game_event_rule_config
SET
    trigger_probability_pct = 45,
    updated_at = now()
WHERE is_enabled = true;

-- Slightly reduce first-event delay so policy-event interaction happens earlier.
UPDATE game.game_balance_rule_config
SET
    initial_event_cooldown = 1,
    config_snapshot = jsonb_set(
        COALESCE(config_snapshot, '{}'::jsonb),
        '{initial,eventCooldown}',
        '1'::jsonb,
        true
    ),
    updated_at = now()
WHERE config_id = 1;
