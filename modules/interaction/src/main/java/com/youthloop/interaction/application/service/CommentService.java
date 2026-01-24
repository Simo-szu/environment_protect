package com.youthloop.interaction.application.service;

import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.interaction.api.dto.CreateCommentRequest;
import com.youthloop.interaction.persistence.entity.CommentEntity;
import com.youthloop.interaction.persistence.mapper.CommentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 评论服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentMapper commentMapper;
    
    private static final int MAX_DEPTH = 3; // 最大评论深度
    
    /**
     * 创建评论
     */
    @Transactional
    public UUID createComment(CreateCommentRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        CommentEntity entity = new CommentEntity();
        entity.setId(UUID.randomUUID());
        entity.setTargetType(request.getTargetType());
        entity.setTargetId(request.getTargetId());
        entity.setUserId(currentUserId);
        entity.setBody(request.getBody());
        entity.setStatus(1); // 默认已发布
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        
        // 如果是回复
        if (request.getParentId() != null) {
            CommentEntity parent = commentMapper.selectById(request.getParentId());
            if (parent == null) {
                throw new BizException(50041, "父评论不存在");
            }
            
            // 检查深度
            int depth = parent.getDepth() + 1;
            if (depth > MAX_DEPTH) {
                throw new BizException(50051, "评论深度超限");
            }
            
            entity.setParentId(request.getParentId());
            entity.setRootId(parent.getRootId() != null ? parent.getRootId() : parent.getId());
            entity.setDepth(depth);
        } else {
            // 根评论
            entity.setParentId(null);
            entity.setRootId(null);
            entity.setDepth(0);
        }
        
        int rows = commentMapper.insert(entity);
        if (rows == 0) {
            throw new BizException(50022, "评论失败");
        }
        
        log.info("评论创建成功: commentId={}, targetType={}, targetId={}, userId={}", 
            entity.getId(), request.getTargetType(), request.getTargetId(), currentUserId);
        
        // TODO: 发送 outbox 事件（COMMENT_CREATED），用于更新统计和发送通知
        
        return entity.getId();
    }
    
    /**
     * 删除评论
     */
    @Transactional
    public void deleteComment(UUID commentId) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        
        CommentEntity comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BizException(50041, "评论不存在");
        }
        
        // 权限检查：只能删除自己的评论或管理员可删除
        if (!comment.getUserId().equals(currentUserId) && !SecurityUtil.isAdmin()) {
            throw new BizException(50032, "无权删除该评论");
        }
        
        // 软删除（更新状态为已删除）
        int rows = commentMapper.updateStatus(commentId, 3);
        if (rows == 0) {
            throw new BizException(50022, "删除评论失败");
        }
        
        log.info("评论删除成功: commentId={}, userId={}", commentId, currentUserId);
        
        // TODO: 发送 outbox 事件（COMMENT_DELETED），用于更新统计
    }
}
