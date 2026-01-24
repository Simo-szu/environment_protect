package com.youthloop.recommendation.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.recommendation.api.dto.RecommendationDTO;
import com.youthloop.recommendation.persistence.entity.WeeklyRecommendationEntity;
import com.youthloop.recommendation.persistence.mapper.WeeklyRecommendationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 推荐服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {
    
    private static final ZoneId ASIA_SHANGHAI = ZoneId.of("Asia/Shanghai");
    private final WeeklyRecommendationMapper weeklyRecommendationMapper;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取用户的每周个性推荐
     */
    public RecommendationDTO getWeeklyRecommendation() {
        UUID userId = SecurityUtil.getCurrentUserId();
        LocalDate today = LocalDate.now(ASIA_SHANGHAI);
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        
        WeeklyRecommendationEntity entity = weeklyRecommendationMapper.selectByUserIdAndWeek(userId, weekStart);
        
        if (entity == null) {
            // 如果没有本周推荐,返回空
            log.info("用户本周无个性推荐: userId={}, weekStart={}", userId, weekStart);
            return RecommendationDTO.builder()
                .items(objectMapper.createArrayNode())
                .source("weekly")
                .build();
        }
        
        return RecommendationDTO.builder()
            .items(entity.getItems())
            .source("weekly")
            .build();
    }
    
    /**
     * 获取最新推荐(实时查询)
     */
    public RecommendationDTO getLatestRecommendation() {
        // 查询最新的内容和活动
        String sql = """
            (SELECT id, 'content' as type, title, published_at as time
             FROM social.content
             WHERE status = 1
             ORDER BY published_at DESC
             LIMIT 5)
            UNION ALL
            (SELECT id, 'activity' as type, title, start_time as time
             FROM social.activity
             WHERE status = 1
             ORDER BY start_time DESC
             LIMIT 5)
            ORDER BY time DESC
            LIMIT 10
            """;
        
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
        
        // 转换为JSON
        ArrayNode items = objectMapper.createArrayNode();
        for (Map<String, Object> row : results) {
            ObjectNode item = objectMapper.createObjectNode();
            item.put("id", row.get("id").toString());
            item.put("type", (String) row.get("type"));
            item.put("title", (String) row.get("title"));
            items.add(item);
        }
        
        return RecommendationDTO.builder()
            .items(items)
            .source("latest")
            .build();
    }
}
