package com.youthloop.interaction.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 评论统计实体（对应 social.comment_stats 表）
 */
@Data
public class CommentStatsEntity {
    
    /**
     * 评论 ID（主键）
     */
    private UUID commentId;
    
    /**
     * 点赞数
     */
    private Integer likeCount;
    
    /**
     * 踩数
     */
    private Integer downCount;
    
    /**
     * 回复数
     */
    private Integer replyCount;
    
    /**
     * 热度分数
     */
    private Long hotScore;
    
    /**
     * 热度规则 ID
     */
    private UUID hotRuleId;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
