package com.youthloop.interaction.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * 切换反应请求
 */
@Data
@Schema(description = "切换反应请求")
public class ToggleReactionRequest {
    
    @NotNull(message = "目标类型不能为空")
    @Schema(description = "目标类型：1=content 2=activity 3=comment", example = "1")
    private Integer targetType;
    
    @NotNull(message = "目标 ID 不能为空")
    @Schema(description = "目标 ID")
    private UUID targetId;
    
    @NotNull(message = "反应类型不能为空")
    @Schema(description = "反应类型：1=like 2=fav 3=downvote", example = "1")
    private Integer reactionType;
}
