package com.youthloop.social.worker.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.content.application.service.ContentStatsUpdateService;
import com.youthloop.event.domain.EventType;
import com.youthloop.event.domain.payload.ReactionChangedPayload;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 反应变化事件处理器（点赞/收藏/踩）
 * 
 * 职责：
 * 1. 更新目标（内容/活动）的统计数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReactionChangedHandler implements EventHandler {
    
    private final ObjectMapper objectMapper;
    private final ContentStatsUpdateService contentStatsUpdateService;
    // TODO: 添加 ActivityStatsUpdateService
    
    @Override
    public void handle(OutboxEventEntity event) throws Exception {
        ReactionChangedPayload payload = objectMapper.readValue(
            event.getPayload(), 
            ReactionChangedPayload.class
        );
        
        log.info("处理反应变化事件: reactionType={}, targetType={}, targetId={}, action={}", 
            payload.getReactionType(), payload.getTargetType(), payload.getTargetId(), payload.getAction());
        
        // 根据目标类型和反应类型更新统计
        if (payload.getTargetType() == 1) {
            // 内容
            updateContentStats(payload);
        } else if (payload.getTargetType() == 2) {
            // 活动
            updateActivityStats(payload);
        }
        
        log.info("反应变化事件处理完成: reactionId={}", payload.getReactionId());
    }
    
    @Override
    public String supportedEventType() {
        return EventType.REACTION_CREATED;
    }
    
    // === 私有方法 ===
    
    private void updateContentStats(ReactionChangedPayload payload) {
        boolean isCreate = (payload.getAction() == 1);
        
        switch (payload.getReactionType()) {
            case 1: // 点赞
                if (isCreate) {
                    contentStatsUpdateService.incrementLikeCount(payload.getTargetId());
                } else {
                    contentStatsUpdateService.decrementLikeCount(payload.getTargetId());
                }
                break;
            case 2: // 收藏
                if (isCreate) {
                    contentStatsUpdateService.incrementFavCount(payload.getTargetId());
                } else {
                    contentStatsUpdateService.decrementFavCount(payload.getTargetId());
                }
                break;
            case 3: // 踩
                if (isCreate) {
                    contentStatsUpdateService.incrementDownCount(payload.getTargetId());
                } else {
                    contentStatsUpdateService.decrementDownCount(payload.getTargetId());
                }
                break;
            default:
                log.warn("未知的反应类型: {}", payload.getReactionType());
        }
    }
    
    private void updateActivityStats(ReactionChangedPayload payload) {
        // TODO: 实现活动统计更新
        log.info("活动统计更新（待实现）: activityId={}, reactionType={}, action={}", 
            payload.getTargetId(), payload.getReactionType(), payload.getAction());
    }
}
