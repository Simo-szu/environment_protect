package com.youthloop.social.worker.job;

import com.youthloop.event.api.dto.OutboxEventDTO;
import com.youthloop.event.api.facade.OutboxEventCommandFacade;
import com.youthloop.event.api.facade.OutboxEventQueryFacade;
import com.youthloop.social.worker.handler.EventHandler;
import com.youthloop.social.worker.handler.SignupEventHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    private final List<EventHandler> eventHandlers;
    
    private static final int BATCH_SIZE = 10;
    private static final int MAX_RETRY_COUNT = 5;
    
    private Map<String, EventHandler> handlerMap;
    
    /**
     * 初始化 Handler 映射
     */
    private Map<String, EventHandler> getHandlerMap() {
        if (handlerMap == null) {
            handlerMap = eventHandlers.stream()
                .collect(Collectors.toMap(
                    EventHandler::supportedEventType,
                    Function.identity()
                ));
            log.info("已注册 {} 个事件处理器: {}", handlerMap.size(), handlerMap.keySet());
        }
        return handlerMap;
    }
    
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
            
            // 查找对应的 Handler（优先精确匹配，然后尝试自定义匹配）
            EventHandler handler = findHandler(event.getEventType());
            
            if (handler == null) {
                log.warn("未找到事件处理器: eventType={}", event.getEventType());
                // 未知事件类型，直接标记为完成（避免一直重试）
                outboxEventCommandFacade.markDone(event.getId());
                return;
            }
            
            // 调用 Handler 处理
            handler.handle(event);
            
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
     * 查找事件处理器（支持精确匹配和自定义匹配）
     */
    private EventHandler findHandler(String eventType) {
        // 1. 优先精确匹配
        EventHandler handler = getHandlerMap().get(eventType);
        if (handler != null) {
            return handler;
        }
        
        // 2. 尝试自定义匹配（例如 SignupEventHandler 支持所有 SIGNUP_ 开头的事件）
        for (EventHandler h : eventHandlers) {
            if (h instanceof SignupEventHandler) {
                SignupEventHandler signupHandler = (SignupEventHandler) h;
                if (signupHandler.supports(eventType)) {
                    return signupHandler;
                }
            }
        }
        
        return null;
    }
}
