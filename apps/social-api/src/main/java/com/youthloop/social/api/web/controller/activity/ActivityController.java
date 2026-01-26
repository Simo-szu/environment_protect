package com.youthloop.social.api.web.controller.activity;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.security.OptionalAuth;
import com.youthloop.query.dto.ActivityDetailDTO;
import com.youthloop.query.dto.ActivityListItemDTO;
import com.youthloop.query.dto.ActivitySessionDTO;
import com.youthloop.query.dto.CommentTreeDTO;
import com.youthloop.query.facade.QueryFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 活动 Controller（使用 Query 层聚合查询）
 */
@Tag(name = "活动", description = "活动列表、详情、场次、评论")
@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
@OptionalAuth
public class ActivityController {
    
    private final QueryFacade queryFacade;
    
    @Operation(summary = "获取活动列表", description = "分页查询活动列表，支持按分类和状态筛选，含统计和用户状态")
    @GetMapping
    public BaseResponse<PageResponse<ActivityListItemDTO>> getActivityList(
        @RequestHeader(value = "Accept-Language", required = false, defaultValue = "zh") String locale,
        @Parameter(description = "分类：1-8") @RequestParam(value = "category", required = false) Integer category,
        @Parameter(description = "状态：1=已发布 2=隐藏 3=已结束") @RequestParam(value = "status", required = false) Integer status,
        @Parameter(description = "排序：latest=最新 hot=热门") @RequestParam(value = "sort", defaultValue = "latest") String sort,
        @Parameter(description = "页码（从 1 开始）") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        PageResponse<ActivityListItemDTO> result = queryFacade.getActivityList(category, status, locale, sort, page, size);
        return BaseResponse.success(result);
    }
    
    @Operation(summary = "获取活动详情", description = "根据 ID 查询活动详情，含统计、用户状态和场次信息")
    @GetMapping("/{id}")
    public BaseResponse<ActivityDetailDTO> getActivityById(
        @RequestHeader(value = "Accept-Language", required = false, defaultValue = "zh") String locale,
        @Parameter(description = "活动 ID") @PathVariable("id") UUID id
    ) {
        ActivityDetailDTO activity = queryFacade.getActivityDetail(id, locale);
        return BaseResponse.success(activity);
    }
    
    @Operation(summary = "获取活动场次列表", description = "查询活动的所有场次（仅 HOSTED 类型活动有场次）")
    @GetMapping("/{id}/sessions")
    public BaseResponse<List<ActivitySessionDTO>> getActivitySessions(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID id
    ) {
        List<ActivitySessionDTO> sessions = queryFacade.getActivitySessions(id);
        return BaseResponse.success(sessions);
    }
    
    @Operation(summary = "获取活动评论", description = "查询活动的评论树（根评论分页 + 回复）")
    @GetMapping("/{id}/comments")
    public BaseResponse<CommentTreeDTO> getActivityComments(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID id,
        @Parameter(description = "排序：latest=最新 hot=热门") @RequestParam(value = "sort", defaultValue = "latest") String sort,
        @Parameter(description = "页码（从 1 开始）") @RequestParam(value = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(value = "size", defaultValue = "10") Integer size
    ) {
        CommentTreeDTO tree = queryFacade.getCommentTree(2, id, sort, page, size);
        return BaseResponse.success(tree);
    }
}
