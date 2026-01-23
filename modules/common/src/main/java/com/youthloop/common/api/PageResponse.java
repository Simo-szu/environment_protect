package com.youthloop.common.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 分页响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    
    /**
     * 数据列表
     */
    private List<T> items;
    
    /**
     * 总记录数
     */
    private Long total;
    
    /**
     * 当前页码（从 1 开始）
     */
    private Integer page;
    
    /**
     * 每页大小
     */
    private Integer pageSize;
    
    /**
     * 总页数
     */
    private Integer totalPages;
    
    /**
     * 是否有下一页
     */
    private Boolean hasNext;
    
    /**
     * 是否有上一页
     */
    private Boolean hasPrev;
    
    /**
     * 构建分页响应
     */
    public static <T> PageResponse<T> of(List<T> items, Long total, Integer page, Integer pageSize) {
        PageResponse<T> response = new PageResponse<>();
        response.setItems(items);
        response.setTotal(total);
        response.setPage(page);
        response.setPageSize(pageSize);
        
        int totalPages = (int) Math.ceil((double) total / pageSize);
        response.setTotalPages(totalPages);
        response.setHasNext(page < totalPages);
        response.setHasPrev(page > 1);
        
        return response;
    }
}
