package com.youthloop.activity.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.activity.api.dto.CreateActivitySessionRequest;
import com.youthloop.activity.api.dto.CreateHostActivityRequest;
import com.youthloop.activity.api.dto.UpdateHostActivityRequest;
import com.youthloop.activity.persistence.entity.ActivityEntity;
import com.youthloop.activity.persistence.entity.ActivitySessionEntity;
import com.youthloop.activity.persistence.entity.ActivityStatsEntity;
import com.youthloop.activity.persistence.mapper.ActivityMapper;
import com.youthloop.activity.persistence.mapper.ActivitySessionMapper;
import com.youthloop.activity.persistence.mapper.ActivityStatsMapper;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.event.application.service.OutboxEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 活动命令服务（写入）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityCommandService {
    
    private final ActivityMapper activityMapper;
    private final ActivityStatsMapper activityStatsMapper;
    private final ActivitySessionMapper activitySessionMapper;
    private final OutboxEventService outboxEventService;
    private final ObjectMapper objectMapper;
    
    /**
     * 主办方创建活动
     */
    @Transactional
    public UUID createHostActivity(CreateHostActivityRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        log.info("主办方创建活动: userId={}, title={}", currentUserId, request.getTitle());
        
        // 权限检查：必须是主办方或管理员
        if (!SecurityUtil.isHost() && !SecurityUtil.isAdmin()) {
            throw new BizException(ErrorCode.FORBIDDEN, "只有主办方或管理员可以创建活动");
        }
        
        // 构建活动实体
        ActivityEntity entity = new ActivityEntity();
        entity.setId(UUID.randomUUID());
        entity.setSourceType(2); // HOSTED
        entity.setTitle(request.getTitle());
        entity.setCategory(request.getCategory());
        entity.setTopic(request.getTopic());
        entity.setSignupPolicy(request.getSignupPolicy());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setLocation(request.getLocation());
        entity.setDescription(request.getDescription());
        entity.setHostUserId(currentUserId);
        entity.setStatus(1); // 默认已发布
        
        // 处理海报 URL 列表
        if (request.getPosterUrls() != null && !request.getPosterUrls().isEmpty()) {
            try {
                entity.setPosterUrls(objectMapper.writeValueAsString(request.getPosterUrls()));
            } catch (JsonProcessingException e) {
                log.error("序列化海报 URL 失败", e);
                throw new BizException(ErrorCode.SYSTEM_ERROR, "序列化海报 URL 失败");
            }
        }
        
        LocalDateTime now = LocalDateTime.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        
        // 插入活动
        int rows = activityMapper.insert(entity);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "创建活动失败");
        }
        
        // 同步创建统计记录
        ActivityStatsEntity stats = new ActivityStatsEntity();
        stats.setActivityId(entity.getId());
        stats.setLikeCount(0);
        stats.setFavCount(0);
        stats.setDownCount(0);
        stats.setCommentCount(0);
        stats.setHotScore(0L);
        stats.setUpdatedAt(now);
        
        activityStatsMapper.insert(stats);
        
        // 发布 Outbox 事件
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("activityId", entity.getId().toString());
        eventPayload.put("title", entity.getTitle());
        eventPayload.put("hostUserId", currentUserId.toString());
        outboxEventService.publishEvent("ACTIVITY_CREATED", eventPayload);
        
        log.info("主办方活动创建成功: id={}", entity.getId());
        return entity.getId();
    }
    
    /**
     * 主办方更新活动
     */
    @Transactional
    public void updateHostActivity(UUID activityId, UpdateHostActivityRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        log.info("主办方更新活动: userId={}, activityId={}", currentUserId, activityId);
        
        // 查询现有活动
        ActivityEntity existing = activityMapper.selectById(activityId);
        if (existing == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "活动不存在");
        }
        
        // 权限检查：只有主办方本人或管理员可以编辑
        if (!existing.getHostUserId().equals(currentUserId) && !SecurityUtil.isAdmin()) {
            throw new BizException(ErrorCode.FORBIDDEN, "无权编辑此活动");
        }
        
        // 更新字段
        ActivityEntity entity = new ActivityEntity();
        entity.setId(activityId);
        
        if (request.getTitle() != null) {
            entity.setTitle(request.getTitle());
        }
        if (request.getCategory() != null) {
            entity.setCategory(request.getCategory());
        }
        if (request.getTopic() != null) {
            entity.setTopic(request.getTopic());
        }
        if (request.getSignupPolicy() != null) {
            entity.setSignupPolicy(request.getSignupPolicy());
        }
        if (request.getStartTime() != null) {
            entity.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            entity.setEndTime(request.getEndTime());
        }
        if (request.getLocation() != null) {
            entity.setLocation(request.getLocation());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        
        // 处理海报 URL 列表
        if (request.getPosterUrls() != null) {
            try {
                entity.setPosterUrls(objectMapper.writeValueAsString(request.getPosterUrls()));
            } catch (JsonProcessingException e) {
                log.error("序列化海报 URL 失败", e);
                throw new BizException(ErrorCode.SYSTEM_ERROR, "序列化海报 URL 失败");
            }
        }
        
        entity.setUpdatedAt(LocalDateTime.now());
        
        int rows = activityMapper.update(entity);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "更新活动失败");
        }
        
        // 发布 Outbox 事件
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("activityId", activityId.toString());
        if (request.getStatus() != null) {
            eventPayload.put("status", request.getStatus());
        }
        outboxEventService.publishEvent("ACTIVITY_UPDATED", eventPayload);
        
        log.info("主办方活动更新成功: id={}", activityId);
    }
    
    /**
     * 批量创建/更新场次
     */
    @Transactional
    public void createOrUpdateSessions(UUID activityId, List<CreateActivitySessionRequest> sessions) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        log.info("批量创建/更新场次: userId={}, activityId={}, count={}", 
            currentUserId, activityId, sessions.size());
        
        // 查询活动
        ActivityEntity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "活动不存在");
        }
        
        // 权限检查
        if (!activity.getHostUserId().equals(currentUserId) && !SecurityUtil.isAdmin()) {
            throw new BizException(ErrorCode.FORBIDDEN, "无权管理此活动的场次");
        }
        
        // 检查活动类型
        if (activity.getSourceType() != 2) {
            throw new BizException(40011, "只有主办方活动才能创建场次");
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        for (CreateActivitySessionRequest sessionReq : sessions) {
            if (sessionReq.getId() != null) {
                // 更新现有场次
                ActivitySessionEntity existing = activitySessionMapper.selectById(sessionReq.getId());
                if (existing == null || !existing.getActivityId().equals(activityId)) {
                    throw new BizException(40041, "场次不存在或不属于此活动");
                }
                
                ActivitySessionEntity entity = new ActivitySessionEntity();
                entity.setId(sessionReq.getId());
                entity.setTitle(sessionReq.getTitle());
                entity.setStartTime(sessionReq.getStartTime());
                entity.setEndTime(sessionReq.getEndTime());
                entity.setCapacity(sessionReq.getCapacity());
                entity.setStatus(sessionReq.getStatus() != null ? sessionReq.getStatus() : 1);
                entity.setUpdatedAt(now);
                
                activitySessionMapper.update(entity);
                log.info("场次更新成功: sessionId={}", sessionReq.getId());
            } else {
                // 创建新场次
                ActivitySessionEntity entity = new ActivitySessionEntity();
                entity.setId(UUID.randomUUID());
                entity.setActivityId(activityId);
                entity.setTitle(sessionReq.getTitle());
                entity.setStartTime(sessionReq.getStartTime());
                entity.setEndTime(sessionReq.getEndTime());
                entity.setCapacity(sessionReq.getCapacity());
                entity.setStatus(sessionReq.getStatus() != null ? sessionReq.getStatus() : 1);
                entity.setCreatedAt(now);
                entity.setUpdatedAt(now);
                
                activitySessionMapper.insert(entity);
                log.info("场次创建成功: sessionId={}", entity.getId());
            }
        }
    }
}
