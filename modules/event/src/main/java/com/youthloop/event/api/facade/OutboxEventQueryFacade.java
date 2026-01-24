package com.youthloop.event.api.facade;

import com.youthloop.event.api.dto.OutboxEventDTO;

import java.util.List;

/**
 * Outbox 事件查询门面（供 Worker 调用）
 */
public interface OutboxEventQueryFacade {
    
    /**
     * 查询待处理的事件
     * 
     * @param limit 限制数量
     * @return 待处理事件列表
     */
    List<OutboxEventDTO> getPendingEvents(int limit);
}
