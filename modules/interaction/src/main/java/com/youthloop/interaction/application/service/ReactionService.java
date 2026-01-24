package com.youthloop.interaction.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.event.application.service.OutboxEventService;
import com.youthloop.interaction.api.dto.ToggleReactionRequest;
import com.youthloop.interaction.persistence.entity.ReactionEntity;
import com.youthloop.interaction.persistence.mapper.ReactionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 反应服务（点赞/收藏/踩）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReactionService {
    
    private final ReactionMapper reactionMapper;
    private final OutboxEventService outboxEventService;
    
    /**
     * 创建反应（幂等）
     */
    @Transactional
    public void createReaction(ToggleReactionRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        log.info("创建反应: userId={}, targetType={}, targetId={}, reactionType={}", 
            userId, request.getTargetType(), request.getTargetId(), request.getReactionType());
        
        // 查询是否已存在
        ReactionEntity existing = reactionMapper.selectByUserAndTarget(
            userId, 
            request.getTargetType(), 
            request.getTargetId(), 
            request.getReactionType()
        );
        
        if (existing != null) {
            log.info("反应已存在，幂等返回: id={}", existing.getId());
            return; // 幂等
        }
        
        // 创建反应
        ReactionEntity reaction = new ReactionEntity();
        reaction.setId(UUID.randomUUID());
        reaction.setUserId(userId);
        reaction.setTargetType(request.getTargetType());
        reaction.setTargetId(request.getTargetId());
        reaction.setReactionType(request.getReactionType());
        reaction.setCreatedAt(LocalDateTime.now());
        
        int rows = reactionMapper.insert(reaction);
        if (rows == 0) {
            log.warn("插入反应失败（可能已存在）: userId={}, targetType={}, targetId={}", 
                userId, request.getTargetType(), request.getTargetId());
            return; // 幂等
        }
        
        log.info("添加反应成功: id={}", reaction.getId());
        
        // 发布 Outbox 事件（用于更新统计）
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("userId", userId.toString());
        eventPayload.put("targetType", request.getTargetType());
        eventPayload.put("targetId", request.getTargetId().toString());
        eventPayload.put("reactionType", request.getReactionType());
        eventPayload.put("action", "add");
        
        outboxEventService.publishEvent("REACTION_CHANGED", eventPayload);
    }
    
    /**
     * 删除反应（幂等）
     */
    @Transactional
    public void deleteReaction(ToggleReactionRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        log.info("删除反应: userId={}, targetType={}, targetId={}, reactionType={}", 
            userId, request.getTargetType(), request.getTargetId(), request.getReactionType());
        
        // 查询是否存在
        ReactionEntity existing = reactionMapper.selectByUserAndTarget(
            userId, 
            request.getTargetType(), 
            request.getTargetId(), 
            request.getReactionType()
        );
        
        if (existing == null) {
            log.info("反应不存在，幂等返回");
            return; // 幂等
        }
        
        // 删除反应
        int rows = reactionMapper.deleteById(existing.getId());
        if (rows == 0) {
            log.warn("删除反应失败: id={}", existing.getId());
            return; // 幂等
        }
        
        log.info("删除反应成功: id={}", existing.getId());
        
        // 发布 Outbox 事件（用于更新统计）
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("userId", userId.toString());
        eventPayload.put("targetType", request.getTargetType());
        eventPayload.put("targetId", request.getTargetId().toString());
        eventPayload.put("reactionType", request.getReactionType());
        eventPayload.put("action", "remove");
        
        outboxEventService.publishEvent("REACTION_CHANGED", eventPayload);
    }
}
