package com.youthloop.common.api.contract;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 新版 API 响应结构（与 API_REQUEST_RESPONSE_SPEC.md 对齐）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "统一 API 响应结构")
public class ApiSpecResponse<T> {

    @Schema(description = "是否成功", example = "true")
    private Boolean success;

    @Schema(description = "提示消息（失败时建议必填）", example = "参数校验失败")
    private String message;

    @Schema(description = "业务数据")
    private T data;

    @Schema(description = "字段级错误明细")
    private List<ApiFieldError> errors;

    @Schema(description = "链路追踪 ID", example = "a1b2c3d4e5f6g7h8")
    private String traceId;

    public static <T> ApiSpecResponse<T> ok(T data) {
        return new ApiSpecResponse<>(true, null, data, null, null);
    }

    public static <T> ApiSpecResponse<T> fail(String message) {
        return new ApiSpecResponse<>(false, message, null, null, null);
    }

    public static <T> ApiSpecResponse<T> fail(String message, List<ApiFieldError> errors) {
        return new ApiSpecResponse<>(false, message, null, errors, null);
    }

    public ApiSpecResponse<T> withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }
}
