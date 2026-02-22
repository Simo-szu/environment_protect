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

    private Boolean isEnabled;
}
