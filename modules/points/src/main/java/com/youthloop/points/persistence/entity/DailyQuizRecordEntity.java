package com.youthloop.points.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 每日问答记录实体
 */
@Data
public class DailyQuizRecordEntity {
    private UUID userId;
    private LocalDate quizDate;
    private JsonNode userAnswer;
    private Boolean isCorrect;
    private Integer points;
    private LocalDateTime createdAt;
}
