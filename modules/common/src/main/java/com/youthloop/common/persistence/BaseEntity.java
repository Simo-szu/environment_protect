package com.youthloop.common.persistence;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 实体基类
 * 包含通用字段：创建时间、更新时间
 */
@Data
public abstract class BaseEntity {
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
