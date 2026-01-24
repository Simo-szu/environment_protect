package com.youthloop.activity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 创建活动场次请求
 */
@Data
@Schema(description = "创建活动场次请求")
public class CreateActivitySessionRequest {
    
    @Schema(description = "场次 ID（更新时提供）")
    private UUID id;
    
    @Schema(description = "场次标题")
    private String title;
    
    @NotNull(message = "开始时间不能为空")
    @Schema(description = "开始时间", required = true)
    private LocalDateTime startTime;
    
    @Schema(description = "结束时间")
    private LocalDateTime endTime;
    
    @Schema(description = "容量")
    private Integer capacity;
    
    @Schema(description = "状态：1=启用 2=禁用")
    private Integer status;
}
