package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 通知列表项 DTO
 * 包含：通知信息 + 触发者信息 + 目标内容信息
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "通知列表项")
public class NotificationItemDTO {
    
    @Schema(description = "通知 ID")
    private UUID id;
    
    @Schema(description = "通知类型：1=评论 2=回复 3=点赞 4=系统通知")
    private Integer type;
    
    @Schema(description = "是否已读")
    private Boolean isRead;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    // === 触发者信息 ===
    @Schema(description = "触发者用户 ID")
    private UUID actorId;
    
    @Schema(description = "触发者昵称")
    private String actorNickname;
    
    @Schema(description = "触发者头像")
    private String actorAvatar;
    
    // === 目标信息 ===
    @Schema(description = "目标类型：1=内容 2=活动 3=评论")
    private Integer targetType;
    
    @Schema(description = "目标 ID")
    private UUID targetId;
    
    @Schema(description = "目标标题/内容预览")
    private String targetPreview;
    
    // === 评论/回复内容（type=1,2 时）===
    @Schema(description = "评论 ID")
    private UUID commentId;
    
    @Schema(description = "评论内容")
    private String commentContent;
}
