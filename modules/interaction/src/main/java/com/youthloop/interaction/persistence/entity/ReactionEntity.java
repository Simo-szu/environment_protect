package com.youthloop.interaction.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 反应实体（对应 social.reaction 表）
 */
@Data
public class ReactionEntity {
    
    /**
     * 反应 ID
     */
    private UUID id;
    
    /**
     * 用户 ID
     */
    private UUID userId;
    
    /**
     * 目标类型：1=content 2=activity 3=comment
     */
    private Integer targetType;
    
    /**
     * 目标 ID
     */
    private UUID targetId;
    
    /**
     * 反应类型：1=like 2=fav 3=downvote
     */
    private Integer reactionType;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}
