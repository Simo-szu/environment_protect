package com.youthloop.points.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 徽章/等级实体
 */
@Data
public class BadgeEntity {
    private UUID id;
    private Integer series; // 1=积分等级 2=签到等级
    private String name;
    private JsonNode threshold; // JSONB: {"balanceGte": 100}
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
