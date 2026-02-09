package com.youthloop.common.api.contract;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * API response envelope aligned with API_REQUEST_RESPONSE_SPEC.md.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Unified API response envelope")
public class ApiSpecResponse<T> {

    @Schema(description = "Whether request succeeded", example = "true")
    private Boolean success;

    @Schema(description = "Failure message, optional on success", example = "Validation failed")
    private String message;

    @Schema(description = "Business payload")
    private T data;

    @Schema(description = "Field-level errors")
    private List<ApiFieldError> errors;

    @Schema(description = "Trace ID for log correlation", example = "a1b2c3d4e5f6g7h8")
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
