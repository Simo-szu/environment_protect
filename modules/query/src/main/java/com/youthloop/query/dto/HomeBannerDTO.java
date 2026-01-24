package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 首页轮播/运营位 DTO
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "首页轮播/运营位")
public class HomeBannerDTO {
    
    @Schema(description = "轮播 ID")
    private UUID id;
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "图片 URL")
    private String imageUrl;
    
    @Schema(description = "跳转链接")
    private String linkUrl;
    
    @Schema(description = "排序顺序")
    private Integer sortOrder;
    
    @Schema(description = "开始时间")
    private LocalDateTime startAt;
    
    @Schema(description = "结束时间")
    private LocalDateTime endAt;
}
