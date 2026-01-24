package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动列表项聚合 DTO
 * 包含：主数据 + 统计 + 用户状态
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "活动列表项（聚合）")
public class ActivityListItemDTO {
    
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
    
    @Schema(description = "开始时间")
    private LocalDateTime startTime;
    
    @Schema(description = "结束时间")
    private LocalDateTime endTime;
    
    @Schema(description = "地点")
    private String location;
    
    @Schema(description = "海报 URL（第一张）")
    private String posterUrl;
    
    @Schema(description = "状态：1=已发布 2=隐藏 3=已结束")
    private Integer status;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    // === 统计信息 ===
    @Schema(description = "报名数")
    private Integer signupCount;
    
    @Schema(description = "点赞数")
    private Integer likeCount;
    
    @Schema(description = "收藏数")
    private Integer favCount;
    
    @Schema(description = "评论数")
    private Integer commentCount;
    
    // === 用户状态（登录时返回）===
    @Schema(description = "用户状态（未登录时为 null）")
    private UserState userState;
    
    @Schema(description = "是否已报名")
    private Boolean signedUp;
}
