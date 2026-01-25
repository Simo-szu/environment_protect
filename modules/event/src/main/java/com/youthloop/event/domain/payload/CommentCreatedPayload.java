package com.youthloop.event.domain.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 评论创建事件 Payload
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentCreatedPayload {
    
    /**
     * 评论 ID
     */
    private UUID commentId;
    
    /**
     * 目标类型：1=内容 2=活动
     */
    private Integer targetType;
    
    /**
     * 目标 ID
     */
    private UUID targetId;
    
    /**
     * 父评论 ID（回复时）
     */
    private UUID parentId;
    
    /**
     * 根评论 ID（回复时）
     */
    private UUID rootId;
    
    /**
     * 评论者 ID
     */
    private UUID userId;
    
    /**
     * 父评论作者 ID（仅回复时有值，用于通知）
     */
    private UUID parentUserId;
}
