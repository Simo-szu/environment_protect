package com.youthloop.points.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 问答提交响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitResponse {
    @JsonProperty("correct")
    private Boolean isCorrect;
    @JsonProperty("earnedPoints")
    private Integer pointsEarned;
    
    private Integer correctAnswer;
    private String explanation;
    private Long totalBalance;
}
