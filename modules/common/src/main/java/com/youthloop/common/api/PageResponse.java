package com.youthloop.common.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 分页响应（严格按照文档定义）
 * 
 * 只包含 4 个字段：page, size, total, items
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    
    /**
     * 当前页码（从 1 开始）
     */
    private Integer page;
    
    /**
     * 每页大小
     */
    private Integer size;
    
    /**
     * 总记录数
     */
    private Long total;
    
    /**
     * 数据列表
     */
    private List<T> items;
    
    /**
     * 构建分页响应
     */
    public static <T> PageResponse<T> of(List<T> items, Long total, Integer page, Integer size) {
        return new PageResponse<>(page, size, total, items);
    }
}
