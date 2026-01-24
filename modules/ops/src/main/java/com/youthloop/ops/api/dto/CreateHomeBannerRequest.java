package com.youthloop.ops.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 创建轮播请求
 */
@Data
@Schema(description = "创建轮播请求")
public class CreateHomeBannerRequest {
    
    @Schema(description = "标题")
    private String title;
    
    @NotBlank(message = "图片 URL 不能为空")
    @Schema(description = "图片 URL", required = true)
    private String imageUrl;
    
    @NotNull(message = "链接类型不能为空")
    @Schema(description = "链接类型：1=无 2=内容 3=活动 4=外部链接", required = true)
    private Integer linkType;
    
    @Schema(description = "链接目标")
    private String linkTarget;
    
    @Schema(description = "排序顺序（越小越靠前）", example = "0")
    private Integer sortOrder = 0;
    
    @Schema(description = "是否启用", example = "true")
    private Boolean isEnabled = true;
    
    @Schema(description = "开始时间")
    private LocalDateTime startAt;
    
    @Schema(description = "结束时间")
    private LocalDateTime endAt;
}
