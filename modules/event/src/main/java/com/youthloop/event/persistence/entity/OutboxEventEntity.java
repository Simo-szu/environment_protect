package com.youthloop.event.persistence.entity;

import com.youthloop.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Outbox 事件实体（对应 social.outbox_event 表）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class OutboxEventEntity extends BaseEntity {
    
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
}
