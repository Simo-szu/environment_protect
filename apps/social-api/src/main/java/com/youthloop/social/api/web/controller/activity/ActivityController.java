package com.youthloop.social.api.web.controller.activity;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.OptionalAuth;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.query.dto.ActivityCategoryCountDTO;
import com.youthloop.query.dto.ActivityDetailDTO;
import com.youthloop.query.dto.ActivityListItemDTO;
import com.youthloop.query.dto.ActivitySessionDTO;
import com.youthloop.query.dto.ActivitySummaryDTO;
import com.youthloop.query.dto.CommentTreeDTO;
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

import java.util.List;
import java.util.UUID;

@Tag(name = "活动", description = "活动列表、详情、场次、评论")
@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
@OptionalAuth
public class ActivityController {

    private final QueryFacade queryFacade;

    @Operation(summary = "获取活动列表", description = "分页查询活动列表")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<ActivityListItemDTO>> getActivityList(
        @Parameter(description = "分类") @RequestParam(value = "category", required = false) Integer category,
        @Parameter(description = "状态") @RequestParam(value = "status", required = false) Integer status,
        @Parameter(description = "排序") @RequestParam(value = "sort", defaultValue = "latest") String sort,
        @Parameter(description = "页码") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        PageResponse<ActivityListItemDTO> result = queryFacade.getActivityList(category, status, sort, page, size);
        ApiPageData<ActivityListItemDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "获取活动统计摘要", description = "获取指定月份活动统计")
    @GetMapping("/summary")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<ActivitySummaryDTO> getActivitySummary(
        @Parameter(description = "月份") @RequestParam("month") String month
    ) {
        UUID currentUserId = SecurityUtil.getCurrentUserIdOptional();
        ActivitySummaryDTO summary = queryFacade.getActivitySummary(month, currentUserId);
        return ApiSpecResponse.ok(summary);
    }

    @Operation(summary = "获取热门活动分类", description = "分页查询指定月份热门分类")
    @GetMapping("/categories/popular")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<ActivityCategoryCountDTO>> getPopularActivityCategories(
        @Parameter(description = "月份") @RequestParam("month") String month,
        @Parameter(description = "页码") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        PageResponse<ActivityCategoryCountDTO> result = queryFacade.getPopularActivityCategories(month, page, size);
        ApiPageData<ActivityCategoryCountDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "获取活动详情", description = "根据 ID 查询活动详情")
    @GetMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<ActivityDetailDTO> getActivityById(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID id
    ) {
        ActivityDetailDTO activity = queryFacade.getActivityDetail(id);
        return ApiSpecResponse.ok(activity);
    }

    @Operation(summary = "获取活动场次列表", description = "查询活动所有场次")
    @GetMapping("/{id}/sessions")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<ActivitySessionDTO>> getActivitySessions(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID id
    ) {
        List<ActivitySessionDTO> sessions = queryFacade.getActivitySessions(id);
        ApiPageData<ActivitySessionDTO> pageData = new ApiPageData<>(
            1,
            sessions.size(),
            (long) sessions.size(),
            sessions
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "获取活动评论", description = "查询活动评论树")
    @GetMapping("/{id}/comments")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<CommentTreeDTO> getActivityComments(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID id,
        @Parameter(description = "排序") @RequestParam(value = "sort", defaultValue = "latest") String sort,
        @Parameter(description = "页码") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        CommentTreeDTO tree = queryFacade.getCommentTree(2, id, sort, page, size);
        return ApiSpecResponse.ok(tree);
    }
}
