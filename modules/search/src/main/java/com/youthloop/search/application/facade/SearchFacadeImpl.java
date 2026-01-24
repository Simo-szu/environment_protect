package com.youthloop.search.application.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.search.api.dto.SearchRequest;
import com.youthloop.search.api.dto.SearchResultDTO;
import com.youthloop.search.api.facade.SearchFacade;
import com.youthloop.search.application.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 搜索门面实现
 */
@Service
@RequiredArgsConstructor
public class SearchFacadeImpl implements SearchFacade {
    
    private final SearchService searchService;
    
    @Override
    public PageResponse<SearchResultDTO> search(SearchRequest request) {
        return searchService.search(request);
    }
    
    @Override
    public List<String> getSuggestions(String prefix) {
        return searchService.getSuggestions(prefix);
    }
}
