-- ============================================================================
-- YouthLoop Game Schema Migration V017
-- Schema: game
-- Purpose: Improve event resolution accessibility by allowing card061 as fallback responder
-- ============================================================================

UPDATE game.game_event_rule_config
SET
    resolvable_policy_ids_csv = 'card061,card063,card064',
    resolution_hint = 'Use card061/card063/card064 to resolve',
    updated_at = now()
WHERE event_type = 'flood';

UPDATE game.game_event_rule_config
SET
    resolvable_policy_ids_csv = 'card061,card062,card066',
    resolution_hint = 'Use card061/card062/card066 to resolve',
    updated_at = now()
WHERE event_type = 'sea_level_rise';

UPDATE game.game_event_rule_config
SET
    resolvable_policy_ids_csv = 'card061,card067,card068',
    resolution_hint = 'Use card061/card067/card068 to resolve',
    updated_at = now()
WHERE event_type = 'citizen_protest';
