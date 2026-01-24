package com.youthloop.game.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 游戏操作实体
 */
@Data
public class GameActionEntity {
    private UUID id;
    private UUID sessionId;
    private UUID userId;
    private Integer actionType;
    private JsonNode actionData;
    private Integer pointsEarned;
    private LocalDateTime createdAt;
}
