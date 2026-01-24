package com.youthloop.host.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 审核主办方认证请求
 */
@Data
@Schema(description = "审核主办方认证请求")
public class ReviewVerificationRequest {
    
    @NotNull(message = "审核状态不能为空")
    @Schema(description = "审核状态：2=通过 3=拒绝", required = true)
    private Integer status;
    
    @Schema(description = "审核备注")
    private String reviewNote;
}
