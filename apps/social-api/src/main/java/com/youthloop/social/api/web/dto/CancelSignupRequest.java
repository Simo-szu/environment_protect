package com.youthloop.social.api.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 取消报名请求
 */
@Data
@Schema(description = "取消报名请求")
public class CancelSignupRequest {
    
    @Schema(description = "取消原因")
    private String cancelNote;
}
