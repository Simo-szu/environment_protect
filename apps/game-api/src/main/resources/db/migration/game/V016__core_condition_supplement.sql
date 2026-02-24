-- ============================================================================
-- YouthLoop Game Schema Migration V016
-- Schema: game
-- Purpose: Supplement core card special deployment conditions (green level,
--          society progress, policy points → tech resource mapping)
-- ============================================================================

-- Add new condition columns missing from V005
ALTER TABLE game.game_card
    ADD COLUMN IF NOT EXISTS core_condition_min_green                integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS core_condition_min_society_progress_pct integer NOT NULL DEFAULT 0;

-- Rebuild the core effect JSONB sync trigger to include new condition fields
CREATE OR REPLACE FUNCTION game.sync_game_card_core_effect_jsonb()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.core_continuous_effect := jsonb_build_object(
        'industryDelta',              NEW.core_continuous_industry_delta,
        'techDelta',                  NEW.core_continuous_tech_delta,
        'populationDelta',            NEW.core_continuous_population_delta,
        'greenDelta',                 NEW.core_continuous_green_delta,
        'carbonDelta',                NEW.core_continuous_carbon_delta,
        'satisfactionDelta',          NEW.core_continuous_satisfaction_delta,
        'quotaDelta',                 NEW.core_continuous_quota_delta,
        'lowCarbonDelta',             NEW.core_continuous_low_carbon_delta,
        'industryPct',                NEW.core_continuous_industry_pct,
        'techPct',                    NEW.core_continuous_tech_pct,
        'populationPct',              NEW.core_continuous_population_pct,
        'greenPct',                   NEW.core_continuous_green_pct,
        'globalPct',                  NEW.core_continuous_global_pct,
        'lowCarbonPct',               NEW.core_continuous_low_carbon_pct,
        'industryCarbonReductionPct', NEW.core_continuous_industry_carbon_reduction_pct,
        'carbonDeltaReductionPct',    NEW.core_continuous_carbon_delta_reduction_pct,
        'tradePricePct',              NEW.core_continuous_trade_price_pct,
        'comboPct',                   NEW.core_continuous_combo_pct
    );

    NEW.core_effect_condition := jsonb_build_object(
        'minTurn',                NEW.core_condition_min_turn,
        'minIndustryResource',    NEW.core_condition_min_industry_resource,
        'minTechResource',        NEW.core_condition_min_tech_resource,
        'maxCarbon',              NEW.core_condition_max_carbon,
        'minIndustryCards',       NEW.core_condition_min_industry_cards,
        'minIndustryProgressPct', NEW.core_condition_min_industry_progress_pct,
        'minTaggedCards',         NEW.core_condition_min_tagged_cards,
        'requiredTag',            NEW.core_condition_required_tag,
        'minGreen',               NEW.core_condition_min_green,
        'minSocietyProgressPct',  NEW.core_condition_min_society_progress_pct
    );

    NEW.core_special_effect := jsonb_build_object(
        'ecologyCardCostReductionPct',   NEW.core_special_ecology_card_cost_reduction_pct,
        'scienceCardCostReductionPct',   NEW.core_special_science_card_cost_reduction_pct,
        'floodResistancePct',            NEW.core_special_flood_resistance_pct,
        'newEnergyIndustryPct',          NEW.core_special_new_energy_industry_pct,
        'ecologyCarbonSinkPerTenGreen',  NEW.core_special_ecology_carbon_sink_per_ten_green
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_game_card_core_effect_jsonb ON game.game_card;
CREATE TRIGGER trg_sync_game_card_core_effect_jsonb
BEFORE INSERT OR UPDATE ON game.game_card
FOR EACH ROW
EXECUTE FUNCTION game.sync_game_card_core_effect_jsonb();

-- ── Policy points → tech_resource mapping ────────────────────────────────────
UPDATE game.game_card SET core_condition_min_tech_resource=10, updated_at=now() WHERE card_id='card019';
UPDATE game.game_card SET core_condition_min_tech_resource=15, updated_at=now() WHERE card_id='card031';
UPDATE game.game_card SET core_condition_min_tech_resource=12, updated_at=now() WHERE card_id='card035';
UPDATE game.game_card SET core_condition_min_tech_resource= 3, updated_at=now() WHERE card_id='card044';
UPDATE game.game_card SET core_condition_min_tech_resource= 8, updated_at=now() WHERE card_id='card053';

-- card054: replace min_turn=5 with tech>=15
UPDATE game.game_card SET
    core_condition_min_turn=0,
    core_condition_min_tech_resource=15,
    updated_at=now()
WHERE card_id='card054';

-- card055: tech>=20, remove tagged_cards requirement
UPDATE game.game_card SET
    core_condition_min_tech_resource=20,
    core_condition_min_tagged_cards=0,
    core_condition_required_tag='',
    updated_at=now()
WHERE card_id='card055';

-- card056: green level >= 30
UPDATE game.game_card SET
    core_condition_min_green=30,
    updated_at=now()
WHERE card_id='card056';
-- Remove stale event-trigger record
DELETE FROM game.game_core_special_condition_config WHERE card_id='card056';

-- card057: industry resource >= 80, remove progress/tagged requirements
UPDATE game.game_card SET
    core_condition_min_industry_resource=80,
    core_condition_min_industry_progress_pct=0,
    core_condition_min_industry_cards=0,
    core_condition_min_tagged_cards=0,
    core_condition_required_tag='',
    updated_at=now()
WHERE card_id='card057';

-- card058: society domain progress >= 50%
UPDATE game.game_card SET
    core_condition_min_society_progress_pct=50,
    updated_at=now()
WHERE card_id='card058';

-- card059: green level >= 25, remove ecology_cards event requirement
UPDATE game.game_card SET
    core_condition_min_green=25,
    updated_at=now()
WHERE card_id='card059';
DELETE FROM game.game_core_special_condition_config WHERE card_id='card059';

-- card060: industry resource >= 100, lift carbon cap
UPDATE game.game_card SET
    core_condition_min_industry_resource=100,
    core_condition_max_carbon=2147483647,
    updated_at=now()
WHERE card_id='card060';

-- Force JSONB re-sync for all affected cards via trigger
UPDATE game.game_card SET updated_at=now()
WHERE card_id IN (
    'card019','card031','card035','card044','card053',
    'card054','card055','card056','card057','card058','card059','card060'
);
