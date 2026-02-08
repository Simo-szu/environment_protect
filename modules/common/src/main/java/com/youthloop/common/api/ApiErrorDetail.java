package com.youthloop.common.api;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 字段级错误详情
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "字段级错误详情")
public class ApiErrorDetail {

    @Schema(description = "错误字段路径", example = "data.email")
    private String field;

    @Schema(description = "错误原因", example = "邮箱格式不正确")
    private String reason;
}
