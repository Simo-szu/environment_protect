package com.youthloop.game.persistence.entity;

import lombok.Data;

/**
 * Game policy unlock rule config entity.
 */
@Data
public class GamePolicyUnlockRuleConfigEntity {
    private String policyId;
    private Integer priorityOrder;
    private Integer minIndustry;
    private Integer minEcology;
    private Integer minScience;
    private Integer minSociety;
    private Integer minIndustryResource;
    private Integer minTechResource;
    private Integer minPopulationResource;
    private Integer minGreen;
    private Integer minCarbon;
    private Integer maxCarbon;
    private Integer minSatisfaction;
    private Integer minTaggedCards;
    private String requiredTag;
    private Boolean isEnabled;
}
