package com.youthloop.query.service;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.query.dto.ContentDetailDTO;
import com.youthloop.query.dto.ContentListItemDTO;
import com.youthloop.query.dto.UserState;
import com.youthloop.query.mapper.ContentQueryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 内容查询服务（聚合查询）
 */
@Slf4j
@Service("contentAggregateQueryService")
@RequiredArgsConstructor
public class ContentQueryService {
    
    private final ContentQueryMapper contentQueryMapper;
    
    /**
     * 查询内容列表（含统计和用户状态）
     */
    @Transactional(readOnly = true)
    public PageResponse<ContentListItemDTO> getContentList(Integer type, Integer status, Integer page, Integer size) {
        // 参数校验
        status = status != null ? status : 1; // 默认只查已发布
        page = Math.max(1, page != null ? page : 1);
        size = Math.min(100, Math.max(1, size != null ? size : 20));
        int offset = (page - 1) * size;
        
        // 查询总数
        Long total = contentQueryMapper.countContentList(type, status);
        
        if (total == 0) {
            return PageResponse.of(Collections.emptyList(), total, page, size);
        }
        
        // 查询列表（含统计）
        List<Map<String, Object>> rows = contentQueryMapper.selectContentListWithStats(type, status, offset, size);
        
        if (rows.isEmpty()) {
            return PageResponse.of(Collections.emptyList(), total, page, size);
        }
        
        // 转换为 DTO
        List<ContentListItemDTO> items = rows.stream()
            .map(this::mapToContentListItem)
            .collect(Collectors.toList());
        
        // 如果用户已登录，查询用户状态
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        if (currentUserId != null) {
            enrichWithUserState(items, currentUserId);
        }
        
        return PageResponse.of(items, total, page, size);
    }
    
    /**
     * 查询内容详情（含统计和用户状态）
     */
    @Transactional(readOnly = true)
    public ContentDetailDTO getContentDetail(UUID contentId) {
        // 查询详情（含统计）
        Map<String, Object> row = contentQueryMapper.selectContentDetailWithStats(contentId);
        
        if (row == null) {
            return null;
        }
        
        // 转换为 DTO
        ContentDetailDTO dto = mapToContentDetail(row);
        
        // 如果用户已登录，查询用户状态
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        if (currentUserId != null) {
            List<Map<String, Object>> reactions = contentQueryMapper.selectUserReactionsForContents(
                currentUserId, 
                Collections.singletonList(contentId)
            );
            
            if (!reactions.isEmpty()) {
                dto.setUserState(buildUserState(reactions.get(0)));
            } else {
                dto.setUserState(UserState.empty());
            }
        }
        
        return dto;
    }
    
    /**
     * 为内容列表填充用户状态
     */
    private void enrichWithUserState(List<ContentListItemDTO> items, UUID userId) {
        List<UUID> contentIds = items.stream()
            .map(ContentListItemDTO::getId)
            .collect(Collectors.toList());
        
        List<Map<String, Object>> reactions = contentQueryMapper.selectUserReactionsForContents(userId, contentIds);
        
        // 构建 contentId -> UserState 的映射
        Map<UUID, UserState> stateMap = reactions.stream()
            .collect(Collectors.toMap(
                row -> (UUID) row.get("content_id"),
                this::buildUserState
            ));
        
        // 填充到 DTO
        items.forEach(item -> {
            UserState state = stateMap.get(item.getId());
            item.setUserState(state != null ? state : UserState.empty());
        });
    }
    
    /**
     * 从数据库行构建 UserState
     */
    private UserState buildUserState(Map<String, Object> row) {
        Boolean liked = (Boolean) row.getOrDefault("liked", false);
        Boolean favorited = (Boolean) row.getOrDefault("favorited", false);
        Boolean downvoted = (Boolean) row.getOrDefault("downvoted", false);
        return new UserState(liked, favorited, downvoted);
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
        dto.setPublishedAt((LocalDateTime) row.get("published_at"));
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt((LocalDateTime) row.get("created_at"));
        
        // 统计信息（安全转换）
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        dto.setHotScore(row.get("hot_score") != null ? ((Number) row.get("hot_score")).longValue() : 0L);
        
        return dto;
    }
    
    /**
     * 映射到内容详情 DTO
     */
    private ContentDetailDTO mapToContentDetail(Map<String, Object> row) {
        ContentDetailDTO dto = new ContentDetailDTO();
        dto.setId((UUID) row.get("id"));
        dto.setType((Integer) row.get("type"));
        dto.setTitle((String) row.get("title"));
        dto.setSummary((String) row.get("summary"));
        dto.setCoverUrl((String) row.get("cover_url"));
        dto.setBody((String) row.get("body"));
        dto.setSourceType((Integer) row.get("source_type"));
        dto.setSourceUrl((String) row.get("source_url"));
        dto.setPublishedAt((LocalDateTime) row.get("published_at"));
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt((LocalDateTime) row.get("created_at"));
        dto.setUpdatedAt((LocalDateTime) row.get("updated_at"));
        
        // 统计信息（安全转换）
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setDownCount(row.get("down_count") != null ? ((Number) row.get("down_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        dto.setHotScore(row.get("hot_score") != null ? ((Number) row.get("hot_score")).longValue() : 0L);
        
        return dto;
    }
}
