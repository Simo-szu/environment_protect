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


-- ============================================================================
-- YouthLoop Game Schema Migration V005
-- Schema: game
-- Purpose: Add flattened core effect columns with jsonb redundancy
-- ============================================================================

ALTER TABLE game.game_card
    ADD COLUMN IF NOT EXISTS core_domain_progress_bonus integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_industry_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_tech_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_population_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_green_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_carbon_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_satisfaction_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_quota_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_low_carbon_delta integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_industry_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_tech_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_population_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_green_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_global_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_low_carbon_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_industry_carbon_reduction_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_carbon_delta_reduction_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_trade_price_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_combo_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_min_turn integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_min_industry_resource integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_min_tech_resource integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_max_carbon integer NOT NULL DEFAULT 2147483647,
    ADD COLUMN IF NOT EXISTS core_condition_min_industry_cards integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_min_industry_progress_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_min_green integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_min_society_progress_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_min_tagged_cards integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_required_tag text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS core_special_ecology_card_cost_reduction_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_special_science_card_cost_reduction_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_special_flood_resistance_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_special_new_energy_industry_pct integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_special_ecology_carbon_sink_per_ten_green integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_continuous_effect jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS core_effect_condition jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS core_special_effect jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION game.sync_game_card_core_effect_jsonb()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.core_continuous_effect := jsonb_build_object(
        'industryDelta', NEW.core_continuous_industry_delta,
        'techDelta', NEW.core_continuous_tech_delta,
        'populationDelta', NEW.core_continuous_population_delta,
        'greenDelta', NEW.core_continuous_green_delta,
        'carbonDelta', NEW.core_continuous_carbon_delta,
        'satisfactionDelta', NEW.core_continuous_satisfaction_delta,
        'quotaDelta', NEW.core_continuous_quota_delta,
        'lowCarbonDelta', NEW.core_continuous_low_carbon_delta,
        'industryPct', NEW.core_continuous_industry_pct,
        'techPct', NEW.core_continuous_tech_pct,
        'populationPct', NEW.core_continuous_population_pct,
        'greenPct', NEW.core_continuous_green_pct,
        'globalPct', NEW.core_continuous_global_pct,
        'lowCarbonPct', NEW.core_continuous_low_carbon_pct,
        'industryCarbonReductionPct', NEW.core_continuous_industry_carbon_reduction_pct,
        'carbonDeltaReductionPct', NEW.core_continuous_carbon_delta_reduction_pct,
        'tradePricePct', NEW.core_continuous_trade_price_pct,
        'comboPct', NEW.core_continuous_combo_pct
    );

    NEW.core_effect_condition := jsonb_build_object(
        'minTurn', NEW.core_condition_min_turn,
        'minIndustryResource', NEW.core_condition_min_industry_resource,
        'minTechResource', NEW.core_condition_min_tech_resource,
        'maxCarbon', NEW.core_condition_max_carbon,
        'minIndustryCards', NEW.core_condition_min_industry_cards,
        'minIndustryProgressPct', NEW.core_condition_min_industry_progress_pct,
        'minGreen', NEW.core_condition_min_green,
        'minSocietyProgressPct', NEW.core_condition_min_society_progress_pct,
        'minTaggedCards', NEW.core_condition_min_tagged_cards,
        'requiredTag', NEW.core_condition_required_tag
    );

    NEW.core_special_effect := jsonb_build_object(
        'ecologyCardCostReductionPct', NEW.core_special_ecology_card_cost_reduction_pct,
        'scienceCardCostReductionPct', NEW.core_special_science_card_cost_reduction_pct,
        'floodResistancePct', NEW.core_special_flood_resistance_pct,
        'newEnergyIndustryPct', NEW.core_special_new_energy_industry_pct,
        'ecologyCarbonSinkPerTenGreen', NEW.core_special_ecology_carbon_sink_per_ten_green
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_game_card_core_effect_jsonb ON game.game_card;
CREATE TRIGGER trg_sync_game_card_core_effect_jsonb
BEFORE INSERT OR UPDATE ON game.game_card
FOR EACH ROW
EXECUTE FUNCTION game.sync_game_card_core_effect_jsonb();

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card001';

UPDATE game.game_card SET
    core_domain_progress_bonus = 4,
    updated_at = now()
WHERE card_id = 'card002';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card003';

UPDATE game.game_card SET
    core_domain_progress_bonus = 4,
    updated_at = now()
WHERE card_id = 'card004';

UPDATE game.game_card SET
    core_domain_progress_bonus = 6,
    updated_at = now()
WHERE card_id = 'card005';

UPDATE game.game_card SET
    core_domain_progress_bonus = 7,
    updated_at = now()
WHERE card_id = 'card006';

UPDATE game.game_card SET
    core_domain_progress_bonus = 8,
    updated_at = now()
WHERE card_id = 'card007';

UPDATE game.game_card SET
    core_domain_progress_bonus = 7,
    updated_at = now()
WHERE card_id = 'card008';

UPDATE game.game_card SET
    core_domain_progress_bonus = 10,
    updated_at = now()
WHERE card_id = 'card009';

UPDATE game.game_card SET
    core_domain_progress_bonus = 12,
    updated_at = now()
WHERE card_id = 'card010';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card011';

UPDATE game.game_card SET
    core_domain_progress_bonus = 4,
    updated_at = now()
WHERE card_id = 'card012';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card013';

UPDATE game.game_card SET
    core_domain_progress_bonus = 6,
    updated_at = now()
WHERE card_id = 'card014';

UPDATE game.game_card SET
    core_domain_progress_bonus = 15,
    updated_at = now()
WHERE card_id = 'card015';

UPDATE game.game_card SET
    core_domain_progress_bonus = 14,
    updated_at = now()
WHERE card_id = 'card016';

UPDATE game.game_card SET
    core_domain_progress_bonus = 16,
    updated_at = now()
WHERE card_id = 'card017';

UPDATE game.game_card SET
    core_domain_progress_bonus = 13,
    updated_at = now()
WHERE card_id = 'card018';

UPDATE game.game_card SET
    core_domain_progress_bonus = 3,
    updated_at = now()
WHERE card_id = 'card021';

UPDATE game.game_card SET
    core_domain_progress_bonus = 2,
    updated_at = now()
WHERE card_id = 'card022';

UPDATE game.game_card SET
    core_domain_progress_bonus = 4,
    updated_at = now()
WHERE card_id = 'card023';

UPDATE game.game_card SET
    core_domain_progress_bonus = 4,
    updated_at = now()
WHERE card_id = 'card024';

UPDATE game.game_card SET
    core_domain_progress_bonus = 6,
    updated_at = now()
WHERE card_id = 'card025';

UPDATE game.game_card SET
    core_domain_progress_bonus = 7,
    updated_at = now()
WHERE card_id = 'card026';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card027';

UPDATE game.game_card SET
    core_domain_progress_bonus = 6,
    updated_at = now()
WHERE card_id = 'card028';

UPDATE game.game_card SET
    core_domain_progress_bonus = 10,
    updated_at = now()
WHERE card_id = 'card029';

UPDATE game.game_card SET
    core_domain_progress_bonus = 12,
    updated_at = now()
WHERE card_id = 'card030';

UPDATE game.game_card SET
    core_domain_progress_bonus = 7,
    updated_at = now()
WHERE card_id = 'card032';

UPDATE game.game_card SET
    core_domain_progress_bonus = 8,
    updated_at = now()
WHERE card_id = 'card033';

UPDATE game.game_card SET
    core_domain_progress_bonus = 6,
    updated_at = now()
WHERE card_id = 'card034';

UPDATE game.game_card SET
    core_domain_progress_bonus = 3,
    updated_at = now()
WHERE card_id = 'card036';

UPDATE game.game_card SET
    core_domain_progress_bonus = 2,
    updated_at = now()
WHERE card_id = 'card037';

UPDATE game.game_card SET
    core_domain_progress_bonus = 6,
    updated_at = now()
WHERE card_id = 'card038';

UPDATE game.game_card SET
    core_domain_progress_bonus = 7,
    updated_at = now()
WHERE card_id = 'card039';

UPDATE game.game_card SET
    core_domain_progress_bonus = 6,
    updated_at = now()
WHERE card_id = 'card040';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card041';

UPDATE game.game_card SET
    core_domain_progress_bonus = 10,
    updated_at = now()
WHERE card_id = 'card042';

UPDATE game.game_card SET
    core_domain_progress_bonus = 12,
    updated_at = now()
WHERE card_id = 'card043';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card045';

UPDATE game.game_card SET
    core_domain_progress_bonus = 3,
    updated_at = now()
WHERE card_id = 'card046';

UPDATE game.game_card SET
    core_domain_progress_bonus = 2,
    updated_at = now()
WHERE card_id = 'card047';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card048';

UPDATE game.game_card SET
    core_domain_progress_bonus = 6,
    updated_at = now()
WHERE card_id = 'card049';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card050';

UPDATE game.game_card SET
    core_domain_progress_bonus = 5,
    updated_at = now()
WHERE card_id = 'card051';

UPDATE game.game_card SET
    core_domain_progress_bonus = 8,
    updated_at = now()
WHERE card_id = 'card052';

UPDATE game.game_card SET
    core_continuous_industry_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card001';

UPDATE game.game_card SET
    core_continuous_industry_delta = 2,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card002';

UPDATE game.game_card SET
    core_continuous_industry_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card003';

UPDATE game.game_card SET
    core_continuous_industry_delta = 2,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card004';

UPDATE game.game_card SET
    core_continuous_industry_delta = 4,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card005';

UPDATE game.game_card SET
    core_continuous_industry_delta = 5,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card006';

UPDATE game.game_card SET
    core_continuous_industry_delta = 5,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card007';

UPDATE game.game_card SET
    core_continuous_industry_delta = 4,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card008';

UPDATE game.game_card SET
    core_continuous_industry_delta = 25,
    updated_at = now()
WHERE card_id = 'card009';

UPDATE game.game_card SET
    core_continuous_industry_delta = 28,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card010';

UPDATE game.game_card SET
    core_continuous_industry_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card011';

UPDATE game.game_card SET
    core_continuous_industry_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card012';

UPDATE game.game_card SET
    core_continuous_industry_delta = 4,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card013';

UPDATE game.game_card SET
    core_continuous_industry_delta = 4,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card014';

UPDATE game.game_card SET
    core_continuous_industry_delta = 30,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card015';

UPDATE game.game_card SET
    core_continuous_industry_delta = 29,
    updated_at = now()
WHERE card_id = 'card016';

UPDATE game.game_card SET
    core_continuous_industry_delta = 32,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card017';

UPDATE game.game_card SET
    core_continuous_industry_delta = 27,
    core_continuous_carbon_delta = -3,
    updated_at = now()
WHERE card_id = 'card018';

UPDATE game.game_card SET
    core_continuous_industry_pct = 20,
    updated_at = now()
WHERE card_id = 'card019';

UPDATE game.game_card SET
    core_continuous_industry_carbon_reduction_pct = 5,
    updated_at = now()
WHERE card_id = 'card020';

UPDATE game.game_card SET
    core_continuous_green_delta = 2,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card021';

UPDATE game.game_card SET
    core_continuous_green_delta = 2,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card022';

UPDATE game.game_card SET
    core_continuous_green_delta = 2,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card023';

UPDATE game.game_card SET
    core_continuous_green_delta = 2,
    core_continuous_carbon_delta = -1,
    updated_at = now()
WHERE card_id = 'card024';

UPDATE game.game_card SET
    core_continuous_green_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card025';

UPDATE game.game_card SET
    core_continuous_green_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card026';

UPDATE game.game_card SET
    core_continuous_green_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card027';

UPDATE game.game_card SET
    core_continuous_green_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card028';

UPDATE game.game_card SET
    core_continuous_green_delta = 12,
    core_continuous_carbon_delta = -8,
    updated_at = now()
WHERE card_id = 'card029';

UPDATE game.game_card SET
    core_continuous_green_delta = 10,
    core_continuous_carbon_delta = -6,
    updated_at = now()
WHERE card_id = 'card030';

UPDATE game.game_card SET
    core_continuous_green_pct = 30,
    updated_at = now()
WHERE card_id = 'card031';

UPDATE game.game_card SET
    core_continuous_industry_delta = 1,
    core_continuous_green_delta = 3,
    updated_at = now()
WHERE card_id = 'card032';

UPDATE game.game_card SET
    core_continuous_green_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card033';

UPDATE game.game_card SET
    core_continuous_green_delta = 3,
    core_continuous_carbon_delta = -2,
    updated_at = now()
WHERE card_id = 'card034';

UPDATE game.game_card SET
    core_continuous_tech_delta = 1,
    updated_at = now()
WHERE card_id = 'card036';

UPDATE game.game_card SET
    core_continuous_tech_delta = 1,
    updated_at = now()
WHERE card_id = 'card037';

UPDATE game.game_card SET
    core_continuous_carbon_delta = -3,
    updated_at = now()
WHERE card_id = 'card038';

UPDATE game.game_card SET
    core_continuous_industry_carbon_reduction_pct = 15,
    updated_at = now()
WHERE card_id = 'card039';

UPDATE game.game_card SET
    core_continuous_carbon_delta_reduction_pct = 5,
    updated_at = now()
WHERE card_id = 'card041';

UPDATE game.game_card SET
    core_continuous_tech_delta = 3,
    core_continuous_global_pct = 10,
    updated_at = now()
WHERE card_id = 'card042';

UPDATE game.game_card SET
    core_continuous_trade_price_pct = 30,
    updated_at = now()
WHERE card_id = 'card043';

UPDATE game.game_card SET
    core_continuous_tech_delta = 2,
    updated_at = now()
WHERE card_id = 'card044';

UPDATE game.game_card SET
    core_continuous_population_delta = 1,
    updated_at = now()
WHERE card_id = 'card046';

UPDATE game.game_card SET
    core_continuous_population_delta = 1,
    updated_at = now()
WHERE card_id = 'card047';

UPDATE game.game_card SET
    core_continuous_carbon_delta = -1,
    core_continuous_satisfaction_delta = 1,
    updated_at = now()
WHERE card_id = 'card048';

UPDATE game.game_card SET
    core_continuous_carbon_delta = -2,
    core_continuous_satisfaction_delta = 2,
    updated_at = now()
WHERE card_id = 'card049';

UPDATE game.game_card SET
    core_continuous_carbon_delta = -1,
    core_continuous_satisfaction_delta = 1,
    updated_at = now()
WHERE card_id = 'card050';

UPDATE game.game_card SET
    core_continuous_satisfaction_delta = 2,
    updated_at = now()
WHERE card_id = 'card051';

UPDATE game.game_card SET
    core_continuous_industry_delta = 2,
    core_continuous_satisfaction_delta = 6,
    updated_at = now()
WHERE card_id = 'card052';

UPDATE game.game_card SET
    core_continuous_satisfaction_delta = 5,
    updated_at = now()
WHERE card_id = 'card053';

UPDATE game.game_card SET
    core_continuous_quota_delta = 5,
    core_continuous_trade_price_pct = 50,
    updated_at = now()
WHERE card_id = 'card054';

UPDATE game.game_card SET
    core_continuous_carbon_delta = -8,
    updated_at = now()
WHERE card_id = 'card055';

UPDATE game.game_card SET
    core_continuous_industry_pct = 50,
    updated_at = now()
WHERE card_id = 'card057';

UPDATE game.game_card SET
    core_continuous_combo_pct = 30,
    updated_at = now()
WHERE card_id = 'card058';

UPDATE game.game_card SET
    core_continuous_green_delta = 3,
    updated_at = now()
WHERE card_id = 'card059';

UPDATE game.game_card SET
    core_continuous_industry_delta = 8,
    core_continuous_industry_carbon_reduction_pct = 10,
    updated_at = now()
WHERE card_id = 'card060';

UPDATE game.game_card SET
    core_condition_min_turn = 5,
    core_condition_min_industry_resource = 0,
    core_condition_min_tech_resource = 0,
    core_condition_max_carbon = 2147483647,
    core_condition_min_industry_cards = 0,
    core_condition_min_industry_progress_pct = 0,
    core_condition_min_tagged_cards = 0,
    core_condition_required_tag = '',
    updated_at = now()
WHERE card_id = 'card054';

UPDATE game.game_card SET
    core_condition_min_turn = 0,
    core_condition_min_industry_resource = 0,
    core_condition_min_tech_resource = 20,
    core_condition_max_carbon = 2147483647,
    core_condition_min_industry_cards = 0,
    core_condition_min_industry_progress_pct = 0,
    core_condition_min_tagged_cards = 1,
    core_condition_required_tag = 'new_energy_industry',
    updated_at = now()
WHERE card_id = 'card055';

UPDATE game.game_card SET
    core_condition_min_turn = 0,
    core_condition_min_industry_resource = 0,
    core_condition_min_tech_resource = 0,
    core_condition_max_carbon = 2147483647,
    core_condition_min_industry_cards = 2,
    core_condition_min_industry_progress_pct = 40,
    core_condition_min_tagged_cards = 2,
    core_condition_required_tag = 'traditional_industry',
    updated_at = now()
WHERE card_id = 'card057';

UPDATE game.game_card SET
    core_condition_min_turn = 0,
    core_condition_min_industry_resource = 100,
    core_condition_min_tech_resource = 0,
    core_condition_max_carbon = 60,
    core_condition_min_industry_cards = 0,
    core_condition_min_industry_progress_pct = 0,
    core_condition_min_tagged_cards = 0,
    core_condition_required_tag = '',
    updated_at = now()
WHERE card_id = 'card060';

UPDATE game.game_card SET
    core_special_ecology_card_cost_reduction_pct = 20,
    core_special_science_card_cost_reduction_pct = 0,
    core_special_flood_resistance_pct = 0,
    core_special_new_energy_industry_pct = 0,
    core_special_ecology_carbon_sink_per_ten_green = 0,
    updated_at = now()
WHERE card_id = 'card035';

UPDATE game.game_card SET
    core_special_ecology_card_cost_reduction_pct = 0,
    core_special_science_card_cost_reduction_pct = 0,
    core_special_flood_resistance_pct = 0,
    core_special_new_energy_industry_pct = 20,
    core_special_ecology_carbon_sink_per_ten_green = 0,
    updated_at = now()
WHERE card_id = 'card040';

UPDATE game.game_card SET
    core_special_ecology_card_cost_reduction_pct = 0,
    core_special_science_card_cost_reduction_pct = 20,
    core_special_flood_resistance_pct = 0,
    core_special_new_energy_industry_pct = 0,
    core_special_ecology_carbon_sink_per_ten_green = 0,
    updated_at = now()
WHERE card_id = 'card045';

UPDATE game.game_card SET
    core_special_ecology_card_cost_reduction_pct = 50,
    core_special_science_card_cost_reduction_pct = 0,
    core_special_flood_resistance_pct = 60,
    core_special_new_energy_industry_pct = 0,
    core_special_ecology_carbon_sink_per_ten_green = 0,
    updated_at = now()
WHERE card_id = 'card056';

UPDATE game.game_card SET
    core_special_ecology_card_cost_reduction_pct = 0,
    core_special_science_card_cost_reduction_pct = 0,
    core_special_flood_resistance_pct = 0,
    core_special_new_energy_industry_pct = 0,
    core_special_ecology_carbon_sink_per_ten_green = 5,
    updated_at = now()
WHERE card_id = 'card059';

-- Consolidated from former V016 core condition supplement.
UPDATE game.game_card SET core_condition_min_tech_resource=10, updated_at=now() WHERE card_id='card019';
UPDATE game.game_card SET core_condition_min_tech_resource=15, updated_at=now() WHERE card_id='card031';
UPDATE game.game_card SET core_condition_min_tech_resource=12, updated_at=now() WHERE card_id='card035';
UPDATE game.game_card SET core_condition_min_tech_resource=3, updated_at=now() WHERE card_id='card044';
UPDATE game.game_card SET core_condition_min_tech_resource=8, updated_at=now() WHERE card_id='card053';

UPDATE game.game_card SET
    core_condition_min_turn=0,
    core_condition_min_tech_resource=15,
    updated_at=now()
WHERE card_id='card054';

UPDATE game.game_card SET
    core_condition_min_tech_resource=20,
    core_condition_min_tagged_cards=0,
    core_condition_required_tag='',
    updated_at=now()
WHERE card_id='card055';

UPDATE game.game_card SET
    core_condition_min_green=30,
    updated_at=now()
WHERE card_id='card056';

UPDATE game.game_card SET
    core_condition_min_industry_resource=80,
    core_condition_min_industry_progress_pct=0,
    core_condition_min_industry_cards=0,
    core_condition_min_tagged_cards=0,
    core_condition_required_tag='',
    updated_at=now()
WHERE card_id='card057';

UPDATE game.game_card SET
    core_condition_min_society_progress_pct=50,
    updated_at=now()
WHERE card_id='card058';

UPDATE game.game_card SET
    core_condition_min_green=25,
    updated_at=now()
WHERE card_id='card059';

UPDATE game.game_card SET
    core_condition_min_industry_resource=100,
    core_condition_max_carbon=2147483647,
    updated_at=now()
WHERE card_id='card060';


-- ============================================================================
-- YouthLoop Game Schema Migration V014
-- Schema: game
-- Purpose: Add flattened upgrade effect delta columns with jsonb redundancy
-- ============================================================================

ALTER TABLE game.game_card
    -- Fixed value deltas (parallel to core_continuous_*_delta)
    ADD COLUMN IF NOT EXISTS upgrade_delta_industry               integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_tech                   integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_population             integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_green                  integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_carbon                 integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_satisfaction           integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_quota                  integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_low_carbon             integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_sector_progress_pct   integer NOT NULL DEFAULT 0,
    -- Percentage modifier deltas (parallel to core_continuous_*_pct)
    ADD COLUMN IF NOT EXISTS upgrade_delta_industry_pct                    integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_green_pct                       integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_global_pct                      integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_tech_pct                        integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_industry_carbon_reduction_pct   integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_carbon_delta_reduction_pct      integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_trade_price_pct                 integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_combo_pct                       integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_shared_mobility_pct             integer NOT NULL DEFAULT 0,
    -- Special effect deltas (parallel to core_special_*)
    ADD COLUMN IF NOT EXISTS upgrade_delta_ecology_card_cost_pct           integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_science_card_cost_pct           integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_flood_resistance_pct            integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_new_energy_pct                  integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_ecology_sink                    integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_trad_upgrade_pct                integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upgrade_delta_upgrade_cost_pct                integer NOT NULL DEFAULT 0,
    -- JSONB redundancy (auto-synced by trigger)
    ADD COLUMN IF NOT EXISTS upgrade_effect jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION game.sync_game_card_upgrade_effect_jsonb()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.upgrade_effect := jsonb_build_object(
        'industryDelta',              NEW.upgrade_delta_industry,
        'techDelta',                  NEW.upgrade_delta_tech,
        'populationDelta',            NEW.upgrade_delta_population,
        'greenDelta',                 NEW.upgrade_delta_green,
        'carbonDelta',                NEW.upgrade_delta_carbon,
        'satisfactionDelta',          NEW.upgrade_delta_satisfaction,
        'quotaDelta',                 NEW.upgrade_delta_quota,
        'lowCarbonDelta',             NEW.upgrade_delta_low_carbon,
        'sectorProgressPct',          NEW.upgrade_delta_sector_progress_pct,
        'industryPct',                NEW.upgrade_delta_industry_pct,
        'greenPct',                   NEW.upgrade_delta_green_pct,
        'globalPct',                  NEW.upgrade_delta_global_pct,
        'techPct',                    NEW.upgrade_delta_tech_pct,
        'industryCarbonReductionPct', NEW.upgrade_delta_industry_carbon_reduction_pct,
        'carbonDeltaReductionPct',    NEW.upgrade_delta_carbon_delta_reduction_pct,
        'tradePricePct',              NEW.upgrade_delta_trade_price_pct,
        'comboPct',                   NEW.upgrade_delta_combo_pct,
        'sharedMobilityPct',          NEW.upgrade_delta_shared_mobility_pct,
        'ecologyCardCostPct',         NEW.upgrade_delta_ecology_card_cost_pct,
        'scienceCardCostPct',         NEW.upgrade_delta_science_card_cost_pct,
        'floodResistancePct',         NEW.upgrade_delta_flood_resistance_pct,
        'newEnergyPct',               NEW.upgrade_delta_new_energy_pct,
        'ecologySink',                NEW.upgrade_delta_ecology_sink,
        'tradUpgradePct',             NEW.upgrade_delta_trad_upgrade_pct,
        'upgradeCostPct',             NEW.upgrade_delta_upgrade_cost_pct
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_upgrade_effect_jsonb ON game.game_card;
CREATE TRIGGER trg_sync_upgrade_effect_jsonb
BEFORE INSERT OR UPDATE ON game.game_card
FOR EACH ROW
EXECUTE FUNCTION game.sync_game_card_upgrade_effect_jsonb();

-- ── Industry 1→2 ─────────────────────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_industry=3,  upgrade_delta_carbon=-5,  updated_at=now() WHERE card_id='card001';
UPDATE game.game_card SET upgrade_delta_industry=2,  upgrade_delta_carbon=-4,  updated_at=now() WHERE card_id='card002';
UPDATE game.game_card SET upgrade_delta_industry=3,  upgrade_delta_carbon=-4,  updated_at=now() WHERE card_id='card003';
UPDATE game.game_card SET upgrade_delta_industry=2,  upgrade_delta_carbon=-4,  updated_at=now() WHERE card_id='card004';

-- ── Industry 2→3 ─────────────────────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_industry=5,  upgrade_delta_carbon=-3,                                             updated_at=now() WHERE card_id='card005';
UPDATE game.game_card SET upgrade_delta_industry=5,  upgrade_delta_carbon=-3,  upgrade_delta_new_energy_pct=5,           updated_at=now() WHERE card_id='card006';
UPDATE game.game_card SET upgrade_delta_industry=6,  upgrade_delta_carbon=-3,  upgrade_delta_tech=1,                     updated_at=now() WHERE card_id='card007';
UPDATE game.game_card SET upgrade_delta_industry=5,  upgrade_delta_carbon=-2,  upgrade_delta_satisfaction=2,             updated_at=now() WHERE card_id='card008';
UPDATE game.game_card SET upgrade_delta_industry=4,  upgrade_delta_carbon=-3,  upgrade_delta_population=1,               updated_at=now() WHERE card_id='card011';
UPDATE game.game_card SET upgrade_delta_industry=4,  upgrade_delta_carbon=-3,                                             updated_at=now() WHERE card_id='card012';
UPDATE game.game_card SET upgrade_delta_industry=4,  upgrade_delta_carbon=-3,  upgrade_delta_green=1,                    updated_at=now() WHERE card_id='card013';
UPDATE game.game_card SET upgrade_delta_industry=5,  upgrade_delta_carbon=-3,  upgrade_delta_tech=1,                     updated_at=now() WHERE card_id='card014';

-- ── Industry special (percentage) ────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_industry_pct=10,                   updated_at=now() WHERE card_id='card019';
UPDATE game.game_card SET upgrade_delta_industry_carbon_reduction_pct=3,   updated_at=now() WHERE card_id='card020';

-- ── Ecology 1→2 ──────────────────────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_green=2, upgrade_delta_carbon=-2,                                              updated_at=now() WHERE card_id='card021';
UPDATE game.game_card SET upgrade_delta_green=2, upgrade_delta_carbon=-2, upgrade_delta_satisfaction=1,               updated_at=now() WHERE card_id='card022';
UPDATE game.game_card SET upgrade_delta_green=3, upgrade_delta_carbon=-2,                                              updated_at=now() WHERE card_id='card023';
UPDATE game.game_card SET upgrade_delta_green=2, upgrade_delta_carbon=-2, upgrade_delta_flood_resistance_pct=8,       updated_at=now() WHERE card_id='card024';

-- ── Ecology 2→3 ──────────────────────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_green=4, upgrade_delta_carbon=-3, upgrade_delta_ecology_sink=1,               updated_at=now() WHERE card_id='card025';
UPDATE game.game_card SET upgrade_delta_green=4, upgrade_delta_carbon=-3,                                             updated_at=now() WHERE card_id='card026';
UPDATE game.game_card SET upgrade_delta_green=3, upgrade_delta_carbon=-3, upgrade_delta_satisfaction=1,               updated_at=now() WHERE card_id='card027';
UPDATE game.game_card SET upgrade_delta_green=3, upgrade_delta_carbon=-3, upgrade_delta_flood_resistance_pct=10,      updated_at=now() WHERE card_id='card028';
UPDATE game.game_card SET upgrade_delta_green_pct=10,  upgrade_delta_green=2,                                         updated_at=now() WHERE card_id='card031';
UPDATE game.game_card SET upgrade_delta_green=3,  upgrade_delta_industry=2, upgrade_delta_tech=1,                     updated_at=now() WHERE card_id='card032';
UPDATE game.game_card SET upgrade_delta_green=4,  upgrade_delta_carbon=-3,                                            updated_at=now() WHERE card_id='card033';
UPDATE game.game_card SET upgrade_delta_green=3,  upgrade_delta_carbon=-3, upgrade_delta_ecology_sink=1,              updated_at=now() WHERE card_id='card034';
UPDATE game.game_card SET upgrade_delta_ecology_card_cost_pct=10, upgrade_delta_green=2,                              updated_at=now() WHERE card_id='card035';

-- ── Science 1→2 ──────────────────────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_tech=1, upgrade_delta_sector_progress_pct=1,                                  updated_at=now() WHERE card_id='card036';
UPDATE game.game_card SET upgrade_delta_tech=1, upgrade_delta_carbon=-1,                                              updated_at=now() WHERE card_id='card037';

-- ── Science 2→3 ──────────────────────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_carbon=-3, upgrade_delta_tech=1,                                              updated_at=now() WHERE card_id='card038';
UPDATE game.game_card SET upgrade_delta_industry_carbon_reduction_pct=5,                                              updated_at=now() WHERE card_id='card039';
UPDATE game.game_card SET upgrade_delta_new_energy_pct=10, upgrade_delta_tech=1,                                      updated_at=now() WHERE card_id='card040';
UPDATE game.game_card SET upgrade_delta_carbon_delta_reduction_pct=3, upgrade_delta_tech=1,                           updated_at=now() WHERE card_id='card041';
UPDATE game.game_card SET upgrade_delta_tech=1,                                                                        updated_at=now() WHERE card_id='card044';
UPDATE game.game_card SET upgrade_delta_science_card_cost_pct=10, upgrade_delta_sector_progress_pct=2,                updated_at=now() WHERE card_id='card045';

-- ── Society 1→2 ──────────────────────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_population=1, upgrade_delta_sector_progress_pct=1,                            updated_at=now() WHERE card_id='card046';
UPDATE game.game_card SET upgrade_delta_population=1, upgrade_delta_sector_progress_pct=1,                            updated_at=now() WHERE card_id='card047';

-- ── Society 2→3 ──────────────────────────────────────────────────────────────
UPDATE game.game_card SET upgrade_delta_satisfaction=2, upgrade_delta_carbon=-2,                                      updated_at=now() WHERE card_id='card048';
UPDATE game.game_card SET upgrade_delta_satisfaction=2, upgrade_delta_carbon=-2, upgrade_delta_shared_mobility_pct=20, updated_at=now() WHERE card_id='card049';
UPDATE game.game_card SET upgrade_delta_satisfaction=2, upgrade_delta_carbon=-2,                                      updated_at=now() WHERE card_id='card050';
UPDATE game.game_card SET upgrade_delta_satisfaction=2, upgrade_delta_carbon=-1, upgrade_delta_sector_progress_pct=1, updated_at=now() WHERE card_id='card051';
UPDATE game.game_card SET upgrade_delta_satisfaction=2, upgrade_delta_sector_progress_pct=2,                          updated_at=now() WHERE card_id='card053';

-- ── Former special/subsidy cards (now core, 2→3) ─────────────────────────────
UPDATE game.game_card SET upgrade_delta_trade_price_pct=20, upgrade_delta_quota=2,                                    updated_at=now() WHERE card_id='card054';
UPDATE game.game_card SET upgrade_delta_carbon=-3, upgrade_delta_new_energy_pct=10,                                   updated_at=now() WHERE card_id='card055';
UPDATE game.game_card SET upgrade_delta_ecology_card_cost_pct=10, upgrade_delta_flood_resistance_pct=15,              updated_at=now() WHERE card_id='card056';
UPDATE game.game_card SET upgrade_delta_trad_upgrade_pct=10, upgrade_delta_upgrade_cost_pct=-10,                      updated_at=now() WHERE card_id='card057';
UPDATE game.game_card SET upgrade_delta_ecology_sink=3, upgrade_delta_green=3,                                        updated_at=now() WHERE card_id='card059';
