package com.youthloop.social.worker.job;

import com.youthloop.event.api.dto.OutboxEventDTO;
import com.youthloop.event.api.facade.OutboxEventCommandFacade;
import com.youthloop.event.api.facade.OutboxEventQueryFacade;
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
    
    private final OutboxEventQueryFacade outboxEventQueryFacade;
    private final OutboxEventCommandFacade outboxEventCommandFacade;
    
    private static final int BATCH_SIZE = 10;
    private static final int MAX_RETRY_COUNT = 5;
    
    /**
     * 每 5 秒轮询一次待处理事件
     */
    @Scheduled(fixedDelay = 5000, initialDelay = 3000)
    public void consumeEvents() {
        try {
            List<OutboxEventDTO> events = outboxEventQueryFacade.getPendingEvents(BATCH_SIZE);
            
            if (events.isEmpty()) {
                return;
            }
            
            log.info("获取到 {} 个待处理事件", events.size());
            
            for (OutboxEventDTO event : events) {
                processEvent(event);
            }
            
        } catch (Exception e) {
            log.error("消费 Outbox 事件失败", e);
        }
    }
    
    /**
     * 处理单个事件
     */
    private void processEvent(OutboxEventDTO event) {
        try {
            log.info("开始处理事件: id={}, type={}, retryCount={}", 
                event.getId(), event.getEventType(), event.getRetryCount());
            
            // 标记为处理中
            outboxEventCommandFacade.markProcessing(event.getId());
            
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
            outboxEventCommandFacade.markDone(event.getId());
            log.info("事件处理成功: id={}, type={}", event.getId(), event.getEventType());
            
        } catch (Exception e) {
            log.error("处理事件失败: id={}, type={}", event.getId(), event.getEventType(), e);
            
            int newRetryCount = event.getRetryCount() + 1;
            
            if (newRetryCount >= MAX_RETRY_COUNT) {
                // 超过最大重试次数，标记为死信
                outboxEventCommandFacade.markDead(event.getId(), e.getMessage());
                log.error("事件已标记为死信: id={}, retryCount={}", event.getId(), newRetryCount);
            } else {
                // 标记为失败，等待重试
                outboxEventCommandFacade.markFailed(event.getId(), newRetryCount, e.getMessage());
                log.warn("事件将重试: id={}, retryCount={}", event.getId(), newRetryCount);
            }
        }
    }
    
    /**
     * 处理内容创建事件
     */
    private void handleContentCreated(OutboxEventDTO event) {
        log.info("处理内容创建事件: payload={}", event.getPayload());
        
        // 解析事件负载
        try {
            // 这里实现真实的业务逻辑链路
            // 1. 更新搜索索引（开发环境暂时用日志模拟）
            log.info("【搜索索引】内容已添加到搜索引擎: {}", event.getPayload());
            
            // 2. 发送通知给关注者（开发环境暂时用日志模拟）
            log.info("【通知服务】已向关注者推送内容创建通知: {}", event.getPayload());
            
            // 3. 更新推荐系统（开发环境暂时用日志模拟）
            log.info("【推荐系统】内容已加入推荐池: {}", event.getPayload());
            
            // 4. 统计分析（开发环境暂时用日志模拟）
            log.info("【数据分析】内容创建事件已记录到分析系统: {}", event.getPayload());
            
            // TODO: 生产环境需要集成真实的搜索引擎（如 Elasticsearch）、消息队列（如 Kafka）等
            
        } catch (Exception e) {
            log.error("解析内容创建事件失败: {}", event.getPayload(), e);
            throw e;
        }
        
        log.info("内容创建事件处理完成");
    }
    
    /**
     * 处理内容更新事件
     */
    private void handleContentUpdated(OutboxEventDTO event) {
        log.info("处理内容更新事件: payload={}", event.getPayload());
        
        // 解析事件负载
        try {
            // 这里实现真实的业务逻辑链路
            // 1. 更新搜索索引（开发环境暂时用日志模拟）
            log.info("【搜索索引】内容索引已更新: {}", event.getPayload());
            
            // 2. 发送通知给关注者（开发环境暂时用日志模拟）
            log.info("【通知服务】已向关注者推送内容更新通知: {}", event.getPayload());
            
            // 3. 更新推荐系统（开发环境暂时用日志模拟）
            log.info("【推荐系统】内容推荐权重已更新: {}", event.getPayload());
            
            // TODO: 生产环境需要集成真实的搜索引擎、消息队列等
            
        } catch (Exception e) {
            log.error("解析内容更新事件失败: {}", event.getPayload(), e);
            throw e;
        }
        
        log.info("内容更新事件处理完成");
    }
}
