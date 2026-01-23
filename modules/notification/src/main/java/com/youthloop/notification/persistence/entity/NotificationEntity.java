package com.youthloop.notification.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 通知实体（对应 social.notification 表）
 */
@Data
public class NotificationEntity {
    
    /**
     * 通知 ID
     */
    private UUID id;
    
    /**
     * 接收者用户 ID
     */
    private UUID userId;
    
    /**
     * 通知类型：1=comment_reply 2=comment_mention 3=system
     */
    private Integer type;
    
    /**
     * 触发者用户 ID
     */
    private UUID actorUserId;
    
    /**
     * 目标类型：1=content 2=activity
     */
    private Integer targetType;
    
    /**
     * 目标 ID
     */
    private UUID targetId;
    
    /**
     * 评论 ID（新评论）
     */
    private UUID commentId;
    
    /**
     * 根评论 ID
     */
    private UUID rootCommentId;
    
    /**
     * 元数据（JSON）
     */
    private String meta;
    
    /**
     * 已读时间
     */
    private LocalDateTime readAt;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}
