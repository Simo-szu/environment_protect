-- ============================================================================
-- YouthLoop Game Schema Migration V014
-- Schema: game
-- Purpose: Numerical rebalance for early phase card strength curve
-- ============================================================================

-- Rebalance card001 (Traditional Manufacturing) to prevent it from being a "must-pick" with 0 cost
UPDATE game.game_card
SET
    unlock_cost_industry = 4,
    core_continuous_industry_delta = 14,
    updated_at = now()
WHERE
    card_id = 'card001';

-- Slightly lower costs for other basic industry cards to make them more attractive
UPDATE game.game_card
SET
    unlock_cost_industry = 4
WHERE
    card_id = 'card002';
-- Was 5
UPDATE game.game_card
SET
    unlock_cost_industry = 6
WHERE
    card_id = 'card003';
-- Was 8
UPDATE game.game_card
SET
    unlock_cost_industry = 5
WHERE
    card_id = 'card004';
-- Was 6

-- Buff early Science cards further to encourage early tech investment
-- Already buffed in V007 to 14/12, lowering further to 10/8
UPDATE game.game_card
SET
    unlock_cost_industry = 10
WHERE
    card_id = 'card036';

UPDATE game.game_card
SET
    unlock_cost_industry = 8
WHERE
    card_id = 'card037';

-- Buff early Ecology cards slightly by reducing cost
UPDATE game.game_card
SET
    unlock_cost_industry = 12
WHERE
    card_id = 'card021';
-- Was 15
UPDATE game.game_card
SET
    unlock_cost_industry = 10
WHERE
    card_id = 'card022';
-- Was 12
UPDATE game.game_card
SET
    unlock_cost_industry = 15
WHERE
    card_id = 'card023';
-- Was 18

-- Enable adjacency requirement by default to increase strategic depth
-- Since the user mentioned UI is fixed, let's make the board matter more.
UPDATE game.game_runtime_param_config
SET
    free_placement_enabled = false,
    config_snapshot = jsonb_set(
        config_snapshot,
        '{freePlacementEnabled}',
        'false'::jsonb,
        true
    ),
    updated_at = now()
WHERE
    config_id = 1;