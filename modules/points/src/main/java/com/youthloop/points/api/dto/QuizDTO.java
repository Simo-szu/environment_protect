package com.youthloop.points.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * 问答DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {
    private LocalDate quizDate;
    private JsonNode question; // 问题JSON
    private Integer points;
    private Boolean answered; // 是否已答题
    private Boolean isCorrect; // 是否答对(已答题时返回)
}
