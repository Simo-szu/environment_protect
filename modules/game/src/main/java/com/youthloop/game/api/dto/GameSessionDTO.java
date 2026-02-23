package com.youthloop.game.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * 游戏会话DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSessionDTO {
    private UUID id;
    private UUID userId;
    private JsonNode pondState; // 池塘状态
    private Long score;
    private Integer level;
    private OffsetDateTime startedAt;
    private OffsetDateTime lastActionAt;
    private Integer status; // 1=active 2=paused 3=ended
}
