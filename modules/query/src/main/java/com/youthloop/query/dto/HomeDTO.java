package com.youthloop.query.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 首页聚合 DTO
 * 包含：轮播配置 + 最新内容 + 最新活动
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "首页聚合数据")
public class HomeDTO {
    
    @Schema(description = "轮播/运营位列表")
    private List<HomeBannerDTO> banners;
    
    @Schema(description = "最新内容列表（前 10 条）")
    private List<ContentListItemDTO> latestContents;
    
    @Schema(description = "最新活动列表（前 5 条）")
    private List<ActivityListItemDTO> latestActivities;
}
