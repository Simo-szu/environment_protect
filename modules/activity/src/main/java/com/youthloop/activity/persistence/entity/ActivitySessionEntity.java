package com.youthloop.activity.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动场次实体（对应 social.activity_session 表）
 */
@Data
public class ActivitySessionEntity {
    
    private UUID id;
    private UUID activityId;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer status; // 1=enabled 2=disabled
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
