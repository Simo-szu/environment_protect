package com.youthloop.social.api.web.controller.query;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.OptionalAuth;
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

@Tag(name = "内容查询", description = "内容聚合查询")
@RestController
@RequestMapping("/api/v1/contents")
@RequiredArgsConstructor
@OptionalAuth
public class ContentQueryController {

    private final QueryFacade queryFacade;

    @Operation(summary = "查询内容列表", description = "聚合查询内容列表")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<ContentListItemDTO>> getContentList(
        @Parameter(description = "内容类型") @RequestParam(value = "type", required = false) Integer type,
        @Parameter(description = "状态") @RequestParam(value = "status", required = false) Integer status,
        @Parameter(description = "排序") @RequestParam(value = "sort", defaultValue = "latest") String sort,
        @Parameter(description = "页码") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(value = "size", defaultValue = "20") Integer size
    ) {
        PageResponse<ContentListItemDTO> result = queryFacade.getContentList(type, status, sort, page, size);
        ApiPageData<ContentListItemDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "查询内容详情", description = "聚合查询内容详情")
    @GetMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<ContentDetailDTO> getContentDetail(
        @Parameter(description = "内容 ID") @PathVariable("id") UUID id
    ) {
        ContentDetailDTO detail = queryFacade.getContentDetail(id);
        return ApiSpecResponse.ok(detail);
    }

    @Operation(summary = "查询内容评论树", description = "根评论分页 + 最新回复")
    @GetMapping("/{id}/comments")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<CommentTreeDTO> getContentComments(
        @Parameter(description = "内容 ID") @PathVariable("id") UUID id,
        @Parameter(description = "排序") @RequestParam(value = "sort", defaultValue = "latest") String sort,
        @Parameter(description = "页码") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        CommentTreeDTO tree = queryFacade.getCommentTree(1, id, sort, page, size);
        return ApiSpecResponse.ok(tree);
    }
}
