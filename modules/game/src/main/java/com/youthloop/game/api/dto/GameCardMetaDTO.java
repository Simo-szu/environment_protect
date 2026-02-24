package com.youthloop.game.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Card metadata exposed to the frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameCardMetaDTO {
    private String cardId;
    private Integer cardNo;
    private String chineseName;
    private String englishName;
    private String cardType;
    private String domain;
    private Integer star;
    private String phaseBucket;
    private UnlockCost unlockCost;
    private String imageKey;
    private String advancedImageKey;
    private Integer policyImmediateIndustryDelta;
    private Integer policyImmediateTechDelta;
    private Integer policyImmediatePopulationDelta;
    private Integer policyImmediateGreenDelta;
    private Integer policyImmediateCarbonDelta;
    private Integer policyImmediateSatisfactionDelta;
    private Integer policyImmediateQuotaDelta;
    private String policyImmediateGroup;
    private Integer policyImmediateTurns;
    private Integer policyContinuousIndustryDelta;
    private Integer policyContinuousTechDelta;
    private Integer policyContinuousPopulationDelta;
    private Integer policyContinuousGreenDelta;
    private Integer policyContinuousCarbonDelta;
    private Integer policyContinuousSatisfactionDelta;
    private Integer policyContinuousLowCarbonDelta;
    private Integer policyContinuousGreenPct;
    private Integer policyContinuousTechPct;
    private Integer policyContinuousPopulationPct;
    private Integer policyContinuousIndustryPct;
    private Integer policyContinuousIndustryCarbonReductionPct;
    private Integer coreDomainProgressBonus;
    private Integer coreContinuousIndustryDelta;
    private Integer coreContinuousTechDelta;
    private Integer coreContinuousPopulationDelta;
    private Integer coreContinuousGreenDelta;
    private Integer coreContinuousCarbonDelta;
    private Integer coreContinuousSatisfactionDelta;
    private Integer coreContinuousQuotaDelta;
    private Integer coreContinuousLowCarbonDelta;
    private Integer coreContinuousIndustryPct;
    private Integer coreContinuousTechPct;
    private Integer coreContinuousPopulationPct;
    private Integer coreContinuousGreenPct;
    private Integer coreContinuousGlobalPct;
    private Integer coreContinuousLowCarbonPct;
    private Integer coreContinuousIndustryCarbonReductionPct;
    private Integer coreContinuousCarbonDeltaReductionPct;
    private Integer coreContinuousTradePricePct;
    private Integer coreContinuousComboPct;
    private Integer coreConditionMinTurn;
    private Integer coreConditionMinIndustryResource;
    private Integer coreConditionMinTechResource;
    private Integer coreConditionMaxCarbon;
    private Integer coreConditionMinIndustryCards;
    private Integer coreConditionMinIndustryProgressPct;
    private Integer coreConditionMinGreen;
    private Integer coreConditionMinSocietyProgressPct;
    private Integer coreConditionMinTaggedCards;
    private String coreConditionRequiredTag;
    private Integer coreSpecialEcologyCardCostReductionPct;
    private Integer coreSpecialScienceCardCostReductionPct;
    private Integer coreSpecialFloodResistancePct;
    private Integer coreSpecialNewEnergyIndustryPct;
    private Integer coreSpecialEcologyCarbonSinkPerTenGreen;
    private Integer upgradeDeltaIndustry;
    private Integer upgradeDeltaTech;
    private Integer upgradeDeltaPopulation;
    private Integer upgradeDeltaGreen;
    private Integer upgradeDeltaCarbon;
    private Integer upgradeDeltaSatisfaction;
    private Integer upgradeDeltaQuota;
    private Integer upgradeDeltaLowCarbon;
    private Integer upgradeDeltaSectorProgressPct;
    private Integer upgradeDeltaIndustryPct;
    private Integer upgradeDeltaGreenPct;
    private Integer upgradeDeltaGlobalPct;
    private Integer upgradeDeltaTechPct;
    private Integer upgradeDeltaIndustryCarbonReductionPct;
    private Integer upgradeDeltaCarbonDeltaReductionPct;
    private Integer upgradeDeltaTradePricePct;
    private Integer upgradeDeltaComboPct;
    private Integer upgradeDeltaSharedMobilityPct;
    private Integer upgradeDeltaEcologyCardCostPct;
    private Integer upgradeDeltaScienceCardCostPct;
    private Integer upgradeDeltaFloodResistancePct;
    private Integer upgradeDeltaNewEnergyPct;
    private Integer upgradeDeltaEcologySink;
    private Integer upgradeDeltaTradUpgradePct;
    private Integer upgradeDeltaUpgradeCostPct;
    private JsonNode upgradeEffect;
    private UpgradeRequirement upgradeRequirement;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnlockCost {
        private Integer industry;
        private Integer tech;
        private Integer population;
        private Integer green;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpgradeRequirement {
        private Integer fromStar;
        private Integer toStar;
        private String reqDomain1;
        private Integer reqDomain1MinPct;
        private String reqDomain2;
        private Integer reqDomain2MinPct;
        private Integer costIndustry;
        private Integer costTech;
        private Integer costPopulation;
        private Integer costGreen;
        private JsonNode configSnapshot;
    }
}
