package com.youthloop.social.api.web.controller.interaction;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.security.RequireAuth;
import com.youthloop.interaction.api.dto.CreateCommentRequest;
import com.youthloop.interaction.api.dto.ToggleReactionRequest;
import com.youthloop.interaction.api.facade.CommentFacade;
import com.youthloop.interaction.api.facade.ReactionFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 互动 Controller（评论/反应）
 * 所有写入接口都需要登录
 */
@Tag(name = "互动", description = "评论、点赞、收藏、踩")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@RequireAuth
public class InteractionController {
    
    private final CommentFacade commentFacade;
    private final ReactionFacade reactionFacade;
    
    @Operation(summary = "创建评论", description = "对内容或活动发表评论/回复")
    @PostMapping("/comments")
    public BaseResponse<UUID> createComment(@Valid @RequestBody UnifiedRequest<CreateCommentRequest> request) {
        UUID commentId = commentFacade.createComment(request.getData());
        return BaseResponse.success(commentId);
    }
    
    @Operation(summary = "添加反应", description = "点赞/收藏/踩（幂等创建）")
    @PostMapping("/reactions")
    public BaseResponse<Void> addReaction(@Valid @RequestBody UnifiedRequest<ToggleReactionRequest> request) {
        reactionFacade.createReaction(request.getData());
        return BaseResponse.success();
    }
    
    @Operation(summary = "取消反应", description = "取消点赞/收藏/踩（幂等删除）")
    @DeleteMapping("/reactions")
    public BaseResponse<Void> removeReaction(@Valid @RequestBody UnifiedRequest<ToggleReactionRequest> request) {
        reactionFacade.deleteReaction(request.getData());
        return BaseResponse.success();
    }
}
