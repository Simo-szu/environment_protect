package com.youthloop.social.worker.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.activity.application.service.ActivityStatsUpdateService;
import com.youthloop.content.application.service.ContentStatsUpdateService;
import com.youthloop.event.domain.EventType;
import com.youthloop.event.domain.payload.CommentCreatedPayload;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
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
    // TODO: 添加 NotificationService
    
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
        
        // TODO: 如果是回复，创建通知
        if (payload.getParentId() != null) {
            log.info("创建回复通知（待实现）: parentId={}", payload.getParentId());
        }
        
        log.info("评论创建事件处理完成: commentId={}", payload.getCommentId());
    }
    
    @Override
    public String supportedEventType() {
        return EventType.COMMENT_CREATED;
    }
}
