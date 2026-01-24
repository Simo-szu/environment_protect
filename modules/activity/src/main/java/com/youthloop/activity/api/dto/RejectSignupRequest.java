package com.youthloop.activity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 审核拒绝报名请求
 */
@Data
@Schema(description = "审核拒绝报名请求")
public class RejectSignupRequest {
    
    @Schema(description = "拒绝原因")
    private String auditNote;
}
