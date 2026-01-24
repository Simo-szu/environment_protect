package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 我报名的活动列表项 DTO
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "我报名的活动")
public class MyActivityItemDTO {
    
    @Schema(description = "报名 ID")
    private UUID signupId;
    
    @Schema(description = "活动 ID")
    private UUID activityId;
    
    @Schema(description = "场次 ID")
    private UUID sessionId;
    
    @Schema(description = "报名状态：1=待审核 2=已通过 3=已拒绝 4=已取消")
    private Integer signupStatus;
    
    @Schema(description = "报名时间")
    private LocalDateTime signupAt;
    
    // === 活动信息 ===
    @Schema(description = "活动标题")
    private String title;
    
    @Schema(description = "活动分类：1-8")
    private Integer category;
    
    @Schema(description = "开始时间")
    private LocalDateTime startTime;
    
    @Schema(description = "结束时间")
    private LocalDateTime endTime;
    
    @Schema(description = "地点")
    private String location;
    
    @Schema(description = "海报 URL 列表")
    private List<String> posterUrls;
    
    @Schema(description = "活动状态：1=已发布 2=隐藏 3=已结束")
    private Integer activityStatus;
    
    @Schema(description = "报名数")
    private Integer signupCount;
    
    @Schema(description = "点赞数")
    private Integer likeCount;
}
