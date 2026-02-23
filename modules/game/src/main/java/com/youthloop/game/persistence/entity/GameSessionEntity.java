package com.youthloop.game.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.OffsetDateTime;
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
    private OffsetDateTime startedAt;
    private OffsetDateTime lastActionAt;
    private Integer status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
