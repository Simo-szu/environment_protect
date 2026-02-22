package com.youthloop.game.persistence.entity;

import lombok.Data;

/**
 * Game card definition entity.
 */
@Data
public class GameCardEntity {
    private String cardId;
    private Integer cardNo;
    private String nameZh;
    private String nameEn;
    private String cardType;
    private String domain;
    private Integer star;
    private String phaseBucket;
    private Integer unlockCostIndustry;
    private Integer unlockCostTech;
    private Integer unlockCostPopulation;
    private Integer unlockCostGreen;
    private String imageKey;
    private String advancedImageKey;
    private Boolean isEnabled;
}
