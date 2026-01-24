package com.youthloop.notification.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.notification.persistence.entity.NotificationEntity;
import com.youthloop.notification.persistence.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 通知命令服务（写操作）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationCommandService {
    
    private final NotificationMapper notificationMapper;
    
    /**
     * 创建通知（内部使用，由 Worker 或其他服务调用）
     */
    @Transactional
    public UUID createNotification(
        UUID userId,
        Integer type,
        UUID actorUserId,
        Integer targetType,
        UUID targetId,
        UUID commentId,
        UUID rootCommentId,
        String meta
    ) {
        NotificationEntity notification = new NotificationEntity();
        notification.setId(UUID.randomUUID());
        notification.setUserId(userId);
        notification.setType(type);
        notification.setActorUserId(actorUserId);
        notification.setTargetType(targetType);
        notification.setTargetId(targetId);
        notification.setCommentId(commentId);
        notification.setRootCommentId(rootCommentId);
        notification.setMeta(meta);
        notification.setCreatedAt(LocalDateTime.now());
        
        int rows = notificationMapper.insert(notification);
        if (rows == 0) {
            throw new BizException(500, "创建通知失败");
        }
        
        log.info("通知创建成功: id={}, userId={}, type={}", 
            notification.getId(), userId, type);
        
        return notification.getId();
    }
    
    /**
     * 标记通知为已读
     */
    @Transactional
    public void markAsRead(UUID notificationId) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        // 权限检查：查询通知并确保属于当前用户
        NotificationEntity notification = notificationMapper.selectById(notificationId);
        if (notification == null) {
            throw new BizException(60041, "通知不存在");
        }
        
        if (!notification.getUserId().equals(currentUserId)) {
            throw new BizException(ErrorCode.FORBIDDEN, "无权操作此通知");
        }
        
        int rows = notificationMapper.markAsRead(notificationId);
        if (rows == 0) {
            log.warn("标记通知已读失败（可能已读或不存在）: id={}", notificationId);
        } else {
            log.info("通知已标记为已读: id={}, userId={}", notificationId, currentUserId);
        }
    }
    
    /**
     * 标记所有通知为已读
     */
    @Transactional
    public void markAllAsRead() {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        int rows = notificationMapper.markAllAsRead(currentUserId);
        log.info("批量标记通知已读: userId={}, count={}", currentUserId, rows);
    }
}
