package com.youthloop.game.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Gameplay action response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameActionResponse {
    private JsonNode newPondState;
    private Integer pointsEarned;
    private Long totalScore;
    private Integer newLevel;
    private String message;
    private Boolean sessionEnded;
    private String endingId;
    private String endingName;
    private String endingImageKey;
}
