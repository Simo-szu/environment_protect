package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 我的收藏/点赞列表项 DTO
 * 包含：reaction 信息 + 目标内容/活动的基本信息
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "收藏/点赞列表项")
public class ReactionItemDTO {
    
    @Schema(description = "Reaction ID")
    private UUID id;
    
    @Schema(description = "反应类型：1=点赞 2=收藏 3=踩")
    private Integer reactionType;
    
    @Schema(description = "目标类型：1=内容 2=活动")
    private Integer targetType;
    
    @Schema(description = "目标 ID")
    private UUID targetId;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    // === 目标内容信息（targetType=1 时）===
    @Schema(description = "内容标题")
    private String contentTitle;
    
    @Schema(description = "内容类型：1=新闻 2=动态 3=政策 4=百科")
    private Integer contentType;
    
    @Schema(description = "内容封面")
    private String contentCoverUrl;
    
    @Schema(description = "内容摘要")
    private String contentSummary;
    
    // === 目标活动信息（targetType=2 时）===
    @Schema(description = "活动标题")
    private String activityTitle;
    
    @Schema(description = "活动分类")
    private Integer activityCategory;
    
    @Schema(description = "活动海报")
    private String activityPosterUrl;
    
    @Schema(description = "活动开始时间")
    private LocalDateTime activityStartTime;
    
    @Schema(description = "活动地点")
    private String activityLocation;
}
