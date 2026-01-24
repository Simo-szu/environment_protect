package com.youthloop.event.api.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Outbox 事件 DTO（对外契约）
 */
@Data
public class OutboxEventDTO {
    
    /**
     * 事件 ID
     */
    private UUID id;
    
    /**
     * 事件类型（如 CONTENT_CREATED、CONTENT_UPDATED）
     */
    private String eventType;
    
    /**
     * 事件负载（JSON 格式）
     */
    private String payload;
    
    /**
     * 状态：1=pending 2=processing 3=done 4=dead
     */
    private Integer status;
    
    /**
     * 重试次数
     */
    private Integer retryCount;
    
    /**
     * 下次重试时间
     */
    private LocalDateTime nextRetryAt;
    
    /**
     * 最后错误信息
     */
    private String lastError;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
