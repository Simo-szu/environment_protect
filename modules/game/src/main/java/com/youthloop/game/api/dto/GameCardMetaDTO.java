package com.youthloop.game.api.dto;

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
}
