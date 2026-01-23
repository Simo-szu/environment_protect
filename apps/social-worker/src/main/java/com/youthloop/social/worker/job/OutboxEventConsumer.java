package com.youthloop.social.worker.job;

import com.youthloop.event.application.service.OutboxEventService;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Outbox 事件消费者
 * 
 * 使用 DB 轮询方式消费 outbox_event 表中的待处理事件
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxEventConsumer {
    
    private final OutboxEventService outboxEventService;
    
    private static final int BATCH_SIZE = 10;
    private static final int MAX_RETRY_COUNT = 5;
    
    /**
     * 每 5 秒轮询一次待处理事件
     */
    @Scheduled(fixedDelay = 5000, initialDelay = 3000)
    public void consumeEvents() {
        try {
            List<OutboxEventEntity> events = outboxEventService.getPendingEvents(BATCH_SIZE);
            
            if (events.isEmpty()) {
                return;
            }
            
            log.info("获取到 {} 个待处理事件", events.size());
            
            for (OutboxEventEntity event : events) {
                processEvent(event);
            }
            
        } catch (Exception e) {
            log.error("消费 Outbox 事件失败", e);
        }
    }
    
    /**
     * 处理单个事件
     */
    private void processEvent(OutboxEventEntity event) {
        try {
            log.info("开始处理事件: id={}, type={}, retryCount={}", 
                event.getId(), event.getEventType(), event.getRetryCount());
            
            // 标记为处理中
            outboxEventService.markProcessing(event.getId());
            
            // 根据事件类型分发处理
            switch (event.getEventType()) {
                case "CONTENT_CREATED":
                    handleContentCreated(event);
                    break;
                case "CONTENT_UPDATED":
                    handleContentUpdated(event);
                    break;
                default:
                    log.warn("未知的事件类型: {}", event.getEventType());
            }
            
            // 标记为完成
            outboxEventService.markDone(event.getId());
            log.info("事件处理成功: id={}, type={}", event.getId(), event.getEventType());
            
        } catch (Exception e) {
            log.error("处理事件失败: id={}, type={}", event.getId(), event.getEventType(), e);
            
            int newRetryCount = event.getRetryCount() + 1;
            
            if (newRetryCount >= MAX_RETRY_COUNT) {
                // 超过最大重试次数，标记为死信
                outboxEventService.markDead(event.getId(), e.getMessage());
                log.error("事件已标记为死信: id={}, retryCount={}", event.getId(), newRetryCount);
            } else {
                // 标记为失败，等待重试
                outboxEventService.markFailed(event.getId(), newRetryCount, e.getMessage());
                log.warn("事件将重试: id={}, retryCount={}", event.getId(), newRetryCount);
            }
        }
    }
    
    /**
     * 处理内容创建事件
     */
    private void handleContentCreated(OutboxEventEntity event) {
        log.info("处理内容创建事件: payload={}", event.getPayload());
        
        // TODO: 实现业务逻辑
        // 例如：
        // 1. 更新搜索索引
        // 2. 发送通知
        // 3. 更新推荐系统
        // 4. 统计分析
        
        // 当前仅记录日志
        log.info("内容创建事件处理完成");
    }
    
    /**
     * 处理内容更新事件
     */
    private void handleContentUpdated(OutboxEventEntity event) {
        log.info("处理内容更新事件: payload={}", event.getPayload());
        
        // TODO: 实现业务逻辑
        
        log.info("内容更新事件处理完成");
    }
}
