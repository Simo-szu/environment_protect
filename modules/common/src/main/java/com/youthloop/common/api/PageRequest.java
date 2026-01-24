package com.youthloop.common.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 分页请求基类
 */
@Data
public class PageRequest {
    
    /**
     * 页码（从 1 开始）
     */
    @Min(value = 1, message = "页码必须大于 0")
    private Integer page = 1;
    
    /**
     * 每页大小
     */
    @Min(value = 1, message = "每页大小必须大于 0")
    @Max(value = 100, message = "每页大小不能超过 100")
    private Integer size = 20;
    
    /**
     * 获取偏移量（用于 SQL OFFSET）
     */
    public Integer getOffset() {
        return (page - 1) * size;
    }
    
    /**
     * 获取限制数量（用于 SQL LIMIT）
     */
    public Integer getLimit() {
        return size;
    }
}
