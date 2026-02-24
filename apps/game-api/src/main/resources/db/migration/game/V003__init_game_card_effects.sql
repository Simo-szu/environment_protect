-- ============================================================================
-- YouthLoop Game Schema Migration V003
-- Schema: game
-- Purpose: Initialize effect snapshots and seed flattened effect values
-- ============================================================================

CREATE OR REPLACE FUNCTION game.sync_game_card_effect_jsonb()
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
    ) || COALESCE(NEW.policy_immediate_ext, '{}'::jsonb);

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
    ) || COALESCE(NEW.policy_continuous_ext, '{}'::jsonb);

    NEW.core_immediate_effect := jsonb_build_object(
        'industryDelta', NEW.core_immediate_industry_delta,
        'techDelta', NEW.core_immediate_tech_delta,
        'populationDelta', NEW.core_immediate_population_delta,
        'greenDelta', NEW.core_immediate_green_delta,
        'carbonDelta', NEW.core_immediate_carbon_delta,
        'satisfactionDelta', NEW.core_immediate_satisfaction_delta,
        'quotaDelta', NEW.core_immediate_quota_delta,
        'comboPct', NEW.core_immediate_combo_pct,
        'industryCarbonDelta', NEW.core_immediate_industry_carbon_delta,
        'industryCarbonReductionPct', NEW.core_immediate_industry_carbon_reduction_pct
    ) || COALESCE(NEW.core_immediate_ext, '{}'::jsonb);

    NEW.core_continuous_effect := jsonb_build_object(
        'domainProgressBonus', NEW.core_domain_progress_bonus,
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
        'comboPct', NEW.core_continuous_combo_pct,
        'sciencePct', NEW.core_continuous_science_pct,
        'sharedMobilityPct', NEW.core_continuous_shared_mobility_pct,
        'crossDomainCarbonDelta', NEW.core_continuous_cross_domain_carbon_delta,
        'crossDomainComboPct', NEW.core_continuous_cross_domain_combo_pct,
        'industryCarbonOffset', NEW.core_continuous_industry_carbon_offset
    ) || COALESCE(NEW.core_continuous_ext, '{}'::jsonb);

    NEW.core_condition_effect := jsonb_build_object(
        'minTurn', NEW.core_condition_min_turn,
        'minIndustryResource', NEW.core_condition_min_industry_resource,
        'minTechResource', NEW.core_condition_min_tech_resource,
        'minCarbon', NEW.core_condition_min_carbon,
        'maxCarbon', NEW.core_condition_max_carbon,
        'minIndustryCards', NEW.core_condition_min_industry_cards,
        'minEcologyCards', NEW.core_condition_min_ecology_cards,
        'minScienceCards', NEW.core_condition_min_science_cards,
        'minSocietyCards', NEW.core_condition_min_society_cards,
        'minIndustryProgressPct', NEW.core_condition_min_industry_progress_pct,
        'minGreen', NEW.core_condition_min_green,
        'minPopulation', NEW.core_condition_min_population,
        'minSatisfaction', NEW.core_condition_min_satisfaction,
        'minSocietyProgressPct', NEW.core_condition_min_society_progress_pct,
        'minTaggedCards', NEW.core_condition_min_tagged_cards,
        'requiredTag', NEW.core_condition_required_tag
    ) || COALESCE(NEW.core_condition_ext, '{}'::jsonb);

    NEW.core_special_effect := jsonb_build_object(
        'ecologyCardCostReductionPct', NEW.core_special_ecology_card_cost_reduction_pct,
        'scienceCardCostReductionPct', NEW.core_special_science_card_cost_reduction_pct,
        'floodResistancePct', NEW.core_special_flood_resistance_pct,
        'newEnergyIndustryPct', NEW.core_special_new_energy_industry_pct,
        'ecologyCarbonSinkPerTenGreen', NEW.core_special_ecology_carbon_sink_per_ten_green,
        'ecologyCarbonSinkBaseGreen', NEW.core_special_ecology_carbon_sink_base_green,
        'ecologyCarbonSinkPct', NEW.core_special_ecology_carbon_sink_pct,
        'upgradeCostReductionPct', NEW.core_special_upgrade_cost_reduction_pct
    ) || COALESCE(NEW.core_special_ext, '{}'::jsonb);

    NEW.upgrade_effect := jsonb_build_object(
        'industryDelta', NEW.upgrade_delta_industry,
        'techDelta', NEW.upgrade_delta_tech,
        'populationDelta', NEW.upgrade_delta_population,
        'greenDelta', NEW.upgrade_delta_green,
        'carbonDelta', NEW.upgrade_delta_carbon,
        'satisfactionDelta', NEW.upgrade_delta_satisfaction,
        'quotaDelta', NEW.upgrade_delta_quota,
        'lowCarbonDelta', NEW.upgrade_delta_low_carbon,
        'sectorProgressPct', NEW.upgrade_delta_sector_progress_pct,
        'industryPct', NEW.upgrade_delta_industry_pct,
        'greenPct', NEW.upgrade_delta_green_pct,
        'globalPct', NEW.upgrade_delta_global_pct,
        'techPct', NEW.upgrade_delta_tech_pct,
        'industryCarbonReductionPct', NEW.upgrade_delta_industry_carbon_reduction_pct,
        'carbonDeltaReductionPct', NEW.upgrade_delta_carbon_delta_reduction_pct,
        'tradePricePct', NEW.upgrade_delta_trade_price_pct,
        'comboPct', NEW.upgrade_delta_combo_pct,
        'sharedMobilityPct', NEW.upgrade_delta_shared_mobility_pct,
        'ecologyCardCostPct', NEW.upgrade_delta_ecology_card_cost_pct,
        'scienceCardCostPct', NEW.upgrade_delta_science_card_cost_pct,
        'floodResistancePct', NEW.upgrade_delta_flood_resistance_pct,
        'newEnergyPct', NEW.upgrade_delta_new_energy_pct,
        'ecologySink', NEW.upgrade_delta_ecology_sink,
        'tradUpgradePct', NEW.upgrade_delta_trad_upgrade_pct,
        'upgradeCostPct', NEW.upgrade_delta_upgrade_cost_pct
    ) || COALESCE(NEW.upgrade_ext, '{}'::jsonb);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_game_card_effect_jsonb ON game.game_card;
CREATE TRIGGER trg_sync_game_card_effect_jsonb
BEFORE INSERT OR UPDATE ON game.game_card
FOR EACH ROW
EXECUTE FUNCTION game.sync_game_card_effect_jsonb();

-- Full card seed is populated below from 全卡牌详细数据.md
WITH doc_card_effect_seed(card_id, condition_json, immediate_json, continuous_json) AS (
    VALUES
    ('card001', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_industry_delta":15,"core_continuous_carbon_delta":20}'::jsonb),
    ('card002', '{}'::jsonb, '{"core_domain_progress_bonus":4}'::jsonb, '{"core_continuous_industry_delta":12,"core_continuous_carbon_delta":18}'::jsonb),
    ('card003', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_industry_delta":14,"core_continuous_carbon_delta":16}'::jsonb),
    ('card004', '{}'::jsonb, '{"core_domain_progress_bonus":4}'::jsonb, '{"core_continuous_industry_delta":13,"core_continuous_carbon_delta":17}'::jsonb),
    ('card005', '{}'::jsonb, '{"core_domain_progress_bonus":6}'::jsonb, '{"core_continuous_industry_delta":20,"core_continuous_carbon_delta":5}'::jsonb),
    ('card006', '{}'::jsonb, '{"core_domain_progress_bonus":7}'::jsonb, '{"core_continuous_industry_delta":22,"core_continuous_carbon_delta":3}'::jsonb),
    ('card007', '{}'::jsonb, '{"core_domain_progress_bonus":8}'::jsonb, '{"core_continuous_industry_delta":25,"core_continuous_carbon_delta":4}'::jsonb),
    ('card008', '{}'::jsonb, '{"core_domain_progress_bonus":7}'::jsonb, '{"core_continuous_industry_delta":23,"core_continuous_carbon_delta":2}'::jsonb),
    ('card009', '{}'::jsonb, '{"core_domain_progress_bonus":10}'::jsonb, '{"core_continuous_industry_delta":25,"core_continuous_carbon_delta":0}'::jsonb),
    ('card010', '{}'::jsonb, '{"core_domain_progress_bonus":12}'::jsonb, '{"core_continuous_industry_delta":28,"core_continuous_carbon_delta":-2}'::jsonb),
    ('card011', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_industry_delta":18,"core_continuous_carbon_delta":6}'::jsonb),
    ('card012', '{}'::jsonb, '{"core_domain_progress_bonus":4}'::jsonb, '{"core_continuous_industry_delta":16,"core_continuous_carbon_delta":7}'::jsonb),
    ('card013', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_industry_delta":19,"core_continuous_carbon_delta":4}'::jsonb),
    ('card014', '{}'::jsonb, '{"core_domain_progress_bonus":6}'::jsonb, '{"core_continuous_industry_delta":21,"core_continuous_carbon_delta":3}'::jsonb),
    ('card015', '{}'::jsonb, '{"core_domain_progress_bonus":15}'::jsonb, '{"core_continuous_industry_delta":30,"core_continuous_carbon_delta":-1}'::jsonb),
    ('card016', '{}'::jsonb, '{"core_domain_progress_bonus":14}'::jsonb, '{"core_continuous_industry_delta":29,"core_continuous_carbon_delta":0}'::jsonb),
    ('card017', '{}'::jsonb, '{"core_domain_progress_bonus":16}'::jsonb, '{"core_continuous_industry_delta":32,"core_continuous_carbon_delta":-2}'::jsonb),
    ('card018', '{}'::jsonb, '{"core_domain_progress_bonus":13}'::jsonb, '{"core_continuous_industry_delta":27,"core_continuous_carbon_delta":-3}'::jsonb),
    ('card019', '{"core_condition_min_tech_resource":10}'::jsonb, '{}'::jsonb, '{"core_continuous_industry_pct":20}'::jsonb),
    ('card020', '{}'::jsonb, '{}'::jsonb, '{"core_continuous_industry_carbon_reduction_pct":5}'::jsonb),
    ('card021', '{}'::jsonb, '{"core_domain_progress_bonus":3}'::jsonb, '{"core_continuous_green_delta":5,"core_continuous_carbon_delta":-3}'::jsonb),
    ('card022', '{}'::jsonb, '{"core_domain_progress_bonus":2}'::jsonb, '{"core_continuous_green_delta":4,"core_continuous_carbon_delta":-2}'::jsonb),
    ('card023', '{}'::jsonb, '{"core_domain_progress_bonus":4}'::jsonb, '{"core_continuous_green_delta":6,"core_continuous_carbon_delta":-3}'::jsonb),
    ('card024', '{}'::jsonb, '{"core_domain_progress_bonus":4}'::jsonb, '{"core_continuous_green_delta":5,"core_continuous_carbon_delta":-4}'::jsonb),
    ('card025', '{}'::jsonb, '{"core_domain_progress_bonus":6}'::jsonb, '{"core_continuous_green_delta":8,"core_continuous_carbon_delta":-5}'::jsonb),
    ('card026', '{}'::jsonb, '{"core_domain_progress_bonus":7}'::jsonb, '{"core_continuous_green_delta":9,"core_continuous_carbon_delta":-4}'::jsonb),
    ('card027', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_green_delta":7,"core_continuous_carbon_delta":-5}'::jsonb),
    ('card028', '{}'::jsonb, '{"core_domain_progress_bonus":6}'::jsonb, '{"core_continuous_green_delta":8,"core_continuous_carbon_delta":-4}'::jsonb),
    ('card029', '{}'::jsonb, '{"core_domain_progress_bonus":10}'::jsonb, '{"core_continuous_green_delta":12,"core_continuous_carbon_delta":-8}'::jsonb),
    ('card030', '{}'::jsonb, '{"core_domain_progress_bonus":12}'::jsonb, '{"core_continuous_green_delta":10,"core_continuous_carbon_delta":-6}'::jsonb),
    ('card031', '{"core_condition_min_tech_resource":15}'::jsonb, '{}'::jsonb, '{"core_continuous_green_pct":30}'::jsonb),
    ('card032', '{}'::jsonb, '{"core_domain_progress_bonus":7}'::jsonb, '{"core_continuous_industry_delta":2,"core_continuous_green_delta":8}'::jsonb),
    ('card033', '{}'::jsonb, '{"core_domain_progress_bonus":8}'::jsonb, '{"core_continuous_green_delta":9,"core_continuous_carbon_delta":-5}'::jsonb),
    ('card034', '{}'::jsonb, '{"core_domain_progress_bonus":6}'::jsonb, '{"core_continuous_green_delta":7,"core_continuous_carbon_delta":-4}'::jsonb),
    ('card035', '{"core_condition_min_tech_resource":12}'::jsonb, '{}'::jsonb, '{"core_special_ecology_card_cost_reduction_pct":20}'::jsonb),
    ('card036', '{}'::jsonb, '{"core_domain_progress_bonus":3}'::jsonb, '{"core_continuous_tech_delta":1}'::jsonb),
    ('card037', '{}'::jsonb, '{"core_domain_progress_bonus":2}'::jsonb, '{"core_continuous_tech_delta":1}'::jsonb),
    ('card038', '{}'::jsonb, '{"core_domain_progress_bonus":6}'::jsonb, '{"core_continuous_carbon_delta":-10}'::jsonb),
    ('card039', '{}'::jsonb, '{"core_domain_progress_bonus":7}'::jsonb, '{"core_continuous_industry_carbon_reduction_pct":15}'::jsonb),
    ('card040', '{}'::jsonb, '{"core_domain_progress_bonus":6}'::jsonb, '{"core_special_new_energy_industry_pct":20}'::jsonb),
    ('card041', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_carbon_delta_reduction_pct":5}'::jsonb),
    ('card042', '{}'::jsonb, '{"core_domain_progress_bonus":10}'::jsonb, '{"core_continuous_tech_delta":3,"core_continuous_global_pct":10}'::jsonb),
    ('card043', '{}'::jsonb, '{"core_domain_progress_bonus":12}'::jsonb, '{"core_continuous_trade_price_pct":30}'::jsonb),
    ('card044', '{"core_condition_min_tech_resource":3}'::jsonb, '{}'::jsonb, '{"core_continuous_tech_delta":2}'::jsonb),
    ('card045', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_special_science_card_cost_reduction_pct":20}'::jsonb),
    ('card046', '{}'::jsonb, '{"core_domain_progress_bonus":3}'::jsonb, '{"core_continuous_population_delta":2}'::jsonb),
    ('card047', '{}'::jsonb, '{"core_domain_progress_bonus":2}'::jsonb, '{"core_continuous_population_delta":3}'::jsonb),
    ('card048', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_satisfaction_delta":2,"core_continuous_carbon_delta":-3}'::jsonb),
    ('card049', '{}'::jsonb, '{"core_domain_progress_bonus":6}'::jsonb, '{"core_continuous_satisfaction_delta":5,"core_continuous_carbon_delta":-5}'::jsonb),
    ('card050', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_satisfaction_delta":3,"core_continuous_carbon_delta":-2}'::jsonb),
    ('card051', '{}'::jsonb, '{"core_domain_progress_bonus":5}'::jsonb, '{"core_continuous_satisfaction_delta":4}'::jsonb),
    ('card052', '{}'::jsonb, '{"core_domain_progress_bonus":8}'::jsonb, '{"core_continuous_industry_delta":2,"core_continuous_satisfaction_delta":6}'::jsonb),
    ('card053', '{"core_condition_min_tech_resource":8}'::jsonb, '{}'::jsonb, '{"core_continuous_satisfaction_delta":5}'::jsonb),
    ('card054', '{"core_condition_min_turn":5}'::jsonb, '{"core_immediate_quota_delta":5}'::jsonb, '{"core_continuous_trade_price_pct":50}'::jsonb),
    ('card055', '{"core_condition_min_tech_resource":20,"core_condition_min_tagged_cards":1,"core_condition_required_tag":"new_energy_industry"}'::jsonb, '{}'::jsonb, '{"core_continuous_shared_mobility_pct":100,"core_continuous_carbon_delta":-8}'::jsonb),
    ('card056', '{"core_condition_min_tagged_cards":1,"core_condition_required_tag":"flood_processed"}'::jsonb, '{}'::jsonb, '{"core_special_ecology_card_cost_reduction_pct":50,"core_special_flood_resistance_pct":60}'::jsonb),
    ('card057', '{"core_condition_min_industry_progress_pct":40,"core_condition_min_tagged_cards":2,"core_condition_required_tag":"traditional_industry"}'::jsonb, '{}'::jsonb, '{"core_continuous_industry_pct":50,"core_special_upgrade_cost_reduction_pct":30}'::jsonb),
    ('card058', '{"core_condition_min_tech_resource":12}'::jsonb, '{}'::jsonb, '{"core_continuous_cross_domain_combo_pct":30}'::jsonb),
    ('card059', '{"core_condition_min_tagged_cards":2,"core_condition_required_tag":"ecology_card"}'::jsonb, '{}'::jsonb, '{"core_special_ecology_carbon_sink_per_ten_green":5,"core_special_ecology_carbon_sink_base_green":10}'::jsonb),
    ('card060', '{"core_condition_min_industry_resource":100,"core_condition_max_carbon":60}'::jsonb, '{}'::jsonb, '{"core_continuous_industry_delta":8,"core_continuous_industry_carbon_reduction_pct":10}'::jsonb),
    ('card061', '{"core_condition_min_industry_resource":50,"core_condition_min_industry_cards":6}'::jsonb, '{"core_immediate_industry_delta":15,"core_immediate_industry_carbon_delta":-8}'::jsonb, '{"core_continuous_industry_delta":5}'::jsonb),
    ('card062', '{"core_condition_min_carbon":100,"core_condition_min_industry_cards":8}'::jsonb, '{"core_immediate_carbon_delta":-30,"core_immediate_industry_carbon_reduction_pct":10}'::jsonb, '{"core_continuous_industry_carbon_offset":5}'::jsonb),
    ('card063', '{"core_condition_min_green":70,"core_condition_min_ecology_cards":6}'::jsonb, '{"core_immediate_green_delta":20,"core_immediate_satisfaction_delta":8}'::jsonb, '{"core_continuous_green_delta":3,"core_continuous_carbon_delta":-4}'::jsonb),
    ('card064', '{"core_condition_min_tagged_cards":2,"core_condition_required_tag":"shenzhen_featured_ecology"}'::jsonb, '{"core_immediate_green_delta":15,"core_immediate_quota_delta":3}'::jsonb, '{"core_special_ecology_carbon_sink_pct":15}'::jsonb),
    ('card065', '{"core_condition_min_tech_resource":70,"core_condition_min_science_cards":6}'::jsonb, '{"core_immediate_tech_delta":25,"core_immediate_combo_pct":10}'::jsonb, '{"core_continuous_tech_delta":6,"core_continuous_science_pct":12}'::jsonb),
    ('card066', '{"core_condition_min_tech_resource":80,"core_condition_min_industry_cards":5,"core_condition_min_science_cards":5}'::jsonb, '{"core_immediate_tech_delta":20,"core_immediate_carbon_delta":-40}'::jsonb, '{"core_continuous_cross_domain_carbon_delta":-8}'::jsonb),
    ('card067', '{"core_condition_min_satisfaction":75,"core_condition_min_ecology_cards":5,"core_condition_min_society_cards":5}'::jsonb, '{"core_immediate_population_delta":10,"core_immediate_satisfaction_delta":20}'::jsonb, '{"core_continuous_population_delta":3,"core_continuous_satisfaction_delta":4}'::jsonb),
    ('card068', '{"core_condition_min_population":60,"core_condition_min_society_cards":6}'::jsonb, '{"core_immediate_population_delta":8,"core_immediate_satisfaction_delta":18}'::jsonb, '{"core_continuous_satisfaction_delta":5,"core_continuous_low_carbon_delta":2}'::jsonb)
)
UPDATE game.game_card card
SET
    core_condition_ext = seed.condition_json,
    core_immediate_ext = CASE WHEN card.card_type = 'core' THEN seed.immediate_json ELSE card.core_immediate_ext END,
    core_continuous_ext = CASE WHEN card.card_type = 'core' THEN seed.continuous_json ELSE card.core_continuous_ext END,
    policy_immediate_ext = CASE WHEN card.card_type = 'policy' THEN seed.immediate_json ELSE card.policy_immediate_ext END,
    policy_continuous_ext = CASE WHEN card.card_type = 'policy' THEN seed.continuous_json ELSE card.policy_continuous_ext END,
    updated_at = now()
FROM doc_card_effect_seed seed
WHERE card.card_id = seed.card_id;

UPDATE game.game_card
SET
    core_domain_progress_bonus = COALESCE((core_immediate_ext->>'core_domain_progress_bonus')::integer, 0),
    core_immediate_industry_delta = COALESCE((core_immediate_ext->>'core_immediate_industry_delta')::integer, 0),
    core_immediate_tech_delta = COALESCE((core_immediate_ext->>'core_immediate_tech_delta')::integer, 0),
    core_immediate_population_delta = COALESCE((core_immediate_ext->>'core_immediate_population_delta')::integer, 0),
    core_immediate_green_delta = COALESCE((core_immediate_ext->>'core_immediate_green_delta')::integer, 0),
    core_immediate_carbon_delta = COALESCE((core_immediate_ext->>'core_immediate_carbon_delta')::integer, 0),
    core_immediate_satisfaction_delta = COALESCE((core_immediate_ext->>'core_immediate_satisfaction_delta')::integer, 0),
    core_immediate_quota_delta = COALESCE((core_immediate_ext->>'core_immediate_quota_delta')::integer, 0),
    core_immediate_combo_pct = COALESCE((core_immediate_ext->>'core_immediate_combo_pct')::integer, 0),
    core_immediate_industry_carbon_delta = COALESCE((core_immediate_ext->>'core_immediate_industry_carbon_delta')::integer, 0),
    core_immediate_industry_carbon_reduction_pct = COALESCE((core_immediate_ext->>'core_immediate_industry_carbon_reduction_pct')::integer, 0),
    core_continuous_industry_delta = COALESCE((core_continuous_ext->>'core_continuous_industry_delta')::integer, 0),
    core_continuous_tech_delta = COALESCE((core_continuous_ext->>'core_continuous_tech_delta')::integer, 0),
    core_continuous_population_delta = COALESCE((core_continuous_ext->>'core_continuous_population_delta')::integer, 0),
    core_continuous_green_delta = COALESCE((core_continuous_ext->>'core_continuous_green_delta')::integer, 0),
    core_continuous_carbon_delta = COALESCE((core_continuous_ext->>'core_continuous_carbon_delta')::integer, 0),
    core_continuous_satisfaction_delta = COALESCE((core_continuous_ext->>'core_continuous_satisfaction_delta')::integer, 0),
    core_continuous_quota_delta = COALESCE((core_continuous_ext->>'core_continuous_quota_delta')::integer, 0),
    core_continuous_low_carbon_delta = COALESCE((core_continuous_ext->>'core_continuous_low_carbon_delta')::integer, 0),
    core_continuous_industry_pct = COALESCE((core_continuous_ext->>'core_continuous_industry_pct')::integer, 0),
    core_continuous_tech_pct = COALESCE((core_continuous_ext->>'core_continuous_tech_pct')::integer, 0),
    core_continuous_population_pct = COALESCE((core_continuous_ext->>'core_continuous_population_pct')::integer, 0),
    core_continuous_green_pct = COALESCE((core_continuous_ext->>'core_continuous_green_pct')::integer, 0),
    core_continuous_global_pct = COALESCE((core_continuous_ext->>'core_continuous_global_pct')::integer, 0),
    core_continuous_low_carbon_pct = COALESCE((core_continuous_ext->>'core_continuous_low_carbon_pct')::integer, 0),
    core_continuous_industry_carbon_reduction_pct = COALESCE((core_continuous_ext->>'core_continuous_industry_carbon_reduction_pct')::integer, 0),
    core_continuous_carbon_delta_reduction_pct = COALESCE((core_continuous_ext->>'core_continuous_carbon_delta_reduction_pct')::integer, 0),
    core_continuous_trade_price_pct = COALESCE((core_continuous_ext->>'core_continuous_trade_price_pct')::integer, 0),
    core_continuous_combo_pct = COALESCE((core_continuous_ext->>'core_continuous_combo_pct')::integer, 0),
    core_continuous_science_pct = COALESCE((core_continuous_ext->>'core_continuous_science_pct')::integer, 0),
    core_continuous_shared_mobility_pct = COALESCE((core_continuous_ext->>'core_continuous_shared_mobility_pct')::integer, 0),
    core_continuous_cross_domain_carbon_delta = COALESCE((core_continuous_ext->>'core_continuous_cross_domain_carbon_delta')::integer, 0),
    core_continuous_cross_domain_combo_pct = COALESCE((core_continuous_ext->>'core_continuous_cross_domain_combo_pct')::integer, 0),
    core_continuous_industry_carbon_offset = COALESCE((core_continuous_ext->>'core_continuous_industry_carbon_offset')::integer, 0),
    core_condition_min_turn = COALESCE((core_condition_ext->>'core_condition_min_turn')::integer, 0),
    core_condition_min_industry_resource = COALESCE((core_condition_ext->>'core_condition_min_industry_resource')::integer, 0),
    core_condition_min_tech_resource = COALESCE((core_condition_ext->>'core_condition_min_tech_resource')::integer, 0),
    core_condition_min_carbon = COALESCE((core_condition_ext->>'core_condition_min_carbon')::integer, 0),
    core_condition_max_carbon = COALESCE((core_condition_ext->>'core_condition_max_carbon')::integer, 2147483647),
    core_condition_min_industry_cards = COALESCE((core_condition_ext->>'core_condition_min_industry_cards')::integer, 0),
    core_condition_min_ecology_cards = COALESCE((core_condition_ext->>'core_condition_min_ecology_cards')::integer, 0),
    core_condition_min_science_cards = COALESCE((core_condition_ext->>'core_condition_min_science_cards')::integer, 0),
    core_condition_min_society_cards = COALESCE((core_condition_ext->>'core_condition_min_society_cards')::integer, 0),
    core_condition_min_industry_progress_pct = COALESCE((core_condition_ext->>'core_condition_min_industry_progress_pct')::integer, 0),
    core_condition_min_green = COALESCE((core_condition_ext->>'core_condition_min_green')::integer, 0),
    core_condition_min_population = COALESCE((core_condition_ext->>'core_condition_min_population')::integer, 0),
    core_condition_min_satisfaction = COALESCE((core_condition_ext->>'core_condition_min_satisfaction')::integer, 0),
    core_condition_min_society_progress_pct = COALESCE((core_condition_ext->>'core_condition_min_society_progress_pct')::integer, 0),
    core_condition_min_tagged_cards = COALESCE((core_condition_ext->>'core_condition_min_tagged_cards')::integer, 0),
    core_condition_required_tag = COALESCE(core_condition_ext->>'core_condition_required_tag', ''),
    core_special_ecology_card_cost_reduction_pct = COALESCE((core_special_ext->>'core_special_ecology_card_cost_reduction_pct')::integer, (core_continuous_ext->>'core_special_ecology_card_cost_reduction_pct')::integer, 0),
    core_special_science_card_cost_reduction_pct = COALESCE((core_special_ext->>'core_special_science_card_cost_reduction_pct')::integer, (core_continuous_ext->>'core_special_science_card_cost_reduction_pct')::integer, 0),
    core_special_flood_resistance_pct = COALESCE((core_special_ext->>'core_special_flood_resistance_pct')::integer, (core_continuous_ext->>'core_special_flood_resistance_pct')::integer, 0),
    core_special_new_energy_industry_pct = COALESCE((core_special_ext->>'core_special_new_energy_industry_pct')::integer, (core_continuous_ext->>'core_special_new_energy_industry_pct')::integer, 0),
    core_special_ecology_carbon_sink_per_ten_green = COALESCE((core_special_ext->>'core_special_ecology_carbon_sink_per_ten_green')::integer, (core_continuous_ext->>'core_special_ecology_carbon_sink_per_ten_green')::integer, 0),
    core_special_ecology_carbon_sink_base_green = COALESCE((core_special_ext->>'core_special_ecology_carbon_sink_base_green')::integer, (core_continuous_ext->>'core_special_ecology_carbon_sink_base_green')::integer, 10),
    core_special_ecology_carbon_sink_pct = COALESCE((core_special_ext->>'core_special_ecology_carbon_sink_pct')::integer, (core_continuous_ext->>'core_special_ecology_carbon_sink_pct')::integer, 0),
    core_special_upgrade_cost_reduction_pct = COALESCE((core_special_ext->>'core_special_upgrade_cost_reduction_pct')::integer, (core_continuous_ext->>'core_special_upgrade_cost_reduction_pct')::integer, 0),
    policy_immediate_industry_delta = COALESCE((policy_immediate_ext->>'policy_immediate_industry_delta')::integer, (policy_immediate_ext->>'core_immediate_industry_delta')::integer, 0),
    policy_immediate_tech_delta = COALESCE((policy_immediate_ext->>'policy_immediate_tech_delta')::integer, (policy_immediate_ext->>'core_immediate_tech_delta')::integer, 0),
    policy_immediate_population_delta = COALESCE((policy_immediate_ext->>'policy_immediate_population_delta')::integer, (policy_immediate_ext->>'core_immediate_population_delta')::integer, 0),
    policy_immediate_green_delta = COALESCE((policy_immediate_ext->>'policy_immediate_green_delta')::integer, (policy_immediate_ext->>'core_immediate_green_delta')::integer, 0),
    policy_immediate_carbon_delta = COALESCE((policy_immediate_ext->>'policy_immediate_carbon_delta')::integer, (policy_immediate_ext->>'core_immediate_carbon_delta')::integer, 0),
    policy_immediate_satisfaction_delta = COALESCE((policy_immediate_ext->>'policy_immediate_satisfaction_delta')::integer, (policy_immediate_ext->>'core_immediate_satisfaction_delta')::integer, 0),
    policy_immediate_quota_delta = COALESCE((policy_immediate_ext->>'policy_immediate_quota_delta')::integer, (policy_immediate_ext->>'core_immediate_quota_delta')::integer, 0),
    policy_immediate_group = CASE card_id
        WHEN 'card061' THEN 'industry_support'
        WHEN 'card062' THEN 'carbon_control'
        WHEN 'card063' THEN 'ecology'
        WHEN 'card064' THEN 'ecology'
        WHEN 'card065' THEN 'science_support'
        WHEN 'card066' THEN 'carbon_control'
        WHEN 'card067' THEN 'society_support'
        WHEN 'card068' THEN 'citizen'
        ELSE policy_immediate_group
    END,
    policy_immediate_turns = CASE WHEN card_type = 'policy' AND policy_immediate_ext <> '{}'::jsonb THEN 3 ELSE policy_immediate_turns END,
    policy_continuous_industry_delta = COALESCE((policy_continuous_ext->>'policy_continuous_industry_delta')::integer, (policy_continuous_ext->>'core_continuous_industry_delta')::integer, 0),
    policy_continuous_tech_delta = COALESCE((policy_continuous_ext->>'policy_continuous_tech_delta')::integer, (policy_continuous_ext->>'core_continuous_tech_delta')::integer, 0),
    policy_continuous_population_delta = COALESCE((policy_continuous_ext->>'policy_continuous_population_delta')::integer, (policy_continuous_ext->>'core_continuous_population_delta')::integer, 0),
    policy_continuous_green_delta = COALESCE((policy_continuous_ext->>'policy_continuous_green_delta')::integer, (policy_continuous_ext->>'core_continuous_green_delta')::integer, 0),
    policy_continuous_carbon_delta = COALESCE((policy_continuous_ext->>'policy_continuous_carbon_delta')::integer, (policy_continuous_ext->>'core_continuous_carbon_delta')::integer, 0),
    policy_continuous_satisfaction_delta = COALESCE((policy_continuous_ext->>'policy_continuous_satisfaction_delta')::integer, (policy_continuous_ext->>'core_continuous_satisfaction_delta')::integer, 0),
    policy_continuous_low_carbon_delta = COALESCE((policy_continuous_ext->>'policy_continuous_low_carbon_delta')::integer, (policy_continuous_ext->>'core_continuous_low_carbon_delta')::integer, 0),
    policy_continuous_green_pct = COALESCE((policy_continuous_ext->>'policy_continuous_green_pct')::integer, (policy_continuous_ext->>'core_continuous_green_pct')::integer, 0),
    policy_continuous_tech_pct = COALESCE((policy_continuous_ext->>'policy_continuous_tech_pct')::integer, (policy_continuous_ext->>'core_continuous_tech_pct')::integer, 0),
    policy_continuous_population_pct = COALESCE((policy_continuous_ext->>'policy_continuous_population_pct')::integer, (policy_continuous_ext->>'core_continuous_population_pct')::integer, 0),
    policy_continuous_industry_pct = COALESCE((policy_continuous_ext->>'policy_continuous_industry_pct')::integer, (policy_continuous_ext->>'core_continuous_industry_pct')::integer, 0),
    policy_continuous_industry_carbon_reduction_pct = COALESCE((policy_continuous_ext->>'policy_continuous_industry_carbon_reduction_pct')::integer, (policy_continuous_ext->>'core_continuous_industry_carbon_reduction_pct')::integer, 0),
    updated_at = now();

WITH doc_upgrade_delta_seed(card_id, upgrade_json) AS (
    VALUES
    ('card001', '{"upgrade_delta_industry":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card002', '{"upgrade_delta_industry":2,"upgrade_delta_carbon":-2}'::jsonb),
    ('card003', '{"upgrade_delta_industry":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card004', '{"upgrade_delta_industry":2,"upgrade_delta_carbon":-2}'::jsonb),
    ('card005', '{"upgrade_delta_industry":4,"upgrade_delta_carbon":-1}'::jsonb),
    ('card006', '{"upgrade_delta_industry":5,"upgrade_delta_carbon":-1}'::jsonb),
    ('card007', '{"upgrade_delta_industry":5,"upgrade_delta_carbon":-1}'::jsonb),
    ('card008', '{"upgrade_delta_industry":4,"upgrade_delta_carbon":-1}'::jsonb),
    ('card009', '{"upgrade_delta_industry":6,"upgrade_delta_carbon":-2}'::jsonb),
    ('card010', '{"upgrade_delta_industry":6,"upgrade_delta_carbon":-3}'::jsonb),
    ('card011', '{"upgrade_delta_industry":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card012', '{"upgrade_delta_industry":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card013', '{"upgrade_delta_industry":4,"upgrade_delta_carbon":-1}'::jsonb),
    ('card014', '{"upgrade_delta_industry":4,"upgrade_delta_carbon":-1}'::jsonb),
    ('card015', '{"upgrade_delta_industry":8,"upgrade_delta_carbon":-3}'::jsonb),
    ('card016', '{"upgrade_delta_industry":7,"upgrade_delta_carbon":-3}'::jsonb),
    ('card017', '{"upgrade_delta_industry":8,"upgrade_delta_carbon":-3}'::jsonb),
    ('card018', '{"upgrade_delta_industry":7,"upgrade_delta_carbon":-4}'::jsonb),
    ('card019', '{"upgrade_delta_industry_pct":10}'::jsonb),
    ('card020', '{"upgrade_delta_industry_carbon_reduction_pct":3}'::jsonb),
    ('card021', '{"upgrade_delta_green":2,"upgrade_delta_carbon":-1}'::jsonb),
    ('card022', '{"upgrade_delta_green":2,"upgrade_delta_carbon":-1}'::jsonb),
    ('card023', '{"upgrade_delta_green":2,"upgrade_delta_carbon":-1}'::jsonb),
    ('card024', '{"upgrade_delta_green":2,"upgrade_delta_carbon":-1}'::jsonb),
    ('card025', '{"upgrade_delta_green":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card026', '{"upgrade_delta_green":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card027', '{"upgrade_delta_green":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card028', '{"upgrade_delta_green":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card029', '{"upgrade_delta_green":10,"upgrade_delta_carbon":-4}'::jsonb),
    ('card030', '{"upgrade_delta_green":8,"upgrade_delta_carbon":-5}'::jsonb),
    ('card031', '{"upgrade_delta_green_pct":10}'::jsonb),
    ('card032', '{"upgrade_delta_green":3,"upgrade_delta_industry":1}'::jsonb),
    ('card033', '{"upgrade_delta_green":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card034', '{"upgrade_delta_green":3,"upgrade_delta_carbon":-2}'::jsonb),
    ('card035', '{"upgrade_delta_ecology_card_cost_pct":10}'::jsonb),
    ('card036', '{"upgrade_delta_tech":1}'::jsonb),
    ('card037', '{"upgrade_delta_tech":1}'::jsonb),
    ('card038', '{"upgrade_delta_carbon":-3}'::jsonb),
    ('card039', '{"upgrade_delta_industry_carbon_reduction_pct":5}'::jsonb),
    ('card040', '{"upgrade_delta_new_energy_pct":10}'::jsonb),
    ('card041', '{"upgrade_delta_carbon_delta_reduction_pct":3}'::jsonb),
    ('card042', '{"upgrade_delta_tech":4,"upgrade_delta_global_pct":10}'::jsonb),
    ('card043', '{"upgrade_delta_trade_price_pct":15}'::jsonb),
    ('card044', '{"upgrade_delta_tech":1}'::jsonb),
    ('card045', '{"upgrade_delta_science_card_cost_pct":20}'::jsonb),
    ('card046', '{"upgrade_delta_population":1}'::jsonb),
    ('card047', '{"upgrade_delta_population":1}'::jsonb),
    ('card048', '{"upgrade_delta_satisfaction":2}'::jsonb),
    ('card049', '{"upgrade_delta_satisfaction":2,"upgrade_delta_carbon":-2}'::jsonb),
    ('card050', '{"upgrade_delta_satisfaction":1,"upgrade_delta_carbon":-1}'::jsonb),
    ('card051', '{"upgrade_delta_satisfaction":2}'::jsonb),
    ('card052', '{"upgrade_delta_satisfaction":3,"upgrade_delta_population":2}'::jsonb),
    ('card053', '{"upgrade_delta_satisfaction":2}'::jsonb),
    ('card054', '{"upgrade_delta_trade_price_pct":20}'::jsonb),
    ('card055', '{"upgrade_delta_carbon":-3}'::jsonb),
    ('card056', '{"upgrade_delta_ecology_card_cost_pct":10}'::jsonb),
    ('card057', '{"upgrade_delta_industry_pct":10,"upgrade_delta_upgrade_cost_pct":-10}'::jsonb),
    ('card058', '{"upgrade_delta_combo_pct":15}'::jsonb),
    ('card059', '{"upgrade_delta_ecology_sink":3}'::jsonb),
    ('card060', '{"upgrade_delta_industry":10,"upgrade_delta_industry_carbon_reduction_pct":5}'::jsonb)
)
UPDATE game.game_card card
SET
    upgrade_ext = seed.upgrade_json,
    updated_at = now()
FROM doc_upgrade_delta_seed seed
WHERE card.card_id = seed.card_id;

UPDATE game.game_card
SET
    upgrade_delta_industry = COALESCE((upgrade_ext->>'upgrade_delta_industry')::integer, 0),
    upgrade_delta_tech = COALESCE((upgrade_ext->>'upgrade_delta_tech')::integer, 0),
    upgrade_delta_population = COALESCE((upgrade_ext->>'upgrade_delta_population')::integer, 0),
    upgrade_delta_green = COALESCE((upgrade_ext->>'upgrade_delta_green')::integer, 0),
    upgrade_delta_carbon = COALESCE((upgrade_ext->>'upgrade_delta_carbon')::integer, 0),
    upgrade_delta_satisfaction = COALESCE((upgrade_ext->>'upgrade_delta_satisfaction')::integer, 0),
    upgrade_delta_quota = COALESCE((upgrade_ext->>'upgrade_delta_quota')::integer, 0),
    upgrade_delta_low_carbon = COALESCE((upgrade_ext->>'upgrade_delta_low_carbon')::integer, 0),
    upgrade_delta_sector_progress_pct = COALESCE((upgrade_ext->>'upgrade_delta_sector_progress_pct')::integer, 0),
    upgrade_delta_industry_pct = COALESCE((upgrade_ext->>'upgrade_delta_industry_pct')::integer, 0),
    upgrade_delta_green_pct = COALESCE((upgrade_ext->>'upgrade_delta_green_pct')::integer, 0),
    upgrade_delta_global_pct = COALESCE((upgrade_ext->>'upgrade_delta_global_pct')::integer, 0),
    upgrade_delta_tech_pct = COALESCE((upgrade_ext->>'upgrade_delta_tech_pct')::integer, 0),
    upgrade_delta_industry_carbon_reduction_pct = COALESCE((upgrade_ext->>'upgrade_delta_industry_carbon_reduction_pct')::integer, 0),
    upgrade_delta_carbon_delta_reduction_pct = COALESCE((upgrade_ext->>'upgrade_delta_carbon_delta_reduction_pct')::integer, 0),
    upgrade_delta_trade_price_pct = COALESCE((upgrade_ext->>'upgrade_delta_trade_price_pct')::integer, 0),
    upgrade_delta_combo_pct = COALESCE((upgrade_ext->>'upgrade_delta_combo_pct')::integer, 0),
    upgrade_delta_shared_mobility_pct = COALESCE((upgrade_ext->>'upgrade_delta_shared_mobility_pct')::integer, 0),
    upgrade_delta_ecology_card_cost_pct = COALESCE((upgrade_ext->>'upgrade_delta_ecology_card_cost_pct')::integer, 0),
    upgrade_delta_science_card_cost_pct = COALESCE((upgrade_ext->>'upgrade_delta_science_card_cost_pct')::integer, 0),
    upgrade_delta_flood_resistance_pct = COALESCE((upgrade_ext->>'upgrade_delta_flood_resistance_pct')::integer, 0),
    upgrade_delta_new_energy_pct = COALESCE((upgrade_ext->>'upgrade_delta_new_energy_pct')::integer, 0),
    upgrade_delta_ecology_sink = COALESCE((upgrade_ext->>'upgrade_delta_ecology_sink')::integer, 0),
    upgrade_delta_trad_upgrade_pct = COALESCE((upgrade_ext->>'upgrade_delta_trad_upgrade_pct')::integer, 0),
    upgrade_delta_upgrade_cost_pct = COALESCE((upgrade_ext->>'upgrade_delta_upgrade_cost_pct')::integer, 0),
    updated_at = now()
WHERE card_type = 'core';

-- Force trigger refresh for all cards
UPDATE game.game_card SET updated_at = now();
