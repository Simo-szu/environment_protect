package com.youthloop.game.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Admin create game card request.
 */
@Data
public class AdminCreateGameCardRequest {
    @NotBlank
    private String cardId;

    @NotNull
    @Min(1)
    private Integer cardNo;

    @NotBlank
    private String chineseName;

    @NotBlank
    private String englishName;

    @NotBlank
    private String cardType;

    @NotBlank
    private String domain;

    @NotNull
    @Min(1)
    private Integer star;

    @NotBlank
    private String phaseBucket;

    @NotNull
    @Min(0)
    private Integer unlockCostIndustry;

    @NotNull
    @Min(0)
    private Integer unlockCostTech;

    @NotNull
    @Min(0)
    private Integer unlockCostPopulation;

    @NotNull
    @Min(0)
    private Integer unlockCostGreen;

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
    private Integer coreConditionMinTaggedCards;
    private String coreConditionRequiredTag;
    private Integer coreSpecialEcologyCardCostReductionPct;
    private Integer coreSpecialScienceCardCostReductionPct;
    private Integer coreSpecialFloodResistancePct;
    private Integer coreSpecialNewEnergyIndustryPct;
    private Integer coreSpecialEcologyCarbonSinkPerTenGreen;

    private Boolean isEnabled;
}
