package com.youthloop.common.api.contract;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 字段级错误信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "字段级错误信息")
public class ApiFieldError {

    @Schema(description = "字段名", example = "email")
    private String field;

    @Schema(description = "错误信息", example = "邮箱格式不正确")
    private String message;
}
