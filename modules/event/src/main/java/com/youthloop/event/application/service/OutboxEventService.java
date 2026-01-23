package com.youthloop.event.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
import com.youthloop.event.persistence.mapper.OutboxEventMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Outbox 事件服务
 * 
 * 注意：写入 outbox 必须在业务事务内（MANDATORY 传播）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxEventService {
    
    private final OutboxEventMapper outboxEventMapper;
    private final ObjectMapper objectMapper;
    
    /**
     * 发布事件（必须在事务内调用）
     * 
     * @param eventType 事件类型
     * @param payload 事件负载对象
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public UUID publishEvent(String eventType, Object payload) {
        log.debug("发布 Outbox 事件: type={}", eventType);
        
        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.error("序列化事件负载失败: type={}", eventType, e);
            throw new BizException(ErrorCode.SYSTEM_ERROR, "序列化事件负载失败");
        }
        
        OutboxEventEntity event = new OutboxEventEntity();
        event.setId(UUID.randomUUID());
        event.setEventType(eventType);
        event.setPayload(payloadJson);
        event.setStatus(1); // pending
        event.setRetryCount(0);
        
        LocalDateTime now = LocalDateTime.now();
        event.setCreatedAt(now);
        event.setUpdatedAt(now);
        
        int rows = outboxEventMapper.insert(event);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "写入 Outbox 事件失败");
        }
        
        log.info("Outbox 事件已发布: id={}, type={}", event.getId(), eventType);
        return event.getId();
    }
    
    /**
     * 查询待处理的事件（Worker 调用）
     */
    @Transactional(readOnly = true)
    public List<OutboxEventEntity> getPendingEvents(int limit) {
        return outboxEventMapper.selectPendingEvents(limit, LocalDateTime.now());
    }
    
    /**
     * 标记事件为处理中
     */
    @Transactional
    public void markProcessing(UUID eventId) {
        outboxEventMapper.updateStatus(
            eventId, 
            2, // processing
            null, 
            null, 
            null, 
            LocalDateTime.now()
        );
    }
    
    /**
     * 标记事件为完成
     */
    @Transactional
    public void markDone(UUID eventId) {
        outboxEventMapper.updateStatus(
            eventId, 
            3, // done
            null, 
            null, 
            null, 
            LocalDateTime.now()
        );
    }
    
    /**
     * 标记事件为失败（需要重试）
     */
    @Transactional
    public void markFailed(UUID eventId, int retryCount, String errorMessage) {
        // 指数退避：1分钟、2分钟、4分钟...
        int delayMinutes = (int) Math.pow(2, retryCount);
        LocalDateTime nextRetry = LocalDateTime.now().plusMinutes(delayMinutes);
        
        outboxEventMapper.updateStatus(
            eventId, 
            1, // 回到 pending
            retryCount, 
            nextRetry, 
            errorMessage, 
            LocalDateTime.now()
        );
    }
    
    /**
     * 标记事件为死信（超过最大重试次数）
     */
    @Transactional
    public void markDead(UUID eventId, String errorMessage) {
        outboxEventMapper.updateStatus(
            eventId, 
            4, // dead
            null, 
            null, 
            errorMessage, 
            LocalDateTime.now()
        );
    }
}
