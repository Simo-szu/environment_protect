package com.youthloop.notification.application.service;

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
 * 通知服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationMapper notificationMapper;
    
    /**
     * 创建通知（由 Worker 调用）
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
        NotificationEntity entity = new NotificationEntity();
        entity.setId(UUID.randomUUID());
        entity.setUserId(userId);
        entity.setType(type);
        entity.setActorUserId(actorUserId);
        entity.setTargetType(targetType);
        entity.setTargetId(targetId);
        entity.setCommentId(commentId);
        entity.setRootCommentId(rootCommentId);
        entity.setMeta(meta);
        entity.setCreatedAt(LocalDateTime.now());
        
        int rows = notificationMapper.insert(entity);
        if (rows == 0) {
            throw new BizException(60022, "创建通知失败");
        }
        
        log.info("通知创建成功: notificationId={}, userId={}, type={}", 
            entity.getId(), userId, type);
        
        return entity.getId();
    }
    
    /**
     * 标记通知为已读
     */
    @Transactional
    public void markAsRead(UUID notificationId) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        // 权限检查：确保通知属于当前用户
        NotificationEntity notification = notificationMapper.selectById(notificationId);
        if (notification == null) {
            throw new BizException(60041, "通知不存在");
        }
        
        if (!notification.getUserId().equals(currentUserId)) {
            throw new BizException(60032, "无权操作他人的通知");
        }
        
        int rows = notificationMapper.markAsRead(notificationId);
        if (rows == 0) {
            throw new BizException(60022, "标记已读失败");
        }
        
        log.info("通知已读: notificationId={}, userId={}", notificationId, currentUserId);
    }
    
    /**
     * 标记所有通知为已读
     */
    @Transactional
    public void markAllAsRead() {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        int rows = notificationMapper.markAllAsRead(currentUserId);
        
        log.info("所有通知已读: userId={}, count={}", currentUserId, rows);
    }
    
    /**
     * 统计未读通知数
     */
    public Long countUnread() {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        return notificationMapper.countUnreadByUser(currentUserId);
    }
}
