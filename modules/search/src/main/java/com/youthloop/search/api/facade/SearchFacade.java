package com.youthloop.search.api.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.search.api.dto.SearchRequest;
import com.youthloop.search.api.dto.SearchResultDTO;

/**
 * 搜索门面接口
 */
public interface SearchFacade {
    
    /**
     * 搜索内容和活动
     */
    PageResponse<SearchResultDTO> search(SearchRequest request);
}
