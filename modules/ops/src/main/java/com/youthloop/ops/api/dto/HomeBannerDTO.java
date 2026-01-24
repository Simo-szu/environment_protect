package com.youthloop.ops.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 首页轮播 DTO（管理端）
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "首页轮播")
public class HomeBannerDTO {
    
    @Schema(description = "轮播 ID")
    private UUID id;
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "图片 URL")
    private String imageUrl;
    
    @Schema(description = "链接类型：1=无 2=内容 3=活动 4=外部链接")
    private Integer linkType;
    
    @Schema(description = "链接目标（根据 linkType 不同含义不同）")
    private String linkTarget;
    
    @Schema(description = "排序顺序（越小越靠前）")
    private Integer sortOrder;
    
    @Schema(description = "是否启用")
    private Boolean isEnabled;
    
    @Schema(description = "开始时间")
    private LocalDateTime startAt;
    
    @Schema(description = "结束时间")
    private LocalDateTime endAt;
    
    @Schema(description = "创建者 ID")
    private UUID createdBy;
    
    @Schema(description = "更新者 ID")
    private UUID updatedBy;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
