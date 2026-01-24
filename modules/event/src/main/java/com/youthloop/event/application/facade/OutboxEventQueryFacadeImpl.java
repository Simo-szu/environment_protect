package com.youthloop.event.application.facade;

import com.youthloop.event.api.dto.OutboxEventDTO;
import com.youthloop.event.api.facade.OutboxEventQueryFacade;
import com.youthloop.event.application.service.OutboxEventService;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Outbox 事件查询门面实现
 */
@Service
@RequiredArgsConstructor
public class OutboxEventQueryFacadeImpl implements OutboxEventQueryFacade {
    
    private final OutboxEventService outboxEventService;
    
    @Override
    public List<OutboxEventDTO> getPendingEvents(int limit) {
        List<OutboxEventEntity> entities = outboxEventService.getPendingEvents(limit);
        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    private OutboxEventDTO toDTO(OutboxEventEntity entity) {
        OutboxEventDTO dto = new OutboxEventDTO();
        dto.setId(entity.getId());
        dto.setEventType(entity.getEventType());
        dto.setPayload(entity.getPayload());
        dto.setStatus(entity.getStatus());
        dto.setRetryCount(entity.getRetryCount());
        dto.setNextRetryAt(entity.getNextRetryAt());
        dto.setLastError(entity.getLastError());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
