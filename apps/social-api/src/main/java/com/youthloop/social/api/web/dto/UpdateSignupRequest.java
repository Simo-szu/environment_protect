package com.youthloop.social.api.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.UUID;

/**
 * 修改报名请求
 */
@Data
@Schema(description = "修改报名请求")
public class UpdateSignupRequest {
    
    @Schema(description = "新场次 ID（改场次时提供）")
    private UUID newSessionId;
    
    @Schema(description = "昵称")
    private String nickname;
    
    @Schema(description = "真实姓名")
    private String realName;
    
    @Schema(description = "手机号")
    private String phone;
    
    @Schema(description = "游客邮箱（游客操作时必填）")
    private String guestEmail;
}
