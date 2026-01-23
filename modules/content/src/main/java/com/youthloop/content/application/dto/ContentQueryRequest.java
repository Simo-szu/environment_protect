package com.youthloop.content.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 内容查询请求
 */
@Data
@Schema(description = "内容查询请求")
public class ContentQueryRequest {
    
    @Schema(description = "内容类型：1=新闻 2=动态 3=政策 4=百科（可选）")
    private Integer type;
    
    @Schema(description = "状态：1=已发布 2=草稿 3=隐藏（可选，默认只查已发布）")
    private Integer status;
    
    @Schema(description = "页码（从 1 开始）", example = "1")
    private Integer page = 1;
    
    @Schema(description = "每页数量", example = "20")
    private Integer pageSize = 20;
}
