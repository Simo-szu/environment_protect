package com.youthloop.activity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 主办方更新活动请求
 */
@Data
@Schema(description = "主办方更新活动请求")
public class UpdateHostActivityRequest {
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "分类：1-8")
    private Integer category;
    
    @Schema(description = "主题")
    private String topic;
    
    @Schema(description = "报名策略：1=自动通过 2=需要审核")
    private Integer signupPolicy;
    
    @Schema(description = "开始时间")
    private LocalDateTime startTime;
    
    @Schema(description = "结束时间")
    private LocalDateTime endTime;
    
    @Schema(description = "地点")
    private String location;
    
    @Schema(description = "描述")
    private String description;
    
    @Schema(description = "海报 URL 列表")
    private List<String> posterUrls;
    
    @Schema(description = "状态：1=已发布 2=隐藏 3=已结束")
    private Integer status;
}
