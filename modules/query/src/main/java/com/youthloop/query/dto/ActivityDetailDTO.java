package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 活动详情聚合 DTO
 * 包含：主数据 + 统计 + 用户状态 + 场次信息
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "活动详情（聚合）")
public class ActivityDetailDTO {
    
    // === 主数据 ===
    @Schema(description = "活动 ID")
    private UUID id;
    
    @Schema(description = "来源类型：1=爬取 2=主办方发布")
    private Integer sourceType;
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "分类：1-8")
    private Integer category;
    
    @Schema(description = "主题")
    private String topic;
    
    @Schema(description = "描述")
    private String description;
    
    @Schema(description = "开始时间")
    private LocalDateTime startTime;
    
    @Schema(description = "结束时间")
    private LocalDateTime endTime;
    
    @Schema(description = "地点")
    private String location;
    
    @Schema(description = "海报 URL 列表")
    private List<String> posterUrls;
    
    @Schema(description = "报名策略：1=无需报名 2=需要报名")
    private Integer signupPolicy;
    
    @Schema(description = "状态：1=已发布 2=隐藏 3=已结束")
    private Integer status;
    
    @Schema(description = "来源 URL")
    private String sourceUrl;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
    
    // === 统计信息 ===
    @Schema(description = "报名数")
    private Integer signupCount;
    
    @Schema(description = "点赞数")
    private Integer likeCount;
    
    @Schema(description = "收藏数")
    private Integer favCount;
    
    @Schema(description = "评论数")
    private Integer commentCount;
    
    @Schema(description = "预计阅读时间（分钟）")
    private Integer readingTime;
    
    // === 用户状态（登录时返回）===
    @Schema(description = "用户状态（未登录时为 null）")
    private UserState userState;
    
    @Schema(description = "是否已报名")
    private Boolean signedUp;
    
    // === 场次信息（HOSTED 类型才有）===
    @Schema(description = "活动场次列表（仅 HOSTED 类型）")
    private List<ActivitySessionDTO> sessions;
}
