package com.youthloop.social.api.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 预签名请求
 */
@Data
@Schema(description = "预签名请求")
public class PresignRequest {
    
    @NotBlank(message = "文件名不能为空")
    @Schema(description = "文件名", required = true, example = "avatar.jpg")
    private String fileName;
    
    @NotBlank(message = "文件类型不能为空")
    @Schema(description = "文件 MIME 类型", required = true, example = "image/jpeg")
    private String contentType;
    
    @NotBlank(message = "用途不能为空")
    @Schema(description = "用途：avatar=头像 activityPoster=活动海报", required = true, example = "avatar")
    private String purpose;
}
