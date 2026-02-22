package com.youthloop.game.persistence.entity;

import lombok.Data;

/**
 * Game negative event rule config entity.
 */
@Data
public class GameEventRuleConfigEntity {
    private String eventType;
    private Integer triggerProbabilityPct;
    private Integer minGreen;
    private Integer minCarbon;
    private Integer maxSatisfaction;
    private Integer minPopulation;
    private Boolean requireEvenTurn;
    private Integer weight;
    private Integer durationTurns;
    private Integer greenDelta;
    private Integer carbonDelta;
    private Integer satisfactionDelta;
    private Integer greenPctDelta;
    private Integer populationPctDelta;
    private Integer quotaDelta;
    private String displayName;
    private String effectSummary;
    private String resolutionHint;
    private String resolvablePolicyIdsCsv;
    private Boolean isEnabled;
}
