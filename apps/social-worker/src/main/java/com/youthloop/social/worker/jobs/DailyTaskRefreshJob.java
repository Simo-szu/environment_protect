package com.youthloop.social.worker.jobs;

import com.youthloop.points.application.service.DailyQuizGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 每日任务刷新定时任务
 * 每天10:00执行
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DailyTaskRefreshJob {
    
    private final DailyQuizGenerationService dailyQuizGenerationService;
    
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
            dailyQuizGenerationService.generateDailyQuiz(today);
            
            // 3. 其他需要每日刷新的数据（暂无）
            
            log.info("每日任务刷新完成");
        } catch (Exception e) {
            log.error("每日任务刷新失败", e);
        }
    }
}
