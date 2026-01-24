package com.youthloop.notification.api.facade;

import com.youthloop.notification.application.service.NotificationCommandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * 通知 Facade（对外统一接口）
 */
@Component
@RequiredArgsConstructor
public class NotificationFacade {
    
    private final NotificationCommandService notificationCommandService;
    
    /**
     * 标记通知为已读
     */
    public void markAsRead(UUID notificationId) {
        notificationCommandService.markAsRead(notificationId);
    }
    
    /**
     * 标记所有通知为已读
     */
    public void markAllAsRead() {
        notificationCommandService.markAllAsRead();
    }
    
    /**
     * 创建通知（内部使用）
     */
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
        return notificationCommandService.createNotification(
            userId, type, actorUserId, targetType, targetId, 
            commentId, rootCommentId, meta
        );
    }
}
