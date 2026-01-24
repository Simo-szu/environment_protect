package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动场次 DTO
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "活动场次")
public class ActivitySessionDTO {
    
    @Schema(description = "场次 ID")
    private UUID id;
    
    @Schema(description = "活动 ID")
    private UUID activityId;
    
    @Schema(description = "场次名称")
    private String sessionName;
    
    @Schema(description = "开始时间")
    private LocalDateTime startTime;
    
    @Schema(description = "结束时间")
    private LocalDateTime endTime;
    
    @Schema(description = "地点")
    private String location;
    
    @Schema(description = "容量限制")
    private Integer capacity;
    
    @Schema(description = "已报名人数")
    private Integer signupCount;
    
    @Schema(description = "状态：1=开放 2=已满 3=已结束")
    private Integer status;
}
