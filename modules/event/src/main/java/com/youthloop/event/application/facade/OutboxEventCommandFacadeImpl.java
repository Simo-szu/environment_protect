package com.youthloop.event.application.facade;

import com.youthloop.event.api.facade.OutboxEventCommandFacade;
import com.youthloop.event.application.service.OutboxEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Outbox 事件命令门面实现
 */
@Service
@RequiredArgsConstructor
public class OutboxEventCommandFacadeImpl implements OutboxEventCommandFacade {
    
    private final OutboxEventService outboxEventService;
    
    @Override
    public void markProcessing(UUID eventId) {
        outboxEventService.markProcessing(eventId);
    }
    
    @Override
    public void markDone(UUID eventId) {
        outboxEventService.markDone(eventId);
    }
    
    @Override
    public void markFailed(UUID eventId, int retryCount, String errorMessage) {
        outboxEventService.markFailed(eventId, retryCount, errorMessage);
    }
    
    @Override
    public void markDead(UUID eventId, String errorMessage) {
        outboxEventService.markDead(eventId, errorMessage);
    }
}
