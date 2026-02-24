package com.youthloop.game.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Gameplay action log item.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameActionLogDTO {
    private UUID id;
    private UUID sessionId;
    private UUID userId;
    private Integer actionType;
    private JsonNode actionData;
    private Integer pointsEarned;
    private OffsetDateTime createdAt;
}
