package com.youthloop.common.advice;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.util.TraceIdUtil;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * TraceId 响应增强
 * 自动为所有 BaseResponse 注入 traceId
 */
@RestControllerAdvice
public class TraceIdResponseAdvice implements ResponseBodyAdvice<Object> {
    
    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // 只处理 BaseResponse 类型
        return BaseResponse.class.isAssignableFrom(returnType.getParameterType());
    }
    
    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                   Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                   ServerHttpRequest request, ServerHttpResponse response) {
        if (body instanceof BaseResponse) {
            BaseResponse<?> baseResponse = (BaseResponse<?>) body;
            // 如果 traceId 为空，自动注入
            if (baseResponse.getTraceId() == null) {
                baseResponse.setTraceId(TraceIdUtil.getTraceId());
            }
        }
        return body;
    }
}
