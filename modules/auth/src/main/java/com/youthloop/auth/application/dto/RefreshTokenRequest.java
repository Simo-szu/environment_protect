package com.youthloop.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 刷新令牌请求
 */
@Data
@Schema(description = "刷新令牌请求")
public class RefreshTokenRequest {
    
    @Schema(description = "刷新令牌")
    @NotBlank(message = "刷新令牌不能为空")
    private String refreshToken;
}
