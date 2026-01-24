package com.youthloop.interaction.api.facade;

import com.youthloop.interaction.api.dto.CreateCommentRequest;

import java.util.UUID;

/**
 * 评论门面（对外契约）
 */
public interface CommentFacade {
    
    /**
     * 创建评论
     */
    UUID createComment(CreateCommentRequest request);
}
