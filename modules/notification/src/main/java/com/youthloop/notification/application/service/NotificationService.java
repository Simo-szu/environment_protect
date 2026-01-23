package com.youthloop.notification.application.service;

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
     * 创建评论回复通知
     */
    @Transactional
    public void createCommentReplyNotification(
            UUID recipientUserId,
            UUID actorUserId,
            Integer targetType,
            UUID targetId,
            UUID commentId,
            UUID rootCommentId) {
        
        // 不给自己发通知
        if (recipientUserId.equals(actorUserId)) {
            return;
        }
        
        log.info("创建评论回复通知: recipientUserId={}, actorUserId={}, commentId={}", 
            recipientUserId, actorUserId, commentId);
        
        NotificationEntity notification = new NotificationEntity();
        notification.setId(UUID.randomUUID());
        notification.setUserId(recipientUserId);
        notification.setType(1); // comment_reply
        notification.setActorUserId(actorUserId);
        notification.setTargetType(targetType);
        notification.setTargetId(targetId);
        notification.setCommentId(commentId);
        notification.setRootCommentId(rootCommentId);
        notification.setCreatedAt(LocalDateTime.now());
        
        notificationMapper.insert(notification);
        log.info("通知创建成功: id={}", notification.getId());
    }
    
    /**
     * 统计未读通知数
     */
    @Transactional(readOnly = true)
    public Long countUnread(UUID userId) {
        return notificationMapper.countUnreadByUser(userId);
    }
    
    /**
     * 标记所有通知为已读
     */
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationMapper.markAllAsRead(userId);
        log.info("已标记所有通知为已读: userId={}", userId);
    }
}
