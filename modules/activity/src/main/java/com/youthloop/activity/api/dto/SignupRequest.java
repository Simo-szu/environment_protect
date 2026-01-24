package com.youthloop.activity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * 活动报名请求
 */
@Data
@Schema(description = "活动报名请求")
public class SignupRequest {
    
    @NotNull(message = "活动 ID 不能为空")
    @Schema(description = "活动 ID", required = true)
    private UUID activityId;
    
    @Schema(description = "场次 ID（HOSTED 活动必填）")
    private UUID sessionId;
    
    @Email(message = "邮箱格式不正确")
    @Schema(description = "邮箱（游客必填）")
    private String email;
    
    @Schema(description = "昵称")
    private String nickname;
    
    @NotBlank(message = "真实姓名不能为空")
    @Schema(description = "真实姓名", required = true)
    private String realName;
    
    @NotBlank(message = "手机号不能为空")
    @Schema(description = "手机号", required = true)
    private String phone;
}
