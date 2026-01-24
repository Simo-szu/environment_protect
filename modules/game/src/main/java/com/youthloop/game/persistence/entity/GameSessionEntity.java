package com.youthloop.game.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 游戏会话实体
 */
@Data
public class GameSessionEntity {
    private UUID id;
    private UUID userId;
    private JsonNode pondState;
    private Long score;
    private Integer level;
    private LocalDateTime startedAt;
    private LocalDateTime lastActionAt;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
