package com.youthloop.interaction.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * 创建评论请求
 */
@Data
@Schema(description = "创建评论请求")
public class CreateCommentRequest {
    
    @NotNull(message = "目标类型不能为空")
    @Schema(description = "目标类型：1=内容 2=活动", required = true)
    private Integer targetType;
    
    @NotNull(message = "目标 ID 不能为空")
    @Schema(description = "目标 ID", required = true)
    private UUID targetId;
    
    @Schema(description = "父评论 ID（回复时必填）")
    private UUID parentId;
    
    @NotBlank(message = "评论内容不能为空")
    @Schema(description = "评论内容", required = true)
    private String body;
}
