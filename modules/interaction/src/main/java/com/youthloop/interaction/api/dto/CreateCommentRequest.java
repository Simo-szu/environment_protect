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
    @Schema(description = "目标类型：1=content 2=activity", example = "1")
    private Integer targetType;
    
    @NotNull(message = "目标 ID 不能为空")
    @Schema(description = "目标 ID")
    private UUID targetId;
    
    @Schema(description = "父评论 ID（回复时填写）")
    private UUID parentId;
    
    @NotBlank(message = "评论内容不能为空")
    @Schema(description = "评论内容", example = "这篇文章写得很好！")
    private String body;
}
