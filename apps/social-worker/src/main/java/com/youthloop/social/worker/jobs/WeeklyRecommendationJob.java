package com.youthloop.social.worker.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.recommendation.persistence.entity.WeeklyRecommendationEntity;
import com.youthloop.recommendation.persistence.mapper.WeeklyRecommendationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 每周推荐生成任务
 * 每周一凌晨2点执行
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyRecommendationJob {
    
    private final JdbcTemplate jdbcTemplate;
    private final WeeklyRecommendationMapper weeklyRecommendationMapper;
    private final ObjectMapper objectMapper;
    
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
            List<UUID> activeUserIds = getActiveUsers();
            log.info("获取到 {} 个活跃用户", activeUserIds.size());
            
            // 2. 为每个用户生成推荐
            int successCount = 0;
            for (UUID userId : activeUserIds) {
                try {
                    generateRecommendationForUser(userId, weekStart);
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
    
    /**
     * 获取活跃用户列表（最近30天有登录）
     */
    private List<UUID> getActiveUsers() {
        String sql = """
            SELECT id
            FROM shared.user
            WHERE status = 1
              AND last_login_at >= NOW() - INTERVAL '30 days'
            ORDER BY last_login_at DESC
            LIMIT 1000
            """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> 
            UUID.fromString(rs.getString("id"))
        );
    }
    
    /**
     * 为单个用户生成推荐
     */
    private void generateRecommendationForUser(UUID userId, LocalDate weekStart) {
        // 检查本周是否已有推荐
        WeeklyRecommendationEntity existing = weeklyRecommendationMapper.selectByUserIdAndWeek(userId, weekStart);
        if (existing != null) {
            log.debug("用户本周推荐已存在，跳过: userId={}, weekStart={}", userId, weekStart);
            return;
        }
        
        // 基于用户行为生成推荐（简化版：热门内容 + 热门活动）
        ArrayNode items = objectMapper.createArrayNode();
        
        // 1. 推荐热门内容（前5条）
        List<Map<String, Object>> hotContents = getHotContents(5);
        for (Map<String, Object> content : hotContents) {
            ObjectNode item = objectMapper.createObjectNode();
            item.put("type", "content");
            item.put("id", content.get("id").toString());
            item.put("title", (String) content.get("title"));
            item.put("reason", "热门科普");
            items.add(item);
        }
        
        // 2. 推荐热门活动（前3条）
        List<Map<String, Object>> hotActivities = getHotActivities(3);
        for (Map<String, Object> activity : hotActivities) {
            ObjectNode item = objectMapper.createObjectNode();
            item.put("type", "activity");
            item.put("id", activity.get("id").toString());
            item.put("title", (String) activity.get("title"));
            item.put("reason", "热门活动");
            items.add(item);
        }
        
        // 如果没有推荐内容，跳过
        if (items.size() == 0) {
            log.debug("用户无推荐内容，跳过: userId={}", userId);
            return;
        }
        
        // 插入推荐记录
        WeeklyRecommendationEntity entity = new WeeklyRecommendationEntity();
        entity.setUserId(userId);
        entity.setWeekStart(weekStart);
        entity.setItems(items);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        weeklyRecommendationMapper.insert(entity);
        
        log.debug("为用户生成推荐成功: userId={}, itemCount={}", userId, items.size());
    }
    
    /**
     * 获取热门内容
     */
    private List<Map<String, Object>> getHotContents(int limit) {
        String sql = """
            SELECT c.id, c.title
            FROM social.content c
            LEFT JOIN social.content_stats s ON c.id = s.content_id
            WHERE c.status = 1
            ORDER BY COALESCE(s.hot_score, 0) DESC, c.published_at DESC
            LIMIT ?
            """;
        
        return jdbcTemplate.queryForList(sql, limit);
    }
    
    /**
     * 获取热门活动
     */
    private List<Map<String, Object>> getHotActivities(int limit) {
        String sql = """
            SELECT a.id, a.title
            FROM social.activity a
            LEFT JOIN social.activity_stats s ON a.id = s.activity_id
            WHERE a.status = 1
              AND a.start_time > NOW()
            ORDER BY COALESCE(s.hot_score, 0) DESC, a.start_time ASC
            LIMIT ?
            """;
        
        return jdbcTemplate.queryForList(sql, limit);
    }
}
