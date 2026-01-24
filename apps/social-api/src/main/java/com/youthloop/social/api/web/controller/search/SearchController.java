package com.youthloop.social.api.web.controller.search;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.PageResponse;
import com.youthloop.search.api.dto.SearchRequest;
import com.youthloop.search.api.dto.SearchResultDTO;
import com.youthloop.search.api.facade.SearchFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 搜索 Controller
 */
@Tag(name = "搜索", description = "全文搜索内容和活动")
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {
    
    private final SearchFacade searchFacade;
    
    @Operation(summary = "搜索", description = "搜索内容和活动")
    @GetMapping
    public BaseResponse<PageResponse<SearchResultDTO>> search(
        @RequestParam String keyword,
        @RequestParam(required = false) Integer type,
        @RequestParam(defaultValue = "1") Integer page,
        @RequestParam(defaultValue = "20") Integer size
    ) {
        SearchRequest request = new SearchRequest();
        request.setKeyword(keyword);
        request.setType(type);
        request.setPage(page);
        request.setPageSize(size);
        
        PageResponse<SearchResultDTO> response = searchFacade.search(request);
        return BaseResponse.success(response);
    }
}
    
    @Operation(summary = "搜索建议", description = "获取搜索建议词（热门搜索/搜索历史）")
    @GetMapping("/suggest")
    public BaseResponse<java.util.List<String>> suggest(
        @RequestParam(required = false) String prefix
    ) {
        // TODO: 实现搜索建议逻辑（v0.1 返回空列表）
        // 未来可以从 Redis 缓存的热门搜索词中获取
        // 或者从用户搜索历史中获取
        return BaseResponse.success(java.util.Collections.emptyList());
    }
