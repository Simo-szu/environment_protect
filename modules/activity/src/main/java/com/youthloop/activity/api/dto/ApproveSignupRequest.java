package com.youthloop.activity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 审核通过报名请求
 */
@Data
@Schema(description = "审核通过报名请求")
public class ApproveSignupRequest {
    
    @Schema(description = "审核备注")
    private String auditNote;
}
