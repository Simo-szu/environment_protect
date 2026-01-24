package com.youthloop.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一请求体包装
 * 
 * @param <T> 业务数据类型
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "统一请求体")
public class UnifiedRequest<T> {
    
    /**
     * 请求 ID（用于幂等，可选）
     */
    @Schema(description = "请求 ID（用于幂等，可选）", example = "550e8400-e29b-41d4-a716-446655440000")
    private String requestId;
    
    /**
     * 业务数据
     */
    @Schema(description = "业务数据")
    private T data;
    
    /**
     * 创建统一请求
     */
    public static <T> UnifiedRequest<T> of(T data) {
        return new UnifiedRequest<>(null, data);
    }
    
    /**
     * 创建带请求 ID 的统一请求
     */
    public static <T> UnifiedRequest<T> of(String requestId, T data) {
        return new UnifiedRequest<>(requestId, data);
    }
}
