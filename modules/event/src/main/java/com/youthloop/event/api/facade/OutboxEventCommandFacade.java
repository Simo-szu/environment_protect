package com.youthloop.event.api.facade;

import java.util.UUID;

/**
 * Outbox 事件命令门面（供 Worker 调用）
 */
public interface OutboxEventCommandFacade {
    
    /**
     * 标记事件为处理中
     */
    void markProcessing(UUID eventId);
    
    /**
     * 标记事件为完成
     */
    void markDone(UUID eventId);
    
    /**
     * 标记事件为失败（等待重试）
     */
    void markFailed(UUID eventId, int retryCount, String errorMessage);
    
    /**
     * 标记事件为死信
     */
    void markDead(UUID eventId, String errorMessage);
}
