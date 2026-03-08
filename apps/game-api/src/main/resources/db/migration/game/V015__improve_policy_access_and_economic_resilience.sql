-- ============================================================================
-- YouthLoop Game Schema Migration V015
-- Schema: game
-- Purpose: Improve policy access, event response availability, and resource resilience
-- ============================================================================

-- 1) Make policy unlock rules easier so policy gameplay appears earlier and more often.
UPDATE game.game_policy_unlock_rule_config
SET
    min_industry = 3,
    min_industry_resource = 20,
    config_snapshot = jsonb_set(
        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{rule}', '"industry>=3 and industryResource>=20"'::jsonb, true),
        '{tuningVersion}', '"v015"'::jsonb, true
    ),
    updated_at = now()
WHERE policy_id = 'card061';

UPDATE game.game_policy_unlock_rule_config
SET
    min_industry = 4,
    min_carbon = 85,
    config_snapshot = jsonb_set(
        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{rule}', '"industry>=4 and carbon>=85"'::jsonb, true),
        '{tuningVersion}', '"v015"'::jsonb, true
    ),
    updated_at = now()
WHERE policy_id = 'card062';

UPDATE game.game_policy_unlock_rule_config
SET
    min_ecology = 3,
    min_green = 55,
    config_snapshot = jsonb_set(
        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{rule}', '"ecology>=3 and green>=55"'::jsonb, true),
        '{tuningVersion}', '"v015"'::jsonb, true
    ),
    updated_at = now()
WHERE policy_id = 'card063';

UPDATE game.game_policy_unlock_rule_config
SET
    min_tagged_cards = 1,
    config_snapshot = jsonb_set(
        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{rule}', '"shenzhen_ecology>=1"'::jsonb, true),
        '{tuningVersion}', '"v015"'::jsonb, true
    ),
    updated_at = now()
WHERE policy_id = 'card064';

UPDATE game.game_policy_unlock_rule_config
SET
    min_science = 3,
    min_tech_resource = 35,
    config_snapshot = jsonb_set(
        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{rule}', '"science>=3 and techResource>=35"'::jsonb, true),
        '{tuningVersion}', '"v015"'::jsonb, true
    ),
    updated_at = now()
WHERE policy_id = 'card065';

UPDATE game.game_policy_unlock_rule_config
SET
    min_industry = 3,
    min_science = 3,
    min_tech_resource = 45,
    config_snapshot = jsonb_set(
        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{rule}', '"science>=3 and industry>=3 and techResource>=45"'::jsonb, true),
        '{tuningVersion}', '"v015"'::jsonb, true
    ),
    updated_at = now()
WHERE policy_id = 'card066';

UPDATE game.game_policy_unlock_rule_config
SET
    min_ecology = 3,
    min_society = 3,
    min_satisfaction = 65,
    config_snapshot = jsonb_set(
        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{rule}', '"society>=3 and ecology>=3 and satisfaction>=65"'::jsonb, true),
        '{tuningVersion}', '"v015"'::jsonb, true
    ),
    updated_at = now()
WHERE policy_id = 'card067';

UPDATE game.game_policy_unlock_rule_config
SET
    min_society = 3,
    min_population_resource = 35,
    config_snapshot = jsonb_set(
        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{rule}', '"society>=3 and populationResource>=35"'::jsonb, true),
        '{tuningVersion}', '"v015"'::jsonb, true
    ),
    updated_at = now()
WHERE policy_id = 'card068';

-- 2) Open carbon market every turn to increase tactical economy options.
UPDATE game.game_runtime_param_config
SET
    trade_window_interval = 1,
    config_snapshot = jsonb_set(
        COALESCE(config_snapshot, '{}'::jsonb),
        '{tradeWindowInterval}',
        '1'::jsonb,
        true
    ),
    updated_at = now()
WHERE config_id = 1;

-- 3) Raise starting/settlement resources to reduce mid-game no-affordable-card deadlocks.
UPDATE game.game_balance_rule_config
SET
    initial_industry = 36,
    initial_tech = 24,
    initial_population = 30,
    settlement_base_industry_gain = 3,
    settlement_base_tech_gain = 2,
    settlement_base_population_gain = 2,
    config_snapshot = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    jsonb_set(
                        jsonb_set(COALESCE(config_snapshot, '{}'::jsonb), '{initial,resources,industry}', '36'::jsonb, true),
                        '{initial,resources,tech}', '24'::jsonb, true
                    ),
                    '{initial,resources,population}', '30'::jsonb, true
                ),
                '{settlement,baseIndustryGain}', '3'::jsonb, true
            ),
            '{settlement,baseTechGain}', '2'::jsonb, true
        ),
        '{settlement,basePopulationGain}', '2'::jsonb, true
    ),
    updated_at = now()
WHERE config_id = 1;
