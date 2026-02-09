package com.youthloop.social.api.web.controller.interaction;

import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.RequireAuth;
import com.youthloop.interaction.api.dto.CreateCommentRequest;
import com.youthloop.interaction.api.dto.ToggleReactionRequest;
import com.youthloop.interaction.api.facade.CommentFacade;
import com.youthloop.interaction.api.facade.ReactionFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

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
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<UUID> createComment(@Valid @RequestBody UnifiedRequest<CreateCommentRequest> request) {
        UUID commentId = commentFacade.createComment(request.getData());
        return ApiSpecResponse.ok(commentId);
    }

    @Operation(summary = "添加反应", description = "点赞/收藏/踩（幂等创建）")
    @PostMapping("/reactions")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> addReaction(@Valid @RequestBody UnifiedRequest<ToggleReactionRequest> request) {
        reactionFacade.createReaction(request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "取消反应", description = "取消点赞/收藏/踩（幂等删除）")
    @PostMapping("/reactions/delete")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> removeReaction(@Valid @RequestBody UnifiedRequest<ToggleReactionRequest> request) {
        reactionFacade.deleteReaction(request.getData());
        return ApiSpecResponse.ok(Map.of());
    }
}
