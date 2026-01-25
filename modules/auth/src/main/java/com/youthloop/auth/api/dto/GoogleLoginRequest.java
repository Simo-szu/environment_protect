package com.youthloop.auth.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Google 登录请求")
public class GoogleLoginRequest {

    @Schema(description = "Google ID Token", requiredMode = Schema.RequiredMode.REQUIRED, example = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFh...")
    @NotBlank(message = "ID Token 不能为空")
    private String idToken;
    
    @Schema(description = "邀请码（可选）")
    private String invitationCode;
}
