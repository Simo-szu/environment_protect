package com.youthloop.common.api;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 结构化错误信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "结构化错误信息")
public class ApiError {

    @Schema(description = "错误类型 URI", example = "https://api.youthloop.com/errors/validation_error")
    private String type;

    @Schema(description = "HTTP 状态码", example = "400")
    private Integer httpStatus;

    @Schema(description = "字段级错误明细")
    private List<ApiErrorDetail> details;
}
