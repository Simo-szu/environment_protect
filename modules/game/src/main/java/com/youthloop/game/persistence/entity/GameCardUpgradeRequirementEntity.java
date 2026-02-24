package com.youthloop.game.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

/**
 * Upgrade requirement entity for game cards.
 */
@Data
public class GameCardUpgradeRequirementEntity {
    private String cardId;
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
    private JsonNode ruleJson;
    private JsonNode costJson;
    private JsonNode configSnapshot;
    private Boolean isEnabled;
}
