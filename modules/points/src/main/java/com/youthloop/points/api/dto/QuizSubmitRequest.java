package com.youthloop.points.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.time.LocalDate;

/**
 * 问答提交请求
 */
@Data
public class QuizSubmitRequest {
    private LocalDate quizDate;
    private JsonNode userAnswer;
}
