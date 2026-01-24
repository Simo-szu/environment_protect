package com.youthloop.points.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.points.persistence.entity.DailyQuizEntity;
import com.youthloop.points.persistence.mapper.DailyQuizMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每日问答生成服务
 * 负责生成每日问答题目
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DailyQuizGenerationService {
    
    private final DailyQuizMapper dailyQuizMapper;
    private final ObjectMapper objectMapper;
    
    /**
     * 生成今日问答题目
     */
    @Transactional
    public void generateDailyQuiz(LocalDate quizDate) {
        // 检查今日是否已有题目
        DailyQuizEntity existing = dailyQuizMapper.selectByDate(quizDate);
        if (existing != null) {
            log.info("今日问答题目已存在，跳过生成: quizDate={}", quizDate);
            return;
        }
        
        // 生成问答题目（这里使用简单的题库轮换，实际可以接入更复杂的题库系统）
        ObjectNode question = objectMapper.createObjectNode();
        question.put("text", "以下哪项行为最有助于减少碳排放？");
        
        ArrayNode options = objectMapper.createArrayNode();
        options.add("A. 使用一次性塑料袋");
        options.add("B. 骑自行车上班");
        options.add("C. 长时间开空调");
        options.add("D. 频繁更换电子产品");
        question.set("options", options);
        
        ObjectNode answer = objectMapper.createObjectNode();
        answer.put("correct", "B");
        answer.put("explanation", "骑自行车是零排放的出行方式，有助于减少碳足迹");
        
        // 插入数据库
        DailyQuizEntity quiz = new DailyQuizEntity();
        quiz.setQuizDate(quizDate);
        quiz.setQuestion(question);
        quiz.setAnswer(answer);
        quiz.setPoints(5);
        quiz.setCreatedAt(LocalDateTime.now());
        
        dailyQuizMapper.insert(quiz);
        
        log.info("生成今日问答题目成功: quizDate={}", quizDate);
    }
}
