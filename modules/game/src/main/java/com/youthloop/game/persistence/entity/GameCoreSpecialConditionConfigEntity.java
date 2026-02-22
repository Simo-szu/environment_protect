package com.youthloop.game.persistence.entity;

import lombok.Data;

/**
 * Extra activation conditions for core special effects.
 */
@Data
public class GameCoreSpecialConditionConfigEntity {
    private String cardId;
    private String requiredEventType;
    private Integer minIndustryCards;
    private Integer minEcologyCards;
    private Integer minScienceCards;
    private Integer minSocietyCards;
    private Boolean isEnabled;
}
