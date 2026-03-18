package com.youthloop.social.api.web.controller.query;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.OptionalAuth;
import com.youthloop.content.application.service.ContentStatsUpdateService;
import com.youthloop.query.dto.CommentTreeDTO;
import com.youthloop.query.dto.ContentDetailDTO;
import com.youthloop.query.dto.ContentListItemDTO;
import com.youthloop.query.facade.QueryFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Content Query", description = "Aggregated content query APIs")
@RestController
@RequestMapping("/api/v1/contents")
@RequiredArgsConstructor
@OptionalAuth
public class ContentQueryController {

    private final QueryFacade queryFacade;
    private final ContentStatsUpdateService contentStatsUpdateService;

    @Operation(summary = "Get content list", description = "Query content list with stats and optional source filter")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<ContentListItemDTO>> getContentList(
        @Parameter(description = "Content type") @RequestParam(value = "type", required = false) Integer type,
        @Parameter(description = "Source key, supports comma-separated values") @RequestParam(value = "sourceKey", required = false) String sourceKey,
        @Parameter(description = "Status") @RequestParam(value = "status", required = false) Integer status,
        @Parameter(description = "Sort") @RequestParam(value = "sort", defaultValue = "latest") String sort,
        @Parameter(description = "Page") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") Integer size
    ) {
        PageResponse<ContentListItemDTO> result = queryFacade.getContentList(type, sourceKey, status, sort, page, size);
        ApiPageData<ContentListItemDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "Get content detail", description = "Query content detail and update view count")
    @GetMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<ContentDetailDTO> getContentDetail(
        @Parameter(description = "Content ID") @PathVariable("id") UUID id
    ) {
        ContentDetailDTO detail = queryFacade.getContentDetail(id);
        if (detail != null) {
            contentStatsUpdateService.incrementViewCount(id);
        }
        return ApiSpecResponse.ok(detail);
    }

    @Operation(summary = "Get comment tree", description = "Query root comments with latest replies")
    @GetMapping("/{id}/comments")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<CommentTreeDTO> getContentComments(
        @Parameter(description = "Content ID") @PathVariable("id") UUID id,
        @Parameter(description = "Sort") @RequestParam(value = "sort", defaultValue = "latest") String sort,
        @Parameter(description = "Page") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        CommentTreeDTO tree = queryFacade.getCommentTree(1, id, sort, page, size);
        return ApiSpecResponse.ok(tree);
    }
}
