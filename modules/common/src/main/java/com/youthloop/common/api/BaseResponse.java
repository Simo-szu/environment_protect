package com.youthloop.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.youthloop.common.api.contract.ApiFieldError;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Legacy class name kept for migration convenience.
 * Wire format follows API_REQUEST_RESPONSE_SPEC.md.
 */
@Deprecated(since = "0.1.0", forRemoval = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Unified API response envelope")
public class BaseResponse<T> {

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

    @Deprecated(since = "0.1.0", forRemoval = true)
    public static <T> BaseResponse<T> success() {
        return new BaseResponse<>(true, null, emptyPayload(), null, null);
    }

    @Deprecated(since = "0.1.0", forRemoval = true)
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(true, null, dataOrEmpty(data), null, null);
    }

    @Deprecated(since = "0.1.0", forRemoval = true)
    public static <T> BaseResponse<T> success(String ignoredMessage, T data) {
        return new BaseResponse<>(true, null, dataOrEmpty(data), null, null);
    }

    @Deprecated(since = "0.1.0", forRemoval = true)
    public static <T> BaseResponse<T> error(ErrorCode errorCode) {
        return new BaseResponse<>(false, errorCode.getMessage(), null, null, null);
    }

    @Deprecated(since = "0.1.0", forRemoval = true)
    public static <T> BaseResponse<T> error(ErrorCode errorCode, String message) {
        return new BaseResponse<>(false, message, null, null, null);
    }

    @Deprecated(since = "0.1.0", forRemoval = true)
    public static <T> BaseResponse<T> error(Integer ignoredCode, String message) {
        return new BaseResponse<>(false, message, null, null, null);
    }

    @Deprecated(since = "0.1.0", forRemoval = true)
    public static <T> BaseResponse<T> error(String message, List<ApiFieldError> errors) {
        return new BaseResponse<>(false, message, null, errors, null);
    }

    @Deprecated(since = "0.1.0", forRemoval = true)
    public BaseResponse<T> withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }

    @Deprecated(since = "0.1.0", forRemoval = true)
    public BaseResponse<T> withErrors(List<ApiFieldError> errors) {
        this.errors = errors;
        return this;
    }

    @SuppressWarnings("unchecked")
    private static <T> T emptyPayload() {
        return (T) Collections.emptyMap();
    }

    private static <T> T dataOrEmpty(T data) {
        return data == null ? emptyPayload() : data;
    }
}
