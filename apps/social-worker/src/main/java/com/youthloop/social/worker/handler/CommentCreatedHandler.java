package com.youthloop.social.worker.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.activity.application.service.ActivityStatsUpdateService;
import com.youthloop.content.application.service.ContentStatsUpdateService;
import com.youthloop.event.domain.EventType;
import com.youthloop.event.domain.payload.CommentCreatedPayload;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
import com.youthloop.interaction.persistence.entity.CommentEntity;
import com.youthloop.interaction.persistence.mapper.CommentMapper;
import com.youthloop.notification.application.service.NotificationCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 评论创建事件处理器
 * 
 * 职责：
 * 1. 更新目标（内容/活动）的评论数统计
 * 2. 创建通知（回复我的）
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CommentCreatedHandler implements EventHandler {
    
    private final ObjectMapper objectMapper;
    private final ContentStatsUpdateService contentStatsUpdateService;
    private final ActivityStatsUpdateService activityStatsUpdateService;
    private final NotificationCommandService notificationCommandService;
    private final CommentMapper commentMapper;
    
    @Override
    public void handle(OutboxEventEntity event) throws Exception {
        CommentCreatedPayload payload = objectMapper.readValue(
            event.getPayload(), 
            CommentCreatedPayload.class
        );
        
        log.info("处理评论创建事件: commentId={}, targetType={}, targetId={}", 
            payload.getCommentId(), payload.getTargetType(), payload.getTargetId());
        
        // 更新目标的评论数统计
        if (payload.getTargetType() == 1) {
            // 内容
            contentStatsUpdateService.incrementCommentCount(payload.getTargetId());
        } else if (payload.getTargetType() == 2) {
            // 活动
            activityStatsUpdateService.incrementCommentCount(payload.getTargetId());
        }
        
        // 如果是回复，创建通知
        if (payload.getParentId() != null) {
            createReplyNotification(payload);
        }
        
        log.info("评论创建事件处理完成: commentId={}", payload.getCommentId());
    }
    
    @Override
    public String supportedEventType() {
        return EventType.COMMENT_CREATED;
    }
    
    /**
     * 创建回复通知
     */
    private void createReplyNotification(CommentCreatedPayload payload) {
        try {
            // 查询父评论，获取原作者
            CommentEntity parentComment = commentMapper.selectById(payload.getParentId());
            if (parentComment == null) {
                log.warn("父评论不存在，无法创建通知: parentId={}", payload.getParentId());
                return;
            }
            
            // 不给自己发通知
            if (parentComment.getUserId().equals(payload.getUserId())) {
                log.debug("回复自己的评论，跳过通知: commentId={}", payload.getCommentId());
                return;
            }
            
            // 创建通知
            notificationCommandService.createNotification(
                parentComment.getUserId(),  // 接收者：父评论作者
                1,                           // 通知类型：1=comment_reply
                payload.getUserId(),         // 触发者：当前评论作者
                payload.getTargetType(),     // 目标类型
                payload.getTargetId(),       // 目标 ID
                payload.getCommentId(),      // 新评论 ID
                payload.getRootId(),         // 根评论 ID
                null                         // meta（可选）
            );
            
            log.info("回复通知创建成功: parentCommentId={}, recipientUserId={}, actorUserId={}", 
                payload.getParentId(), parentComment.getUserId(), payload.getUserId());
                
        } catch (Exception e) {
            log.error("创建回复通知失败: parentId={}, error={}", payload.getParentId(), e.getMessage(), e);
            // 不抛出异常，避免影响主流程
        }
    }
}
