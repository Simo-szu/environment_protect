package com.youthloop.social.worker.handler;

import com.youthloop.event.api.dto.OutboxEventDTO;

/**
 * 事件处理器接口
 */
public interface EventHandler {
    
    /**
     * 处理事件
     * 
     * @param event Outbox 事件 DTO
     * @throws Exception 处理失败时抛出异常
     */
    void handle(OutboxEventDTO event) throws Exception;
    
    /**
     * 支持的事件类型
     */
    String supportedEventType();
}
