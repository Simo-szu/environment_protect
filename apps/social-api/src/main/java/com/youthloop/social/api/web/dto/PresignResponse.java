package com.youthloop.social.api.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 预签名响应
 */
@Data
@Schema(description = "预签名响应")
public class PresignResponse {
    
    @Schema(description = "上传 URL（用于 PUT 请求上传文件）", example = "https://s3.amazonaws.com/bucket/key?signature=...")
    private String uploadUrl;
    
    @Schema(description = "文件访问 URL（上传成功后的文件地址）", example = "https://cdn.example.com/files/avatar.jpg")
    private String fileUrl;
    
    @Schema(description = "过期时间（秒）", example = "3600")
    private Integer expiresIn;
}
