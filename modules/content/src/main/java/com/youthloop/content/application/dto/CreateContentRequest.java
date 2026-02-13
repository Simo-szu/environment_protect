package com.youthloop.content.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 创建内容请求
 */
@Data
@Schema(description = "创建内容请求")
public class CreateContentRequest {
    
    @NotNull(message = "内容类型不能为空")
    @Schema(description = "内容类型：1=新闻 2=动态 3=政策 4=百科", example = "1")
    private Integer type;
    
    @NotBlank(message = "标题不能为空")
    @Schema(description = "标题", example = "青年环保行动")
    private String title;
    
    @Schema(description = "摘要", example = "越来越多的青年人加入到环保行动中")
    private String summary;
    
    @Schema(description = "封面图 URL", example = "https://example.com/cover.jpg")
    private String coverUrl;
    
    @NotBlank(message = "正文不能为空")
    @Schema(description = "正文（支持 Markdown）")
    private String body;
    
    @NotNull(message = "来源类型不能为空")
    @Schema(description = "来源类型：1=人工创建 2=爬取", example = "1")
    private Integer sourceType;
    
    @Schema(description = "来源 URL（爬取时必填）")
    private String sourceUrl;

    @Schema(description = "来源发布时间（爬取时可传）")
    private LocalDateTime publishedAt;
    
    @Schema(description = "状态：1=已发布 2=草稿 3=隐藏", example = "2")
    private Integer status = 2; // 默认草稿
}
