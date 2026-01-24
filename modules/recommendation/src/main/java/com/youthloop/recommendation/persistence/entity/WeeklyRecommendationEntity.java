package com.youthloop.recommendation.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 每周推荐实体
 */
@Data
public class WeeklyRecommendationEntity {
    private UUID userId;
    private LocalDate weekStart;
    private JsonNode items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
