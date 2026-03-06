-- ============================================================================
-- YouthLoop Game Schema Migration V008
-- Schema: game
-- Purpose: Delay the first negative-event check by one additional turn
-- ============================================================================

UPDATE game.game_balance_rule_config
SET
    initial_event_cooldown = 2,
    config_snapshot = jsonb_set(
        COALESCE(config_snapshot, '{}'::jsonb),
        '{initial,eventCooldown}',
        '2'::jsonb,
        true
    ),
    updated_at = now()
WHERE config_id = 1;
