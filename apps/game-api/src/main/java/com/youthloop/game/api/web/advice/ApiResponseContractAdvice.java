package com.youthloop.game.api.web.advice;

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
 * Annotation-based response contract validation.
 * Only methods annotated with @ApiResponseContract are validated.
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
                "Method %s is annotated with @ApiResponseContract but does not return ApiSpecResponse",
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
                        "Method %s declares PAGE_LIST but success.data is not ApiPageData",
                        returnType.getExecutable().toGenericString()
                    ));
                }
            }
            case DETAIL, COMMAND -> {
                if (data == null) {
                    throw new IllegalStateException(String.format(
                        "Method %s declares %s but success.data is null",
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
