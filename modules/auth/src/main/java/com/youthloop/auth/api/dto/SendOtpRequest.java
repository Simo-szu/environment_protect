package com.youthloop.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 发送验证码请求
 */
@Data
@Schema(description = "发送验证码请求")
public class SendOtpRequest {
    
    @Schema(description = "邮箱（邮箱验证码时必填）", example = "user@example.com")
    @Email(message = "邮箱格式不正确")
    private String email;
    

    
    @Schema(description = "验证码用途", example = "register", allowableValues = {"register", "login", "reset_password"})
    @NotBlank(message = "用途不能为空")
    private String purpose;
}
