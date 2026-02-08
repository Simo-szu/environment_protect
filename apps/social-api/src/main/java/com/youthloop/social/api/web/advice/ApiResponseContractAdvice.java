package com.youthloop.social.api.web.advice;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.util.TraceIdUtil;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

/**
 * 基于注解的响应契约校验。
 * 仅校验标注了 @ApiResponseContract 的接口，便于渐进迁移。
 */
@RestControllerAdvice
public class ApiResponseContractAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return returnType.hasMethodAnnotation(ApiResponseContract.class);
    }

    @Override
    public Object beforeBodyWrite(
        Object body,
        MethodParameter returnType,
        MediaType selectedContentType,
        Class<? extends HttpMessageConverter<?>> selectedConverterType,
        ServerHttpRequest request,
        ServerHttpResponse response
    ) {
        ApiResponseContract contract = returnType.getMethodAnnotation(ApiResponseContract.class);
        if (contract == null) {
            return body;
        }

        if (!(body instanceof ApiSpecResponse<?> apiBody)) {
            throw new IllegalStateException(String.format(
                "接口 %s 标注了 @ApiResponseContract，但返回类型不是 ApiSpecResponse",
                returnType.getExecutable().toGenericString()
            ));
        }

        if (apiBody.getTraceId() == null || apiBody.getTraceId().isEmpty()) {
            apiBody.setTraceId(TraceIdUtil.getTraceId());
        }

        if (Boolean.TRUE.equals(apiBody.getSuccess())) {
            validateSuccessData(contract.value(), apiBody.getData(), returnType);
        }

        return apiBody;
    }

    private void validateSuccessData(ApiEndpointKind kind, Object data, MethodParameter returnType) {
        switch (kind) {
            case PAGE_LIST -> {
                if (!(data instanceof ApiPageData<?>)) {
                    throw new IllegalStateException(String.format(
                        "接口 %s 声明为 PAGE_LIST，但 success.data 不是 ApiPageData",
                        returnType.getExecutable().toGenericString()
                    ));
                }
            }
            case DETAIL, COMMAND -> {
                if (data == null) {
                    throw new IllegalStateException(String.format(
                        "接口 %s 声明为 %s，但 success.data 不能为空",
                        returnType.getExecutable().toGenericString(),
                        kind
                    ));
                }
            }
            default -> {
            }
        }
    }
}
