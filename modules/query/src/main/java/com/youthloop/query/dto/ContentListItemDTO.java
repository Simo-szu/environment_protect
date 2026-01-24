package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 内容列表项聚合 DTO
 * 包含：主数据 + 统计 + 用户状态
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "内容列表项（聚合）")
public class ContentListItemDTO {
    
    // === 主数据 ===
    @Schema(description = "内容 ID")
    private UUID id;
    
    @Schema(description = "内容类型：1=新闻 2=动态 3=政策 4=百科")
    private Integer type;
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "摘要")
    private String summary;
    
    @Schema(description = "封面图 URL")
    private String coverUrl;
    
    @Schema(description = "发布时间")
    private LocalDateTime publishedAt;
    
    @Schema(description = "状态：1=已发布 2=草稿 3=隐藏")
    private Integer status;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    // === 统计信息 ===
    @Schema(description = "点赞数")
    private Integer likeCount;
    
    @Schema(description = "收藏数")
    private Integer favCount;
    
    @Schema(description = "评论数")
    private Integer commentCount;
    
    @Schema(description = "热度分数")
    private Long hotScore;
    
    // === 用户状态（登录时返回）===
    @Schema(description = "用户状态（未登录时为 null）")
    private UserState userState;
}
