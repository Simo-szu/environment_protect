package com.youthloop.activity.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动统计实体（对应 social.activity_stats 表）
 */
@Data
public class ActivityStatsEntity {
    
    private UUID activityId;
    private Integer likeCount;
    private Integer favCount;
    private Integer downCount;
    private Integer commentCount;
    private Long hotScore;
    private UUID hotRuleId;
    private LocalDateTime updatedAt;
}
