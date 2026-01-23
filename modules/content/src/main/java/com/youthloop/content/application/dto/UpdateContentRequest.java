package com.youthloop.content.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 更新内容请求
 */
@Data
@Schema(description = "更新内容请求")
public class UpdateContentRequest {
    
    @Schema(description = "内容类型：1=新闻 2=动态 3=政策 4=百科")
    private Integer type;
    
    @Schema(description = "标题")
    private String title;
    
    @Schema(description = "摘要")
    private String summary;
    
    @Schema(description = "封面图 URL")
    private String coverUrl;
    
    @Schema(description = "正文（支持 Markdown）")
    private String body;
    
    @Schema(description = "状态：1=已发布 2=草稿 3=隐藏")
    private Integer status;
}
