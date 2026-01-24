package com.youthloop.social.worker.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.activity.application.service.ActivityStatsUpdateService;
import com.youthloop.content.application.service.ContentStatsUpdateService;
import com.youthloop.event.domain.EventType;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * 评论删除事件处理器
 * 
 * 职责：
 * 1. 更新目标（内容/活动）的评论数统计（减少）
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CommentDeletedHandler implements EventHandler {
    
    private final ObjectMapper objectMapper;
    private final ContentStatsUpdateService contentStatsUpdateService;
    private final ActivityStatsUpdateService activityStatsUpdateService;
    
    @Override
    public void handle(OutboxEventEntity event) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = objectMapper.readValue(
            event.getPayload(), 
            Map.class
        );
        
        Integer targetType = (Integer) payload.get("targetType");
        String targetIdStr = (String) payload.get("targetId");
        UUID targetId = UUID.fromString(targetIdStr);
        
        log.info("处理评论删除事件: targetType={}, targetId={}", targetType, targetId);
        
        // 更新目标的评论数统计（减少）
        if (targetType == 1) {
            // 内容
            contentStatsUpdateService.decrementCommentCount(targetId);
        } else if (targetType == 2) {
            // 活动
            activityStatsUpdateService.decrementCommentCount(targetId);
        }
        
        log.info("评论删除事件处理完成: targetId={}", targetId);
    }
    
    @Override
    public String supportedEventType() {
        return EventType.COMMENT_DELETED;
    }
}
