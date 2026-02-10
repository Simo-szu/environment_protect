package com.youthloop.social.api.web.controller.search;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.search.api.dto.SearchRequest;
import com.youthloop.search.api.dto.SearchResultDTO;
import com.youthloop.search.api.facade.SearchFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "搜索", description = "全文搜索内容和活动")
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchFacade searchFacade;

    @Operation(summary = "搜索", description = "搜索内容和活动")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<SearchResultDTO>> search(
        @RequestParam(name = "keyword") String keyword,
        @RequestParam(name = "type", required = false) Integer type,
        @RequestParam(name = "page", defaultValue = "1") Integer page,
        @RequestParam(name = "size", defaultValue = "20") Integer size
    ) {
        SearchRequest request = new SearchRequest();
        request.setKeyword(keyword);
        request.setType(type);
        request.setPage(page);
        request.setPageSize(size);

        PageResponse<SearchResultDTO> response = searchFacade.search(request);
        ApiPageData<SearchResultDTO> pageData = new ApiPageData<>(
            response.getPage(),
            response.getSize(),
            response.getTotal(),
            response.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "搜索建议", description = "获取搜索建议词")
    @GetMapping("/suggest")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<String>> suggest(
        @RequestParam(required = false) String prefix
    ) {
        List<String> suggestions = searchFacade.getSuggestions(prefix);
        ApiPageData<String> pageData = new ApiPageData<>(
            1,
            suggestions.size(),
            (long) suggestions.size(),
            suggestions
        );
        return ApiSpecResponse.ok(pageData);
    }
}
