package com.youthloop.interaction.persistence.entity;

import com.youthloop.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

/**
 * 评论实体（对应 social.comment 表）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CommentEntity extends BaseEntity {
    
    /**
     * 评论 ID
     */
    private UUID id;
    
    /**
     * 目标类型：1=content 2=activity
     */
    private Integer targetType;
    
    /**
     * 目标 ID
     */
    private UUID targetId;
    
    /**
     * 用户 ID
     */
    private UUID userId;
    
    /**
     * 父评论 ID（回复时使用）
     */
    private UUID parentId;
    
    /**
     * 根评论 ID（用于树形结构）
     */
    private UUID rootId;
    
    /**
     * 深度（0=顶级评论，1=一级回复，2=二级回复）
     */
    private Integer depth;
    
    /**
     * 评论内容
     */
    private String body;
    
    /**
     * 状态：1=visible 2=hidden
     */
    private Integer status;
}
