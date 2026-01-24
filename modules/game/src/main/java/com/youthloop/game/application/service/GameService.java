package com.youthloop.game.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.persistence.entity.GameActionEntity;
import com.youthloop.game.persistence.entity.GameSessionEntity;
import com.youthloop.game.persistence.mapper.GameActionMapper;
import com.youthloop.game.persistence.mapper.GameSessionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 游戏服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {
    
    private final GameSessionMapper gameSessionMapper;
    private final GameActionMapper gameActionMapper;
    private final ObjectMapper objectMapper;
    
    /**
     * 开始新游戏会话
     */
    @Transactional
    public GameSessionDTO startSession() {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        // 检查是否已有活跃会话
        GameSessionEntity existing = gameSessionMapper.selectActiveByUserId(userId);
        if (existing != null) {
            log.info("用户已有活跃会话: userId={}, sessionId={}", userId, existing.getId());
            return toDTO(existing);
        }
        
        // 创建初始池塘状态
        ObjectNode initialState = objectMapper.createObjectNode();
        initialState.put("waterQuality", 80);
        initialState.put("temperature", 25);
        initialState.put("oxygen", 8);
        initialState.put("ph", 7);
        initialState.put("fishCount", 2);
        initialState.put("plantCount", 3);
        
        // 创建新会话
        GameSessionEntity session = new GameSessionEntity();
        session.setId(UUID.randomUUID());
        session.setUserId(userId);
        session.setPondState(initialState);
        session.setScore(0L);
        session.setLevel(1);
        session.setStartedAt(LocalDateTime.now());
        session.setLastActionAt(LocalDateTime.now());
        session.setStatus(1); // active
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        
        gameSessionMapper.insert(session);
        
        log.info("创建新游戏会话: userId={}, sessionId={}", userId, session.getId());
        
        return toDTO(session);
    }
    
    /**
     * 获取当前游戏会话
     */
    public GameSessionDTO getCurrentSession() {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        GameSessionEntity session = gameSessionMapper.selectActiveByUserId(userId);
        if (session == null) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
        }
        
        return toDTO(session);
    }
    
    /**
     * 执行游戏操作
     */
    @Transactional
    public GameActionResponse performAction(GameActionRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        // 获取会话
        GameSessionEntity session = gameSessionMapper.selectById(request.getSessionId());
        if (session == null || !session.getUserId().equals(userId)) {
            throw new BizException(ErrorCode.GAME_SESSION_INVALID);
        }
        
        if (session.getStatus() != 1) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_ACTIVE);
        }
        
        // 根据操作类型计算积分和更新状态
        int pointsEarned = calculatePoints(request.getActionType());
        JsonNode newState = updatePondState(session.getPondState(), request);
        
        // 更新会话
        session.setPondState(newState);
        session.setScore(session.getScore() + pointsEarned);
        session.setLevel(calculateLevel(session.getScore() + pointsEarned));
        session.setLastActionAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        
        gameSessionMapper.update(session);
        
        // 记录操作
        GameActionEntity action = new GameActionEntity();
        action.setId(UUID.randomUUID());
        action.setSessionId(session.getId());
        action.setUserId(userId);
        action.setActionType(request.getActionType());
        action.setActionData(request.getActionData());
        action.setPointsEarned(pointsEarned);
        action.setCreatedAt(LocalDateTime.now());
        
        gameActionMapper.insert(action);
        
        log.info("执行游戏操作: userId={}, sessionId={}, actionType={}, points={}", 
            userId, session.getId(), request.getActionType(), pointsEarned);
        
        return GameActionResponse.builder()
            .newPondState(newState)
            .pointsEarned(pointsEarned)
            .totalScore(session.getScore())
            .newLevel(session.getLevel())
            .build();
    }
    
    /**
     * 结束游戏会话
     */
    @Transactional
    public void endSession() {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        GameSessionEntity session = gameSessionMapper.selectActiveByUserId(userId);
        if (session == null) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
        }
        
        session.setStatus(3); // ended
        session.setUpdatedAt(LocalDateTime.now());
        
        gameSessionMapper.update(session);
        
        log.info("结束游戏会话: userId={}, sessionId={}, finalScore={}", 
            userId, session.getId(), session.getScore());
    }
    
    // === 私有方法 ===
    
    private GameSessionDTO toDTO(GameSessionEntity entity) {
        return GameSessionDTO.builder()
            .id(entity.getId())
            .userId(entity.getUserId())
            .pondState(entity.getPondState())
            .score(entity.getScore())
            .level(entity.getLevel())
            .startedAt(entity.getStartedAt())
            .lastActionAt(entity.getLastActionAt())
            .status(entity.getStatus())
            .build();
    }
    
    private int calculatePoints(Integer actionType) {
        // 简单的积分计算
        return switch (actionType) {
            case 1 -> 5;  // feed
            case 2 -> 10; // clean
            case 3 -> 15; // add_plant
            case 4 -> 20; // add_fish
            case 5 -> 8;  // adjust_params
            default -> 0;
        };
    }
    
    private int calculateLevel(long score) {
        // 简单的等级计算: 每100分升1级
        return (int) (score / 100) + 1;
    }
    
    private JsonNode updatePondState(JsonNode currentState, GameActionRequest request) {
        // 简单的状态更新逻辑
        ObjectNode newState = currentState.deepCopy();
        
        switch (request.getActionType()) {
            case 1: // feed
                newState.put("waterQuality", Math.max(0, newState.get("waterQuality").asInt() - 2));
                break;
            case 2: // clean
                newState.put("waterQuality", Math.min(100, newState.get("waterQuality").asInt() + 10));
                break;
            case 3: // add_plant
                newState.put("plantCount", newState.get("plantCount").asInt() + 1);
                newState.put("oxygen", Math.min(10, newState.get("oxygen").asInt() + 1));
                break;
            case 4: // add_fish
                newState.put("fishCount", newState.get("fishCount").asInt() + 1);
                break;
            case 5: // adjust_params
                // 根据actionData调整参数
                break;
        }
        
        return newState;
    }
}
