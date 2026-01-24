package com.youthloop.activity.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

/**
 * 改场次请求
 */
@Data
@Schema(description = "改场次请求")
public class ChangeSessionRequest {
    
    @NotNull(message = "新场次 ID 不能为空")
    @Schema(description = "新场次 ID", required = true)
    private UUID newSessionId;
}
