package com.youthloop.interaction.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.event.application.service.OutboxEventService;
import com.youthloop.interaction.application.dto.CreateCommentRequest;
import com.youthloop.interaction.persistence.entity.CommentEntity;
import com.youthloop.interaction.persistence.entity.CommentStatsEntity;
import com.youthloop.interaction.persistence.mapper.CommentMapper;
import com.youthloop.interaction.persistence.mapper.CommentStatsMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 评论服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentMapper commentMapper;
    private final CommentStatsMapper commentStatsMapper;
    private final OutboxEventService outboxEventService;
    
    private static final int MAX_DEPTH = 2; // 最大深度（3 层：0/1/2）
    
    /**
     * 创建评论
     */
    @Transactional
    public UUID createComment(CreateCommentRequest request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        
        log.info("创建评论: userId={}, targetType={}, targetId={}, parentId={}", 
            userId, request.getTargetType(), request.getTargetId(), request.getParentId());
        
        CommentEntity comment = new CommentEntity();
        comment.setId(UUID.randomUUID());
        comment.setTargetType(request.getTargetType());
        comment.setTargetId(request.getTargetId());
        comment.setUserId(userId);
        comment.setBody(request.getBody());
        comment.setStatus(1); // visible
        
        // 处理回复逻辑
        if (request.getParentId() != null) {
            CommentEntity parent = commentMapper.selectById(request.getParentId());
            if (parent == null) {
                throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "父评论不存在");
            }
            
            // 检查深度限制
            int newDepth = parent.getDepth() + 1;
            if (newDepth > MAX_DEPTH) {
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "评论层级过深");
            }
            
            comment.setParentId(request.getParentId());
            comment.setRootId(parent.getRootId() != null ? parent.getRootId() : parent.getId());
            comment.setDepth(newDepth);
            
            // 增加父评论的回复数
            commentStatsMapper.incrementReplyCount(request.getParentId());
        } else {
            // 顶级评论
            comment.setDepth(0);
            comment.setRootId(comment.getId()); // 自己是根评论
        }
        
        LocalDateTime now = LocalDateTime.now();
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);
        
        // 插入评论
        int rows = commentMapper.insert(comment);
        if (rows == 0) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "创建评论失败");
        }
        
        // 创建统计记录
        CommentStatsEntity stats = new CommentStatsEntity();
        stats.setCommentId(comment.getId());
        stats.setLikeCount(0);
        stats.setDownCount(0);
        stats.setReplyCount(0);
        stats.setHotScore(0L);
        stats.setUpdatedAt(now);
        commentStatsMapper.insert(stats);
        
        // 发布 Outbox 事件
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("commentId", comment.getId().toString());
        eventPayload.put("userId", userId.toString());
        eventPayload.put("targetType", request.getTargetType());
        eventPayload.put("targetId", request.getTargetId().toString());
        eventPayload.put("parentId", request.getParentId() != null ? request.getParentId().toString() : null);
        eventPayload.put("rootId", comment.getRootId().toString());
        
        outboxEventService.publishEvent("COMMENT_CREATED", eventPayload);
        
        log.info("评论创建成功: id={}", comment.getId());
        return comment.getId();
    }
}
