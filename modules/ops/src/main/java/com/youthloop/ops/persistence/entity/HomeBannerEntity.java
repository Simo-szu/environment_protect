package com.youthloop.ops.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 首页轮播/运营位实体
 */
@Data
public class HomeBannerEntity {
    
    private UUID id;
    private String title;
    private String imageUrl;
    private Integer linkType;  // 1=none 2=content 3=activity 4=url
    private String linkTarget;
    private Integer sortOrder;
    private Boolean isEnabled;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private UUID createdBy;
    private UUID updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
