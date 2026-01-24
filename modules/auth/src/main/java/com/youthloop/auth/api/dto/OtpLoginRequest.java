package com.youthloop.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 验证码登录请求
 */
@Data
@Schema(description = "验证码登录请求")
public class OtpLoginRequest {
    
    @Schema(description = "邮箱（邮箱登录时必填）", example = "user@example.com")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Schema(description = "手机号（手机登录时必填）", example = "13800138000")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    @Schema(description = "验证码", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "验证码不能为空")
    @Size(min = 6, max = 6, message = "验证码必须为6位")
    private String otp;
}
