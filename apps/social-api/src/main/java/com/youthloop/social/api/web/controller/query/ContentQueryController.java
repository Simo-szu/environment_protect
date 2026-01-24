package com.youthloop.social.api.web.controller.query;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.security.OptionalAuth;
import com.youthloop.query.dto.CommentTreeDTO;
import com.youthloop.query.dto.ContentDetailDTO;
import com.youthloop.query.dto.ContentListItemDTO;
import com.youthloop.query.facade.QueryFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 内容查询 Controller（聚合查询）
 * 包含：主数据 + 统计 + 用户状态
 */
@Tag(name = "内容查询", description = "内容聚合查询（含统计和用户状态）")
@RestController
@RequestMapping("/api/v1/contents")
@RequiredArgsConstructor
@OptionalAuth
public class ContentQueryController {
    
    private final QueryFacade queryFacade;
    
    @Operation(summary = "查询内容列表", description = "聚合查询：主数据 + 统计 + 用户状态（登录时）")
    @GetMapping
    public BaseResponse<PageResponse<ContentListItemDTO>> getContentList(
        @Parameter(description = "内容类型：1=新闻 2=动态 3=政策 4=百科") @RequestParam(required = false) Integer type,
        @Parameter(description = "状态：1=已发布 2=草稿 3=隐藏") @RequestParam(required = false) Integer status,
        @Parameter(description = "页码（从 1 开始）") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(defaultValue = "20") Integer size
    ) {
        PageResponse<ContentListItemDTO> result = queryFacade.getContentList(type, status, page, size);
        return BaseResponse.success(result);
    }
    
    @Operation(summary = "查询内容详情", description = "聚合查询：主数据 + 统计 + 用户状态（登录时）")
    @GetMapping("/{id}")
    public BaseResponse<ContentDetailDTO> getContentDetail(
        @Parameter(description = "内容 ID") @PathVariable UUID id
    ) {
        ContentDetailDTO detail = queryFacade.getContentDetail(id);
        return BaseResponse.success(detail);
    }
    
    @Operation(summary = "查询内容评论树", description = "根评论分页 + 每个根评论的最新回复")
    @GetMapping("/{id}/comments")
    public BaseResponse<CommentTreeDTO> getContentComments(
        @Parameter(description = "内容 ID") @PathVariable UUID id,
        @Parameter(description = "排序：latest=最新 hot=热门") @RequestParam(defaultValue = "latest") String sort,
        @Parameter(description = "页码（从 1 开始）") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size
    ) {
        CommentTreeDTO tree = queryFacade.getCommentTree(1, id, sort, page, size);
        return BaseResponse.success(tree);
    }
}
