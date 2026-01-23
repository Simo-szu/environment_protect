package com.youthloop.event.persistence.mapper;

import com.youthloop.event.persistence.entity.OutboxEventEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Outbox 事件 Mapper
 */
@Mapper
public interface OutboxEventMapper {
    
    /**
     * 插入事件
     */
    int insert(OutboxEventEntity event);
    
    /**
     * 根据 ID 查询事件
     */
    OutboxEventEntity selectById(@Param("id") UUID id);
    
    /**
     * 查询待处理的事件（用于 Worker 消费）
     */
    List<OutboxEventEntity> selectPendingEvents(
        @Param("limit") Integer limit,
        @Param("now") LocalDateTime now
    );
    
    /**
     * 更新事件状态
     */
    int updateStatus(
        @Param("id") UUID id,
        @Param("status") Integer status,
        @Param("retryCount") Integer retryCount,
        @Param("nextRetryAt") LocalDateTime nextRetryAt,
        @Param("lastError") String lastError,
        @Param("updatedAt") LocalDateTime updatedAt
    );
}
