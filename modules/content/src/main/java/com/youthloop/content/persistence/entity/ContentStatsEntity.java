package com.youthloop.content.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 内容统计实体（对应 social.content_stats 表）
 */
@Data
public class ContentStatsEntity {
    
    /**
     * 内容 ID（主键，外键关联 content.id）
     */
    private UUID contentId;
    
    /**
     * 点赞数
     */
    private Integer likeCount;
    
    /**
     * 收藏数
     */
    private Integer favCount;
    
    /**
     * 踩数
     */
    private Integer downCount;
    
    /**
     * 评论数
     */
    private Integer commentCount;
    
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
