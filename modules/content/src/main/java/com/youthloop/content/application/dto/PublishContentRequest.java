package com.youthloop.content.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 发布内容请求
 */
@Data
@Schema(description = "发布内容请求")
public class PublishContentRequest {
    
    @Schema(description = "是否立即发布", example = "true")
    private Boolean immediate = true;
}
