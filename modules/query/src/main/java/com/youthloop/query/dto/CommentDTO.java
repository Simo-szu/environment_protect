package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 评论 DTO（树形结构）
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "评论")
public class CommentDTO {
    
    @Schema(description = "评论 ID")
    private UUID id;
    
    @Schema(description = "目标类型：1=内容 2=活动")
    private Integer targetType;
    
    @Schema(description = "目标 ID")
    private UUID targetId;
    
    @Schema(description = "用户 ID")
    private UUID userId;
    
    @Schema(description = "用户昵称")
    private String userNickname;
    
    @Schema(description = "用户头像")
    private String userAvatar;
    
    @Schema(description = "父评论 ID")
    private UUID parentId;
    
    @Schema(description = "根评论 ID")
    private UUID rootId;
    
    @Schema(description = "深度：0=根评论 1=一级回复 2=二级回复")
    private Integer depth;
    
    @Schema(description = "评论内容")
    private String body;
    
    @Schema(description = "状态：1=可见 2=隐藏")
    private Integer status;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
    
    // === 统计信息 ===
    @Schema(description = "点赞数")
    private Integer likeCount;
    
    @Schema(description = "回复数")
    private Integer replyCount;
    
    // === 回复列表（仅根评论有）===
    @Schema(description = "回复列表（仅根评论包含，最多返回最新的几条）")
    private List<CommentDTO> replies;
}
