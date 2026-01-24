package com.youthloop.activity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动报名响应
 */
@Data
@Schema(description = "活动报名响应")
public class SignupResponse {
    
    @Schema(description = "报名 ID")
    private UUID id;
    
    @Schema(description = "活动 ID")
    private UUID activityId;
    
    @Schema(description = "场次 ID")
    private UUID sessionId;
    
    @Schema(description = "状态：1=待审核 2=已通过 3=已拒绝 4=已取消")
    private Integer status;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
