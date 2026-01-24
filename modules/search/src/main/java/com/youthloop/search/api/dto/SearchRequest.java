package com.youthloop.search.api.dto;

import lombok.Data;

/**
 * 搜索请求
 */
@Data
public class SearchRequest {
    private String keyword; // 搜索关键词
    private Integer type; // 搜索类型: 1=content 2=activity 3=all
    private Integer page = 1;
    private Integer pageSize = 20;
}
