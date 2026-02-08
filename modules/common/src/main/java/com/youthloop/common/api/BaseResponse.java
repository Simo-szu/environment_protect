package com.youthloop.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一响应格式
 * 
 * @param <T> 数据类型
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "统一响应格式")
public class BaseResponse<T> {
    
    /**
     * 业务状态码（0 表示成功）
     */
    @Schema(description = "业务状态码（0 表示成功）", example = "0")
    private Integer code;
    
    /**
     * 响应消息
     */
    @Schema(description = "响应消息", example = "操作成功")
    private String message;
    
    /**
     * 响应数据
     */
    @Schema(description = "响应数据")
    private T data;
    
    /**
     * 追踪 ID（用于日志追踪）
     */
    @Schema(description = "追踪 ID（用于日志追踪）", example = "a1b2c3d4e5f6g7h8")
    private String traceId;

    /**
     * 结构化错误信息（成功时为空）
     */
    @Schema(description = "结构化错误信息（成功时为空）")
    private ApiError error;
    
    /**
     * 成功响应（无数据）
     */
    public static <T> BaseResponse<T> success() {
        return new BaseResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), null, null, null);
    }
    
    /**
     * 成功响应（带数据）
     */
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), data, null, null);
    }
    
    /**
     * 成功响应（带消息和数据）
     */
    public static <T> BaseResponse<T> success(String message, T data) {
        return new BaseResponse<>(ErrorCode.SUCCESS.getCode(), message, data, null, null);
    }
    
    /**
     * 失败响应
     */
    public static <T> BaseResponse<T> error(ErrorCode errorCode) {
        return new BaseResponse<>(errorCode.getCode(), errorCode.getMessage(), null, null, null);
    }
    
    /**
     * 失败响应（自定义消息）
     */
    public static <T> BaseResponse<T> error(ErrorCode errorCode, String message) {
        return new BaseResponse<>(errorCode.getCode(), message, null, null, null);
    }
    
    /**
     * 失败响应（完整参数）
     */
    public static <T> BaseResponse<T> error(Integer code, String message) {
        return new BaseResponse<>(code, message, null, null, null);
    }
    
    /**
     * 设置 traceId
     */
    public BaseResponse<T> withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }

    /**
     * 设置结构化错误信息
     */
    public BaseResponse<T> withError(ApiError error) {
        this.error = error;
        return this;
    }
}
