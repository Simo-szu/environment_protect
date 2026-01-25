package com.youthloop.points.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.points.api.dto.QuizDTO;
import com.youthloop.points.api.dto.QuizSubmitRequest;
import com.youthloop.points.api.dto.QuizSubmitResponse;
import com.youthloop.points.persistence.entity.DailyQuizEntity;
import com.youthloop.points.persistence.entity.DailyQuizRecordEntity;
import com.youthloop.points.persistence.mapper.DailyQuizMapper;
import com.youthloop.points.persistence.mapper.DailyQuizRecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

/**
 * 问答服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {
    
    private static final ZoneId ASIA_SHANGHAI = ZoneId.of("Asia/Shanghai");
    
    private final DailyQuizMapper dailyQuizMapper;
    private final DailyQuizRecordMapper dailyQuizRecordMapper;
    private final PointsService pointsService;
    
    /**
     * 获取今日问答
     */
    public QuizDTO getTodayQuiz() {
        UUID userId = SecurityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now(ASIA_SHANGHAI);
        
        // 查询今日问答
        DailyQuizEntity quiz = dailyQuizMapper.selectByDate(today);
        if (quiz == null) {
            return null; // 今日无问答
        }
        
        // 查询用户答题记录
        DailyQuizRecordEntity record = dailyQuizRecordMapper.selectByUserIdAndDate(userId, today);
        
        return QuizDTO.builder()
            .quizDate(quiz.getQuizDate())
            .question(quiz.getQuestion())
            .points(quiz.getPoints())
            .answered(record != null)
            .isCorrect(record != null ? record.getIsCorrect() : null)
            .build();
    }
    
    /**
     * 提交问答答案
     */
    @Transactional
    public QuizSubmitResponse submitQuiz(QuizSubmitRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        LocalDate quizDate = request.getQuizDate();
        
        // 查询问答
        DailyQuizEntity quiz = dailyQuizMapper.selectByDate(quizDate);
        if (quiz == null) {
            throw new IllegalArgumentException("问答不存在");
        }
        
        // 检查是否已答题
        DailyQuizRecordEntity existing = dailyQuizRecordMapper.selectByUserIdAndDate(userId, quizDate);
        if (existing != null) {
            throw new IllegalStateException("已答过此题");
        }
        
        // 判断答案是否正确
        boolean isCorrect = checkAnswer(quiz.getAnswer(), request.getUserAnswer());
        int pointsEarned = isCorrect ? quiz.getPoints() : 0;
        
        // 创建答题记录
        DailyQuizRecordEntity record = new DailyQuizRecordEntity();
        record.setUserId(userId);
        record.setQuizDate(quizDate);
        record.setUserAnswer(request.getUserAnswer());
        record.setIsCorrect(isCorrect);
        record.setPoints(pointsEarned);
        record.setCreatedAt(LocalDateTime.now());
        
        dailyQuizRecordMapper.insert(record);
        
        // 答对则发放积分
        if (isCorrect) {
            pointsService.addPoints(userId, pointsEarned, 3, null, null, "问答奖励");
        }
        
        // 获取当前总积分
        Long totalBalance = pointsService.getBalance(userId);
        
        log.info("提交问答: userId={}, date={}, correct={}, points={}", 
            userId, quizDate, isCorrect, pointsEarned);
        
        return QuizSubmitResponse.builder()
            .isCorrect(isCorrect)
            .pointsEarned(pointsEarned)
            .totalBalance(totalBalance)
            .correctAnswer(quiz.getAnswer() != null ? quiz.getAnswer().asInt() : 0)
            .explanation("暂无解析")
            .build();
    }
    
    /**
     * 检查答案是否正确
     */
    private boolean checkAnswer(JsonNode correctAnswer, JsonNode userAnswer) {
        // 简单的JSON比较,实际可能需要更复杂的逻辑
        return correctAnswer.equals(userAnswer);
    }
}
