-- ============================================================================
-- YouthLoop Game Schema Migration V016
-- Schema: game
-- Purpose: Stabilize phase progression and reduce deck exhaustion deadlocks
-- ============================================================================

UPDATE game.game_balance_rule_config
SET
    draw_count_early = 2,
    draw_count_mid = 2,
    draw_count_late = 1,
    phase_late_remaining_cards_threshold = 3,
    config_snapshot = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{draw,early}', '2'::jsonb, true),
                '{draw,mid}', '2'::jsonb, true
            ),
            '{draw,late}', '1'::jsonb, true
        ),
        '{phase,lateRemainingCardsThreshold}', '3'::jsonb, true
    ),
    updated_at = now()
WHERE config_id = 1;
