package com.youthloop.query.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.query.dto.NotificationItemDTO;
import com.youthloop.query.dto.MyActivityItemDTO;
import com.youthloop.query.dto.ReactionItemDTO;
import com.youthloop.query.mapper.MeQueryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 我的查询服务（只读）
 * 包含：我的收藏/点赞、我的通知
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MeQueryService {
    
    private final MeQueryMapper meQueryMapper;
    private final ObjectMapper objectMapper;
    
    /**
     * 查询我的收藏/点赞列表
     */
    @Transactional(readOnly = true)
    public PageResponse<ReactionItemDTO> getMyReactions(Integer reactionType, Integer targetType, Integer page, Integer size) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            throw new BizException(10031, "未登录");
        }
        
        // 参数校验（null 安全）
        int validPage = Math.max(1, page != null ? page : 1);
        int validSize = Math.min(100, Math.max(1, size != null ? size : 10));
        int offset = (validPage - 1) * validSize;
        
        // 查询总数
        Long total = meQueryMapper.countMyReactions(currentUserId, reactionType, targetType);
        
        if (total == 0) {
            return PageResponse.of(Collections.emptyList(), total, validPage, validSize);
        }
        
        // 查询列表
        List<Map<String, Object>> rows = meQueryMapper.selectMyReactions(
            currentUserId, reactionType, targetType, offset, validSize
        );
        
        // 组装 DTO
        List<ReactionItemDTO> items = rows.stream()
            .map(this::mapToReactionItem)
            .collect(Collectors.toList());
        
        return PageResponse.of(items, total, validPage, validSize);
    }
    
    /**
     * 查询我的通知列表
     */
    @Transactional(readOnly = true)
    public PageResponse<NotificationItemDTO> getMyNotifications(Integer page, Integer size) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            throw new BizException(10031, "未登录");
        }
        
        // 参数校验（null 安全）
        int validPage = Math.max(1, page != null ? page : 1);
        int validSize = Math.min(100, Math.max(1, size != null ? size : 10));
        int offset = (validPage - 1) * validSize;
        
        // 查询总数
        Long total = meQueryMapper.countMyNotifications(currentUserId);
        
        if (total == 0) {
            return PageResponse.of(Collections.emptyList(), total, validPage, validSize);
        }
        
        // 查询列表
        List<Map<String, Object>> rows = meQueryMapper.selectMyNotifications(
            currentUserId, offset, validSize
        );
        
        // 组装 DTO
        List<NotificationItemDTO> items = rows.stream()
            .map(this::mapToNotificationItem)
            .collect(Collectors.toList());
        
        return PageResponse.of(items, total, validPage, validSize);
    }
    
    /**
     * 查询我报名的活动列表
     */
    @Transactional(readOnly = true)
    public PageResponse<MyActivityItemDTO> getMyActivities(Integer status, Integer page, Integer size) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            throw new BizException(10031, "未登录");
        }
        
        // 参数校验（null 安全）
        int validPage = Math.max(1, page != null ? page : 1);
        int validSize = Math.min(100, Math.max(1, size != null ? size : 10));
        int offset = (validPage - 1) * validSize;
        
        // 查询总数
        Long total = meQueryMapper.countMyActivities(currentUserId, status);
        
        if (total == 0) {
            return PageResponse.of(Collections.emptyList(), total, validPage, validSize);
        }
        
        // 查询列表
        List<Map<String, Object>> rows = meQueryMapper.selectMyActivities(
            currentUserId, status, offset, validSize
        );
        
        // 组装 DTO
        List<MyActivityItemDTO> items = rows.stream()
            .map(this::mapToMyActivityItem)
            .collect(Collectors.toList());
        
        return PageResponse.of(items, total, validPage, validSize);
    }
    
    // === 私有映射方法 ===
    
    private ReactionItemDTO mapToReactionItem(Map<String, Object> row) {
        ReactionItemDTO dto = new ReactionItemDTO();
        dto.setId(UUID.fromString(row.get("id").toString()));
        dto.setReactionType((Integer) row.get("reaction_type"));
        dto.setTargetType((Integer) row.get("target_type"));
        dto.setTargetId(UUID.fromString(row.get("target_id").toString()));
        dto.setCreatedAt((LocalDateTime) row.get("created_at"));
        
        // 根据 targetType 填充不同的字段
        Integer targetType = dto.getTargetType();
        if (targetType == 1) {
            // 内容
            dto.setContentTitle((String) row.get("content_title"));
            dto.setContentType((Integer) row.get("content_type"));
            dto.setContentCoverUrl((String) row.get("content_cover_url"));
            dto.setContentSummary((String) row.get("content_summary"));
        } else if (targetType == 2) {
            // 活动
            dto.setActivityTitle((String) row.get("activity_title"));
            dto.setActivityCategory((Integer) row.get("activity_category"));
            dto.setActivityPosterUrl((String) row.get("activity_poster_url"));
            dto.setActivityStartTime(row.get("activity_start_time") != null ? (LocalDateTime) row.get("activity_start_time") : null);
            dto.setActivityLocation((String) row.get("activity_location"));
        }
        
        return dto;
    }
    
    private NotificationItemDTO mapToNotificationItem(Map<String, Object> row) {
        NotificationItemDTO dto = new NotificationItemDTO();
        dto.setId(UUID.fromString(row.get("id").toString()));
        dto.setType((Integer) row.get("type"));
        dto.setIsRead((Boolean) row.get("is_read"));
        dto.setCreatedAt((LocalDateTime) row.get("created_at"));
        
        // 触发者信息
        if (row.get("actor_id") != null) {
            dto.setActorId(UUID.fromString(row.get("actor_id").toString()));
            dto.setActorNickname((String) row.get("actor_nickname"));
            dto.setActorAvatar((String) row.get("actor_avatar"));
        }
        
        // 目标信息
        dto.setTargetType((Integer) row.get("target_type"));
        if (row.get("target_id") != null) {
            dto.setTargetId(UUID.fromString(row.get("target_id").toString()));
        }
        dto.setTargetPreview((String) row.get("target_preview"));
        
        // 评论信息
        if (row.get("comment_id") != null) {
            dto.setCommentId(UUID.fromString(row.get("comment_id").toString()));
            dto.setCommentContent((String) row.get("comment_content"));
        }
        
        return dto;
    }
    
    private MyActivityItemDTO mapToMyActivityItem(Map<String, Object> row) {
        MyActivityItemDTO dto = new MyActivityItemDTO();
        dto.setSignupId(UUID.fromString(row.get("signup_id").toString()));
        dto.setActivityId(UUID.fromString(row.get("activity_id").toString()));
        
        if (row.get("session_id") != null) {
            dto.setSessionId(UUID.fromString(row.get("session_id").toString()));
        }
        
        dto.setSignupStatus((Integer) row.get("signup_status"));
        dto.setSignupAt((LocalDateTime) row.get("signup_at"));
        
        // 活动信息
        dto.setTitle((String) row.get("title"));
        dto.setCategory((Integer) row.get("category"));
        dto.setStartTime(row.get("start_time") != null ? (LocalDateTime) row.get("start_time") : null);
        dto.setEndTime(row.get("end_time") != null ? (LocalDateTime) row.get("end_time") : null);
        dto.setLocation((String) row.get("location"));
        
        // 解析 poster_urls (JSONB) - 正确解析
        if (row.get("poster_urls") != null) {
            try {
                List<String> posterUrls = objectMapper.readValue(
                    row.get("poster_urls").toString(), 
                    new TypeReference<List<String>>() {}
                );
                dto.setPosterUrls(posterUrls);
            } catch (Exception e) {
                log.warn("解析poster_urls失败: activityId={}, error={}", dto.getActivityId(), e.getMessage());
                dto.setPosterUrls(Collections.emptyList());
            }
        } else {
            dto.setPosterUrls(Collections.emptyList());
        }
        
        dto.setActivityStatus((Integer) row.get("activity_status"));
        dto.setSignupCount((Integer) row.get("signup_count"));
        dto.setLikeCount((Integer) row.get("like_count"));
        
        return dto;
    }
}
