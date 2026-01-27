package com.youthloop.query.service;

import com.youthloop.query.dto.*;
import com.youthloop.query.mapper.ContentQueryMapper;
import com.youthloop.query.mapper.HomeQueryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 首页查询服务（聚合查询）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HomeQueryService {
    
    private final HomeQueryMapper homeQueryMapper;
    private final ContentQueryMapper contentQueryMapper;
    
    /**
     * 查询首页聚合数据
     * 
     * @param locale 语言代码
     * @return 首页数据（轮播 + 最新内容 + 最新活动）
     */
    @Transactional(readOnly = true)
    public HomeDTO getHomeData() {
        HomeDTO dto = new HomeDTO();
        
        // 查询轮播/运营位
        List<Map<String, Object>> bannerRows = homeQueryMapper.selectActiveBanners();
        dto.setBanners(bannerRows.stream()
            .map(this::mapToHomeBannerDTO)
            .collect(Collectors.toList()));
        
        // 查询最新内容（前 10 条）
        List<Map<String, Object>> contentRows = contentQueryMapper.selectLatestContents(10);
        dto.setLatestContents(contentRows.stream()
            .map(this::mapToContentListItem)
            .collect(Collectors.toList()));
        
        // 查询最新活动（前 5 条）
        List<Map<String, Object>> activityRows = homeQueryMapper.selectLatestActivities(5);
        dto.setLatestActivities(activityRows.stream()
            .map(this::mapToActivityListItem)
            .collect(Collectors.toList()));
        
        return dto;
    }
    
    private java.time.LocalDateTime toLocalDateTime(Object obj) {
        if (obj == null) return null;
        if (obj instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) obj).toLocalDateTime();
        }
        if (obj instanceof java.time.LocalDateTime) {
            return (java.time.LocalDateTime) obj;
        }
        return null;
    }

    /**
     * 映射到轮播 DTO
     */
    private HomeBannerDTO mapToHomeBannerDTO(Map<String, Object> row) {
        HomeBannerDTO dto = new HomeBannerDTO();
        dto.setId((UUID) row.get("id"));
        dto.setTitle((String) row.get("title"));
        dto.setImageUrl((String) row.get("image_url"));
        dto.setLinkUrl((String) row.get("link_url"));
        dto.setSortOrder((Integer) row.get("sort_order"));
        dto.setStartAt(toLocalDateTime(row.get("start_at")));
        dto.setEndAt(toLocalDateTime(row.get("end_at")));
        return dto;
    }
    
    /**
     * 映射到内容列表项 DTO
     */
    private ContentListItemDTO mapToContentListItem(Map<String, Object> row) {
        ContentListItemDTO dto = new ContentListItemDTO();
        dto.setId((UUID) row.get("id"));
        dto.setType((Integer) row.get("type"));
        dto.setTitle((String) row.get("title"));
        dto.setSummary((String) row.get("summary"));
        dto.setCoverUrl((String) row.get("cover_url"));
        dto.setPublishedAt(toLocalDateTime(row.get("published_at")));
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt(toLocalDateTime(row.get("created_at")));
        
        // 统计信息（安全转换）
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        dto.setHotScore(row.get("hot_score") != null ? ((Number) row.get("hot_score")).longValue() : 0L);
        
        return dto;
    }
    
    /**
     * 映射到活动列表项 DTO
     */
    private ActivityListItemDTO mapToActivityListItem(Map<String, Object> row) {
        ActivityListItemDTO dto = new ActivityListItemDTO();
        dto.setId((UUID) row.get("id"));
        dto.setSourceType((Integer) row.get("source_type"));
        dto.setTitle((String) row.get("title"));
        dto.setCategory((Integer) row.get("category"));
        dto.setTopic((String) row.get("topic"));
        dto.setStartTime(toLocalDateTime(row.get("start_time")));
        dto.setEndTime(toLocalDateTime(row.get("end_time")));
        dto.setLocation((String) row.get("location"));
        
        // 提取第一张海报
        Object posterUrls = row.get("poster_urls");
        if (posterUrls != null) {
            // 这里简化处理，实际需要解析 JSONB
            dto.setPosterUrl(posterUrls.toString());
        }
        
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt(toLocalDateTime(row.get("created_at")));
        
        // 统计信息（安全转换）
        dto.setSignupCount(row.get("signup_count") != null ? ((Number) row.get("signup_count")).intValue() : 0);
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        
        return dto;
    }
}
