package com.youthloop.notification.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * 创建通知请求
 */
@Data
@Schema(description = "创建通知")
public class CreateNotificationRequest {
    
    @Schema(description = "接收用户 ID", required = true)
    @NotNull(message = "接收用户 ID 不能为空")
    private UUID userId;
    
    @Schema(description = "通知类型：1=系统 2=评论 3=点赞 4=报名", required = true)
    @NotNull(message = "通知类型不能为空")
    private Integer type;
    
    @Schema(description = "标题", required = true)
    @NotBlank(message = "标题不能为空")
    private String title;
    
    @Schema(description = "内容", required = true)
    @NotBlank(message = "内容不能为空")
    private String content;
    
    @Schema(description = "关联目标类型：1=内容 2=活动 3=评论")
    private Integer targetType;
    
    @Schema(description = "关联目标 ID")
    private UUID targetId;
}
