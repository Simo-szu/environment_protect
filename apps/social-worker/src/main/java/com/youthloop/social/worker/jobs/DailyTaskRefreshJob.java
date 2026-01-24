package com.youthloop.social.worker.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.points.persistence.entity.DailyQuizEntity;
import com.youthloop.points.persistence.mapper.DailyQuizMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * 每日任务刷新定时任务
 * 每天10:00执行
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DailyTaskRefreshJob {
    
    private final JdbcTemplate jdbcTemplate;
    private final DailyQuizMapper dailyQuizMapper;
    private final ObjectMapper objectMapper;
    
    private static final ZoneId ASIA_SHANGHAI = ZoneId.of("Asia/Shanghai");
    
    /**
     * 每天10:00刷新任务
     * cron: 秒 分 时 日 月 周
     */
    @Scheduled(cron = "0 0 10 * * ?", zone = "Asia/Shanghai")
    public void refreshDailyTasks() {
        log.info("开始刷新每日任务...");
        
        try {
            LocalDate today = LocalDate.now(ASIA_SHANGHAI);
            
            // 1. 清理昨日未完成的任务进度（可选：保留历史记录用于统计）
            // 这里不删除，只是让它们自然过期（查询时按 task_date 过滤）
            log.info("昨日任务进度保留，不做清理");
            
            // 2. 生成今日问答题目
            generateDailyQuiz(today);
            
            // 3. 其他需要每日刷新的数据（暂无）
            
            log.info("每日任务刷新完成");
        } catch (Exception e) {
            log.error("每日任务刷新失败", e);
        }
    }
    
    /**
     * 生成今日问答题目
     */
    private void generateDailyQuiz(LocalDate quizDate) {
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
