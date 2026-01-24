package com.youthloop.points.persistence.entity;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每日问答实体
 */
@Data
public class DailyQuizEntity {
    private LocalDate quizDate;
    private JsonNode question;
    private JsonNode answer;
    private Integer points;
    private LocalDateTime createdAt;
}
