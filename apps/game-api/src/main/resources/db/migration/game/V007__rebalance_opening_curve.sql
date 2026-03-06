-- ============================================================================
-- YouthLoop Game Schema Migration V007
-- Schema: game
-- Purpose: Rebalance early opening curve, science placement payoff, and early event pacing
-- ============================================================================

UPDATE game.game_card
SET
    phase_bucket = 'mid',
    updated_at = now()
WHERE card_id = 'card055';

UPDATE game.game_card
SET
    unlock_cost_industry = 14,
    core_continuous_tech_delta = 2,
    updated_at = now()
WHERE card_id = 'card036';

UPDATE game.game_card
SET
    unlock_cost_industry = 12,
    core_continuous_tech_delta = 2,
    updated_at = now()
WHERE card_id = 'card037';

UPDATE game.game_combo_rule_config
SET
    min_science = 3,
    min_science_science_adjacent_pairs = 1,
    updated_at = now()
WHERE combo_id = 'intra_science_boost';

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
