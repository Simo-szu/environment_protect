package com.youthloop.game.api.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * Admin update game card request.
 */
@Data
public class AdminUpdateGameCardRequest {
    @Min(1)
    private Integer cardNo;

    private String chineseName;

    private String englishName;

    private String cardType;

    private String domain;

    @Min(1)
    private Integer star;

    private String phaseBucket;

    @Min(0)
    private Integer unlockCostIndustry;

    @Min(0)
    private Integer unlockCostTech;

    @Min(0)
    private Integer unlockCostPopulation;

    @Min(0)
    private Integer unlockCostGreen;

    private String imageKey;

    private String advancedImageKey;

    private Boolean isEnabled;
}
