-- ============================================================================
-- YouthLoop Game Schema Migration V019
-- Schema: game
-- Purpose: Rebalance low-carbon scoring and make ending thresholds less punitive
-- ============================================================================

UPDATE game.game_balance_rule_config
SET
    low_carbon_min_for_positive_ending = 100,
    low_carbon_domain_bonus = 7,
    low_carbon_event_resolved_score = 12,
    low_carbon_event_triggered_penalty = 6,
    carbon_tier_1_score = 12,
    carbon_tier_2_score = 7,
    carbon_tier_3_score = 3,
    carbon_tier_4_score = -2,
    carbon_tier_5_score = -6,
    ending_innovation_min_low_carbon = 150,
    ending_ecology_min_low_carbon = 150,
    ending_doughnut_min_low_carbon = 145,
    config_snapshot = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            COALESCE(config_snapshot, '{}'::jsonb),
                            '{ending,lowCarbonMin}',
                            '100'::jsonb,
                            true
                        ),
                        '{scoring,domainBonus}',
                        '7'::jsonb,
                        true
                    ),
                    '{scoring,eventResolvedScore}',
                    '12'::jsonb,
                    true
                ),
                '{scoring,eventUnresolvedPenalty}',
                '6'::jsonb,
                true
            ),
            '{scoring,carbonTier}',
            '{"tier1":12,"tier2":7,"tier3":3,"tier4":-2,"tier5":-6}'::jsonb,
            true
        ),
        '{tuningVersion}',
        '"v019"'::jsonb,
        true
    ),
    updated_at = now()
WHERE config_id = 1;

UPDATE game.game_ending_content_config
SET
    failure_reason_low_score = '终局时低碳总分未达到100。优先解锁政策、化解负面事件，并保持低碳与均衡布局。',
    updated_at = now()
WHERE ending_id = 'failure';
