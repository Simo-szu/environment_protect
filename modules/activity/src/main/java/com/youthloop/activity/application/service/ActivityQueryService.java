package com.youthloop.activity.application.service;

import com.youthloop.activity.api.dto.ActivitySignupListItemDTO;
import com.youthloop.activity.persistence.mapper.ActivityMapper;
import com.youthloop.activity.persistence.mapper.ActivitySignupMapper;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
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
 * 活动查询服务（主办方视角）
 */
@Slf4j
@Service("activityBasicQueryService")
@RequiredArgsConstructor
public class ActivityQueryService {
    
    private final ActivityMapper activityMapper;
    private final ActivitySignupMapper activitySignupMapper;
    
    /**
     * 查询我发布的活动列表
     */
    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getMyHostActivities(Integer page, Integer size) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        log.info("查询我发布的活动: userId={}", currentUserId);
        
        // 参数校验
        int validPage = Math.max(1, page != null ? page : 1);
        int validSize = Math.min(100, Math.max(1, size != null ? size : 10));
        int offset = (validPage - 1) * validSize;
        
        // 查询总数
        Long total = activityMapper.countHostActivities(currentUserId);
        
        if (total == 0) {
            return PageResponse.of(Collections.emptyList(), total, validPage, validSize);
        }
        
        // 查询列表
        List<Map<String, Object>> activities = activityMapper.selectHostActivities(
            currentUserId, offset, validSize
        );
        
        return PageResponse.of(activities, total, validPage, validSize);
    }
    
    /**
     * 查询活动的报名列表（主办方查看）
     */
    @Transactional(readOnly = true)
    public PageResponse<ActivitySignupListItemDTO> getActivitySignupList(
        UUID activityId, Integer status, Integer page, Integer size
    ) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        log.info("查询活动报名列表: userId={}, activityId={}", currentUserId, activityId);
        
        // 权限检查：只有主办方本人或管理员可以查看
        var activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "活动不存在");
        }
        
        if (!activity.getHostUserId().equals(currentUserId) && !SecurityUtil.isAdmin()) {
            throw new BizException(ErrorCode.FORBIDDEN, "无权查看此活动的报名列表");
        }
        
        // 参数校验
        int validPage = Math.max(1, page != null ? page : 1);
        int validSize = Math.min(100, Math.max(1, size != null ? size : 20));
        int offset = (validPage - 1) * validSize;
        
        // 查询总数
        Long total = activitySignupMapper.countSignups(activityId, status);
        
        if (total == 0) {
            return PageResponse.of(Collections.emptyList(), total, validPage, validSize);
        }
        
        // 查询列表
        List<Map<String, Object>> rows = activitySignupMapper.selectSignupList(
            activityId, status, offset, validSize
        );
        
        // 转换为 DTO
        List<ActivitySignupListItemDTO> items = rows.stream()
            .map(this::mapToSignupListItem)
            .collect(Collectors.toList());
        
        return PageResponse.of(items, total, validPage, validSize);
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

    private ActivitySignupListItemDTO mapToSignupListItem(Map<String, Object> row) {
        ActivitySignupListItemDTO dto = new ActivitySignupListItemDTO();
        dto.setId((UUID) row.get("id"));
        dto.setSessionId((UUID) row.get("sessionId"));
        dto.setSessionTitle((String) row.get("sessionTitle"));
        dto.setUserId((UUID) row.get("userId"));
        dto.setEmail((String) row.get("email"));
        dto.setNickname((String) row.get("nickname"));
        dto.setRealName((String) row.get("realName"));
        dto.setPhone((String) row.get("phone"));
        dto.setJoinTime(toLocalDateTime(row.get("joinTime")));
        dto.setStatus((Integer) row.get("status"));
        dto.setAuditedBy((UUID) row.get("auditedBy"));
        dto.setAuditedAt(toLocalDateTime(row.get("auditedAt")));
        dto.setAuditNote((String) row.get("auditNote"));
        dto.setCanceledAt(toLocalDateTime(row.get("canceledAt")));
        dto.setCancelNote((String) row.get("cancelNote"));
        dto.setCreatedAt(toLocalDateTime(row.get("createdAt")));
        return dto;
    }
}
