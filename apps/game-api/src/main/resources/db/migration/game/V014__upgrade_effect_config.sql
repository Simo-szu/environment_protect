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
