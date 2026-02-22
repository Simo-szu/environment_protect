package com.youthloop.game.persistence.entity;

import lombok.Data;

/**
 * Game combo trigger and effect config entity.
 */
@Data
public class GameComboRuleConfigEntity {
    private String comboId;
    private Integer priorityOrder;
    private String requiredPolicyId;
    private Integer minIndustry;
    private Integer minEcology;
    private Integer minScience;
    private Integer minSociety;
    private Integer minLowCarbonIndustry;
    private Integer minShenzhenEcology;
    private Integer minLinkCards;
    private Integer minIndustryLowCarbonAdjacentPairs;
    private Integer minScienceScienceAdjacentPairs;
    private Integer minScienceIndustryAdjacentPairs;
    private Integer minIndustryEcologyAdjacentPairs;
    private Integer minSocietyEcologyAdjacentPairs;
    private Integer effectIndustryDelta;
    private Integer effectTechDelta;
    private Integer effectPopulationDelta;
    private Integer effectGreenDelta;
    private Integer effectCarbonDelta;
    private Integer effectSatisfactionDelta;
    private Integer effectQuotaDelta;
    private Integer effectLowCarbonDelta;
    private Integer effectTechPct;
    private Integer effectPopulationPct;
    private Integer effectIndustryPct;
    private Integer effectLowCarbonPct;
    private Integer effectGreenPct;
    private Integer effectGlobalPct;
    private Boolean isEnabled;
}
