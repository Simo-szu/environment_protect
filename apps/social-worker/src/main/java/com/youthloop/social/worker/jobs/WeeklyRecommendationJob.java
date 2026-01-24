package com.youthloop.social.worker.jobs;

import com.youthloop.recommendation.application.service.RecommendationGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

/**
 * 每周推荐生成任务
 * 每周一凌晨2点执行
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyRecommendationJob {
    
    private final RecommendationGenerationService recommendationGenerationService;
    
    private static final ZoneId ASIA_SHANGHAI = ZoneId.of("Asia/Shanghai");
    
    /**
     * 每周一凌晨2点生成推荐
     * cron: 秒 分 时 日 月 周
     */
    @Scheduled(cron = "0 0 2 * * MON", zone = "Asia/Shanghai")
    public void generateWeeklyRecommendations() {
        log.info("开始生成每周个性推荐...");
        
        try {
            LocalDate today = LocalDate.now(ASIA_SHANGHAI);
            LocalDate weekStart = today.with(DayOfWeek.MONDAY);
            
            // 1. 获取所有活跃用户（最近30天有登录的用户）
            List<UUID> activeUserIds = recommendationGenerationService.getActiveUsers();
            log.info("获取到 {} 个活跃用户", activeUserIds.size());
            
            // 2. 为每个用户生成推荐
            int successCount = 0;
            for (UUID userId : activeUserIds) {
                try {
                    recommendationGenerationService.generateRecommendationForUser(userId, weekStart);
                    successCount++;
                } catch (Exception e) {
                    log.error("为用户生成推荐失败: userId={}", userId, e);
                }
            }
            
            log.info("每周推荐生成完成: 成功={}/{}", successCount, activeUserIds.size());
        } catch (Exception e) {
            log.error("每周推荐生成失败", e);
        }
    }
}
