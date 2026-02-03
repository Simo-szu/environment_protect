package com.youthloop.query.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.query.dto.ActivityDetailDTO;
import com.youthloop.query.dto.ActivityListItemDTO;
import com.youthloop.query.dto.ActivitySessionDTO;
import com.youthloop.query.dto.UserState;
import com.youthloop.query.mapper.ActivityQueryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 活动查询服务（只读）
 */
@Slf4j
@Service("activityAggregateQueryService")
@RequiredArgsConstructor
public class ActivityQueryService {
    
    private final ActivityQueryMapper activityQueryMapper;
    private final ObjectMapper objectMapper;
    
    /**
     * 查询活动列表（分页 + 筛选 + 排序）
     */
    @Transactional(readOnly = true)
    public PageResponse<ActivityListItemDTO> getActivityList(Integer category, Integer status, String sort, Integer page, Integer size) {
        // 参数校验与默认值
        int validPage = Math.max(1, page);
        int validSize = Math.min(100, Math.max(1, size));
        int offset = (validPage - 1) * validSize;
        Integer validStatus = (status != null) ? status : 1; // 默认只查已发布
        String validSort = (sort != null && sort.equals("hot")) ? "hot" : "latest";
        
        // 查询总数
        Long total = activityQueryMapper.countActivityList(category, validStatus);
        
        if (total == 0) {
            return PageResponse.of(Collections.emptyList(), total, validPage, validSize);
        }
        
        // 查询列表
        List<Map<String, Object>> rows = activityQueryMapper.selectActivityList(
            category, validStatus, validSort, offset, validSize
        );
        
        // 获取当前用户 ID（如果已登录）
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        
        // 如果已登录，批量查询用户状态
        Map<UUID, UserState> userStateMap = new HashMap<>();
        Map<UUID, Boolean> signedUpMap = new HashMap<>();
        if (currentUserId != null && !rows.isEmpty()) {
            List<UUID> activityIds = rows.stream()
                .map(row -> UUID.fromString(row.get("id").toString()))
                .collect(Collectors.toList());
            
            List<Map<String, Object>> userStates = activityQueryMapper.selectUserStates(currentUserId, activityIds);
            for (Map<String, Object> state : userStates) {
                Object activityIdObj = state.get("activity_id");
                if (activityIdObj == null) {
                    log.warn("activity_id is null in user state: {}", state);
                    continue;
                }
                UUID activityId = UUID.fromString(activityIdObj.toString());
                UserState us = new UserState();
                us.setLiked((Boolean) state.get("liked"));
                us.setFavorited((Boolean) state.get("favorited"));
                us.setDownvoted((Boolean) state.get("downvoted"));
                userStateMap.put(activityId, us);
                
                // 存储 signedUp 状态
                Boolean signedUp = (Boolean) state.get("signed_up");
                signedUpMap.put(activityId, signedUp != null ? signedUp : false);
            }
        }
        
        // 组装 DTO
        List<ActivityListItemDTO> items = rows.stream()
            .map(row -> mapToActivityListItem(row, userStateMap, signedUpMap))
            .collect(Collectors.toList());
        
        return PageResponse.of(items, total, validPage, validSize);
    }
    
    /**
     * 查询活动详情
     */
    @Transactional(readOnly = true)
    public ActivityDetailDTO getActivityDetail(UUID activityId) {
        Map<String, Object> row = activityQueryMapper.selectActivityDetail(activityId);
        
        if (row == null) {
            throw new BizException(40041, "活动不存在");
        }
        
        ActivityDetailDTO dto = mapToActivityDetail(row);
        
        // 获取当前用户 ID（如果已登录）
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        
        // 如果已登录，查询用户状态
        if (currentUserId != null) {
            Map<String, Object> userState = activityQueryMapper.selectUserState(currentUserId, activityId);
            if (userState != null) {
                UserState us = new UserState();
                us.setLiked((Boolean) userState.get("liked"));
                us.setFavorited((Boolean) userState.get("favorited"));
                us.setDownvoted((Boolean) userState.get("downvoted"));
                dto.setUserState(us);
                Boolean signedUp = (Boolean) userState.get("signed_up");
                dto.setSignedUp(signedUp != null ? signedUp : false);
            }
        }
        
        // 如果是 HOSTED 类型（sourceType=2），查询场次信息
        Integer sourceType = (Integer) row.get("source_type");
        if (sourceType != null && sourceType == 2) {
            List<Map<String, Object>> sessionRows = activityQueryMapper.selectActivitySessions(activityId);
            List<ActivitySessionDTO> sessions = sessionRows.stream()
                .map(this::mapToActivitySession)
                .collect(Collectors.toList());
            dto.setSessions(sessions);
        }
        
        return dto;
    }
    
    /**
     * 查询活动场次列表
     */
    @Transactional(readOnly = true)
    public List<ActivitySessionDTO> getActivitySessions(UUID activityId) {
        List<Map<String, Object>> sessionRows = activityQueryMapper.selectActivitySessions(activityId);
        return sessionRows.stream()
            .map(this::mapToActivitySession)
            .collect(Collectors.toList());
    }
    
    /**
     * Get activity summary for a month
     */
    @Transactional(readOnly = true)
    public com.youthloop.query.dto.ActivitySummaryDTO getActivitySummary(String month, UUID currentUserId) {
        try {
            java.time.YearMonth ym = java.time.YearMonth.parse(month);
            java.time.LocalDateTime start = ym.atDay(1).atStartOfDay();
            java.time.LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();

            int activities = activityQueryMapper.selectMonthlyActivityCount(start, end);
            int participants = activityQueryMapper.selectMonthlyParticipantCount(start, end);
            Integer myReg = null;
            if (currentUserId != null) {
                myReg = activityQueryMapper.selectMyMonthlyRegistrationCount(start, end, currentUserId);
            }

            com.youthloop.query.dto.ActivitySummaryDTO dto = new com.youthloop.query.dto.ActivitySummaryDTO();
            dto.setMonth(month);
            dto.setMonthlyActivityCount(activities);
            dto.setMonthlyParticipantCount(participants);
            dto.setMyRegistrationCount(myReg);
            return dto;
        } catch (Exception e) {
            log.error("Failed to get activity summary for month: {}", month, e);
            throw new BizException(400, "Invalid month format or data error");
        }
    }

    /**
     * Get popular activity categories
     */
    @Transactional(readOnly = true)
    public PageResponse<com.youthloop.query.dto.ActivityCategoryCountDTO> getPopularActivityCategories(String month, Integer page, Integer size) {
        try {
            // 参数校验与默认值
            int validPage = Math.max(1, page);
            int validSize = Math.min(100, Math.max(1, size));
            int offset = (validPage - 1) * validSize;
            
            java.time.YearMonth ym = java.time.YearMonth.parse(month);
            java.time.LocalDateTime start = ym.atDay(1).atStartOfDay();
            java.time.LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();
            
            // 查询总数
            Long total = activityQueryMapper.countPopularCategories(start, end);
            
            if (total == 0) {
                return PageResponse.of(Collections.emptyList(), total, validPage, validSize);
            }
            
            // 查询分页数据
            List<com.youthloop.query.dto.ActivityCategoryCountDTO> items = 
                activityQueryMapper.selectPopularCategories(start, end, offset, validSize);
            
            return PageResponse.of(items, total, validPage, validSize);
        } catch (Exception e) {
            log.error("Failed to get popular categories for month: {}", month, e);
            throw new BizException(400, "Invalid month format");
        }
    }
    
    // === 私有映射方法 ===
    
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

    private ActivityListItemDTO mapToActivityListItem(Map<String, Object> row, Map<UUID, UserState> userStateMap, Map<UUID, Boolean> signedUpMap) {
        ActivityListItemDTO dto = new ActivityListItemDTO();
        dto.setId(UUID.fromString(row.get("id").toString()));
        dto.setSourceType((Integer) row.get("source_type"));
        dto.setTitle((String) row.get("title"));
        dto.setCategory((Integer) row.get("category"));
        dto.setTopic((String) row.get("topic"));
        dto.setStartTime(toLocalDateTime(row.get("start_time")));
        dto.setEndTime(toLocalDateTime(row.get("end_time")));
        dto.setLocation((String) row.get("location"));
        dto.setStatus((Integer) row.get("status"));
        dto.setCreatedAt(toLocalDateTime(row.get("created_at")));
        
        // 海报（取第一张）- 正确解析JSONB
        Object posterUrls = row.get("poster_urls");
        if (posterUrls != null) {
            try {
                List<String> urls = objectMapper.readValue(posterUrls.toString(), new TypeReference<List<String>>() {});
                if (!urls.isEmpty()) {
                    dto.setPosterUrl(urls.get(0));
                }
            } catch (Exception e) {
                log.warn("解析poster_urls失败: activityId={}, error={}", dto.getId(), e.getMessage());
            }
        }
        
        // 统计信息
        dto.setSignupCount(row.get("signup_count") != null ? ((Number) row.get("signup_count")).intValue() : 0);
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        
        // 用户状态
        UserState userState = userStateMap.get(dto.getId());
        if (userState != null) {
            dto.setUserState(userState);
            dto.setSignedUp(signedUpMap.getOrDefault(dto.getId(), false));
        }
        
        return dto;
    }
    
    private ActivityDetailDTO mapToActivityDetail(Map<String, Object> row) {
        ActivityDetailDTO dto = new ActivityDetailDTO();
        dto.setId(UUID.fromString(row.get("id").toString()));
        dto.setSourceType((Integer) row.get("source_type"));
        dto.setTitle((String) row.get("title"));
        dto.setCategory((Integer) row.get("category"));
        dto.setTopic((String) row.get("topic"));
        dto.setDescription((String) row.get("description"));
        dto.setStartTime(toLocalDateTime(row.get("start_time")));
        dto.setEndTime(toLocalDateTime(row.get("end_time")));
        dto.setLocation((String) row.get("location"));
        dto.setSignupPolicy((Integer) row.get("signup_policy"));
        dto.setStatus((Integer) row.get("status"));
        dto.setSourceUrl((String) row.get("source_url"));
        dto.setCreatedAt(toLocalDateTime(row.get("created_at")));
        dto.setUpdatedAt(toLocalDateTime(row.get("updated_at")));
        
        // 海报列表 - 正确解析JSONB
        Object posterUrls = row.get("poster_urls");
        if (posterUrls != null) {
            try {
                List<String> urls = objectMapper.readValue(posterUrls.toString(), new TypeReference<List<String>>() {});
                dto.setPosterUrls(urls);
            } catch (Exception e) {
                log.warn("解析poster_urls失败: activityId={}, error={}", dto.getId(), e.getMessage());
                dto.setPosterUrls(Collections.emptyList());
            }
        } else {
            dto.setPosterUrls(Collections.emptyList());
        }
        
        // 统计信息
        dto.setSignupCount(row.get("signup_count") != null ? ((Number) row.get("signup_count")).intValue() : 0);
        dto.setLikeCount(row.get("like_count") != null ? ((Number) row.get("like_count")).intValue() : 0);
        dto.setFavCount(row.get("fav_count") != null ? ((Number) row.get("fav_count")).intValue() : 0);
        dto.setCommentCount(row.get("comment_count") != null ? ((Number) row.get("comment_count")).intValue() : 0);
        
        return dto;
    }
    
    private ActivitySessionDTO mapToActivitySession(Map<String, Object> row) {
        ActivitySessionDTO dto = new ActivitySessionDTO();
        dto.setId(UUID.fromString(row.get("id").toString()));
        dto.setActivityId(UUID.fromString(row.get("activity_id").toString()));
        dto.setSessionName((String) row.get("session_name"));
        dto.setStartTime(toLocalDateTime(row.get("start_time")));
        dto.setEndTime(toLocalDateTime(row.get("end_time")));
        dto.setLocation((String) row.get("location"));
        dto.setCapacity((Integer) row.get("capacity"));
        dto.setSignupCount(row.get("signup_count") != null ? ((Number) row.get("signup_count")).intValue() : 0);
        dto.setStatus((Integer) row.get("status"));
        return dto;
    }
}
