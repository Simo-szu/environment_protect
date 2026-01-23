package com.youthloop.social.api.web.controller;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.interaction.application.dto.CreateCommentRequest;
import com.youthloop.interaction.application.dto.ToggleReactionRequest;
import com.youthloop.interaction.application.service.CommentService;
import com.youthloop.interaction.application.service.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 互动 Controller（评论/反应）
 */
@Tag(name = "互动", description = "评论、点赞、收藏、踩")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class InteractionController {
    
    private final CommentService commentService;
    private final ReactionService reactionService;
    
    @Operation(summary = "创建评论", description = "对内容或活动发表评论/回复")
    @PostMapping("/comments")
    public BaseResponse<UUID> createComment(@Valid @RequestBody CreateCommentRequest request) {
        UUID commentId = commentService.createComment(request);
        return BaseResponse.success(commentId);
    }
    
    @Operation(summary = "切换反应", description = "点赞/收藏/踩（幂等操作，已存在则取消）")
    @PostMapping("/reactions/toggle")
    public BaseResponse<Boolean> toggleReaction(@Valid @RequestBody ToggleReactionRequest request) {
        boolean added = reactionService.toggleReaction(request);
        return BaseResponse.success(added);
    }
}
