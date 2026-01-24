package com.youthloop.social.worker.consumers;

import com.youthloop.event.application.service.OutboxEventService;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
import com.youthloop.social.worker.handler.EventHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Outbox事件消费者
 * 定时轮询并处理待处理的事件
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxEventConsumer {
    
    private final OutboxEventService outboxEventService;
    private final List<EventHandler> eventHandlers;
    
    private Map<String, EventHandler> handlerMap;
    
    /**
     * 每5秒执行一次
     */
    @Scheduled(fixedDelay = 5000)
    public void consumeEvents() {
        if (handlerMap == null) {
            // 初始化handler映射
            handlerMap = eventHandlers.stream()
                .collect(Collectors.toMap(EventHandler::supportedEventType, Function.identity()));
            log.info("初始化事件处理器: {}", handlerMap.keySet());
        }
        
        try {
            // 获取待处理的事件(批量)
            List<OutboxEventEntity> events = outboxEventService.fetchPendingEvents(10);
            
            if (events.isEmpty()) {
                return;
            }
            
            log.info("获取到 {} 个待处理事件", events.size());
            
            // 逐个处理
            for (OutboxEventEntity event : events) {
                processEvent(event);
            }
            
        } catch (Exception e) {
            log.error("消费事件失败", e);
        }
    }
    
    /**
     * 处理单个事件
     */
    private void processEvent(OutboxEventEntity event) {
        try {
            // 标记为处理中
            outboxEventService.markAsProcessing(event.getId());
            
            // 查找对应的处理器
            EventHandler handler = handlerMap.get(event.getEventType());
            
            if (handler == null) {
                log.warn("未找到事件处理器: eventType={}, eventId={}", event.getEventType(), event.getId());
                outboxEventService.markAsDead(event.getId(), "未找到对应的处理器");
                return;
            }
            
            // 执行处理
            handler.handle(event);
            
            // 标记为完成
            outboxEventService.markAsDone(event.getId());
            
            log.info("事件处理成功: eventId={}, eventType={}", event.getId(), event.getEventType());
            
        } catch (Exception e) {
            log.error("事件处理失败: eventId={}, eventType={}", event.getId(), event.getEventType(), e);
            
            // 标记为失败并重试
            outboxEventService.markAsFailed(event.getId(), e.getMessage());
        }
    }
}
