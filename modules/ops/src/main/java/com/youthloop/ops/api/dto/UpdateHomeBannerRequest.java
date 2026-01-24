package com.youthloop.ops.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 更新轮播请求
 */
@Data
@Schema(description = "更新轮播请求")
public class UpdateHomeBannerRequest {
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "图片 URL")
    private String imageUrl;
    
    @Schema(description = "链接类型：1=无 2=内容 3=活动 4=外部链接")
    private Integer linkType;
    
    @Schema(description = "链接目标")
    private String linkTarget;
    
    @Schema(description = "排序顺序（越小越靠前）")
    private Integer sortOrder;
    
    @Schema(description = "是否启用")
    private Boolean isEnabled;
    
    @Schema(description = "开始时间")
    private LocalDateTime startAt;
    
    @Schema(description = "结束时间")
    private LocalDateTime endAt;
}
