-- ============================================================================
-- YouthLoop Game Schema Migration V004
-- Schema: game
-- Purpose: Add flattened policy effect columns and seed policy cards
-- ============================================================================

ALTER TABLE game.game_card
    ADD COLUMN IF NOT EXISTS policy_immediate_industry_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_immediate_tech_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_immediate_population_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_immediate_green_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_immediate_carbon_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_immediate_satisfaction_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_immediate_quota_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_immediate_group text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS policy_immediate_turns integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_industry_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_tech_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_population_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_green_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_carbon_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_satisfaction_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_low_carbon_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_green_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_tech_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_population_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_industry_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_continuous_industry_carbon_reduction_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS policy_immediate_effect jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS policy_continuous_effect jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION game.sync_game_card_policy_effect_jsonb()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.policy_immediate_effect := jsonb_build_object(
        'industryDelta', NEW.policy_immediate_industry_delta,
        'techDelta', NEW.policy_immediate_tech_delta,
        'populationDelta', NEW.policy_immediate_population_delta,
        'greenDelta', NEW.policy_immediate_green_delta,
        'carbonDelta', NEW.policy_immediate_carbon_delta,
        'satisfactionDelta', NEW.policy_immediate_satisfaction_delta,
        'quotaDelta', NEW.policy_immediate_quota_delta,
        'group', NEW.policy_immediate_group,
        'turns', NEW.policy_immediate_turns
    );

    NEW.policy_continuous_effect := jsonb_build_object(
        'industryDelta', NEW.policy_continuous_industry_delta,
        'techDelta', NEW.policy_continuous_tech_delta,
        'populationDelta', NEW.policy_continuous_population_delta,
        'greenDelta', NEW.policy_continuous_green_delta,
        'carbonDelta', NEW.policy_continuous_carbon_delta,
        'satisfactionDelta', NEW.policy_continuous_satisfaction_delta,
        'lowCarbonDelta', NEW.policy_continuous_low_carbon_delta,
        'greenPct', NEW.policy_continuous_green_pct,
        'techPct', NEW.policy_continuous_tech_pct,
        'populationPct', NEW.policy_continuous_population_pct,
        'industryPct', NEW.policy_continuous_industry_pct,
        'industryCarbonReductionPct', NEW.policy_continuous_industry_carbon_reduction_pct
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_game_card_policy_effect_jsonb ON game.game_card;
CREATE TRIGGER trg_sync_game_card_policy_effect_jsonb
BEFORE INSERT OR UPDATE ON game.game_card
FOR EACH ROW
EXECUTE FUNCTION game.sync_game_card_policy_effect_jsonb();

UPDATE game.game_card
SET
    policy_immediate_industry_delta = 15,
    policy_immediate_carbon_delta = -8,
    policy_immediate_group = 'industry_support',
    policy_immediate_turns = 3,
    policy_continuous_industry_delta = 5,
    updated_at = now()
WHERE card_id = 'card061';

UPDATE game.game_card
SET
    policy_immediate_carbon_delta = -30,
    policy_immediate_group = 'carbon_control',
    policy_immediate_turns = 3,
    policy_continuous_carbon_delta = -5,
    policy_continuous_industry_carbon_reduction_pct = 20,
    updated_at = now()
WHERE card_id = 'card062';

UPDATE game.game_card
SET
    policy_immediate_green_delta = 20,
    policy_immediate_satisfaction_delta = 8,
    policy_immediate_group = 'ecology',
    policy_immediate_turns = 3,
    policy_continuous_green_delta = 3,
    policy_continuous_carbon_delta = -4,
    updated_at = now()
WHERE card_id = 'card063';

UPDATE game.game_card
SET
    policy_immediate_green_delta = 15,
    policy_immediate_quota_delta = 3,
    policy_immediate_group = 'ecology',
    policy_immediate_turns = 3,
    policy_continuous_green_pct = 5,
    updated_at = now()
WHERE card_id = 'card064';

UPDATE game.game_card
SET
    policy_immediate_tech_delta = 25,
    policy_immediate_group = 'science_support',
    policy_immediate_turns = 3,
    policy_continuous_tech_delta = 6,
    policy_continuous_tech_pct = 12,
    updated_at = now()
WHERE card_id = 'card065';

UPDATE game.game_card
SET
    policy_immediate_tech_delta = 20,
    policy_immediate_carbon_delta = -40,
    policy_immediate_group = 'carbon_control',
    policy_immediate_turns = 3,
    policy_continuous_carbon_delta = -8,
    updated_at = now()
WHERE card_id = 'card066';

UPDATE game.game_card
SET
    policy_immediate_population_delta = 10,
    policy_immediate_satisfaction_delta = 20,
    policy_immediate_group = 'society_support',
    policy_immediate_turns = 3,
    policy_continuous_population_delta = 3,
    policy_continuous_satisfaction_delta = 4,
    updated_at = now()
WHERE card_id = 'card067';

UPDATE game.game_card
SET
    policy_immediate_population_delta = 8,
    policy_immediate_satisfaction_delta = 18,
    policy_immediate_group = 'citizen',
    policy_immediate_turns = 3,
    policy_continuous_satisfaction_delta = 5,
    policy_continuous_low_carbon_delta = 2,
    updated_at = now()
WHERE card_id = 'card068';

UPDATE game.game_card
SET updated_at = now()
WHERE card_id IN ('card061', 'card062', 'card063', 'card064', 'card065', 'card066', 'card067', 'card068');
