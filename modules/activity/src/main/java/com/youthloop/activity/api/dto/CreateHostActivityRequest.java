package com.youthloop.activity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 主办方创建活动请求
 */
@Data
@Schema(description = "主办方创建活动请求")
public class CreateHostActivityRequest {
    
    @NotBlank(message = "标题不能为空")
    @Schema(description = "标题", required = true)
    private String title;
    
    @NotNull(message = "分类不能为空")
    @Schema(description = "分类：1-8", required = true)
    private Integer category;
    
    @Schema(description = "主题")
    private String topic;
    
    @NotNull(message = "报名策略不能为空")
    @Schema(description = "报名策略：1=自动通过 2=需要审核", required = true)
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
}
