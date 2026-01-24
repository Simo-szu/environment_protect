package com.youthloop.activity.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动实体（对应 social.activity 表）
 */
@Data
public class ActivityEntity {
    
    private UUID id;
    private Integer sourceType; // 1=crawled 2=hosted
    private String title;
    private Integer category; // 1-8
    private String topic;
    private Integer signupPolicy; // 1=auto_approve 2=manual_review
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String description;
    private String posterUrls; // JSON string
    private String sourceUrl;
    private UUID hostUserId;
    private Integer status; // 1=published 2=hidden 3=ended
    private String fts; // tsvector
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
