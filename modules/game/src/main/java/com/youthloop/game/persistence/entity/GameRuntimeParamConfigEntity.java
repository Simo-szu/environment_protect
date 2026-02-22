package com.youthloop.game.persistence.entity;

import lombok.Data;

/**
 * Runtime gameplay parameter config entity.
 */
@Data
public class GameRuntimeParamConfigEntity {
    private Integer configId;
    private Integer coreHandLimit;
    private Integer policyHandLimit;
    private Integer maxComboPerTurn;
    private Integer maxTurn;
    private Integer handDiscardDecisionSeconds;
    private Integer tradeWindowInterval;
    private Integer tradeWindowSeconds;
    private Double baseCarbonPrice;
    private Integer maxCarbonQuota;
    private Integer domainProgressCardCap;
    private Boolean isEnabled;
}
