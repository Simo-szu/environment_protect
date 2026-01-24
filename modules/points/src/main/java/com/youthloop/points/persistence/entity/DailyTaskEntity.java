package com.youthloop.points.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 每日任务实体
 */
@Data
public class DailyTaskEntity {
    private UUID id;
    private String code;
    private String name;
    private JsonNode ruleJson;
    private Integer points;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
}
