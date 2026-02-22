package com.youthloop.game.api.contract;

import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiFieldError;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.exception.GlobalExceptionHandler;
import com.youthloop.common.util.TraceIdUtil;
import com.youthloop.game.api.web.advice.ApiResponseContractAdvice;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.GetMapping;

import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiRuntimeContractTest {

    private final ApiResponseContractAdvice contractAdvice = new ApiResponseContractAdvice();
    private final GlobalExceptionHandler globalExceptionHandler = new GlobalExceptionHandler();

    @AfterEach
    void cleanupTraceId() {
        TraceIdUtil.clearTraceId();
    }

    @Test
    void contractAdviceShouldInjectTraceIdForAnnotatedEndpoint() throws Exception {
        Method method = DummyController.class.getDeclaredMethod("detailEndpoint");
        MethodParameter returnType = new MethodParameter(method, -1);
        ApiSpecResponse<Map<String, Object>> body = ApiSpecResponse.ok(Map.of("ok", true));

        Object result = contractAdvice.beforeBodyWrite(body, returnType, null, null, null, null);

        assertTrue(result instanceof ApiSpecResponse<?>);
        ApiSpecResponse<?> response = (ApiSpecResponse<?>) result;
        assertNotNull(response.getTraceId());
        assertFalse(response.getTraceId().isBlank());
    }

    @Test
    void contractAdviceShouldRejectNullDataForSuccessDetail() throws Exception {
        Method method = DummyController.class.getDeclaredMethod("detailEndpoint");
        MethodParameter returnType = new MethodParameter(method, -1);
        ApiSpecResponse<Object> body = ApiSpecResponse.ok(null);

        assertThrows(IllegalStateException.class,
            () -> contractAdvice.beforeBodyWrite(body, returnType, null, null, null, null));
    }

    @Test
    void contractAdviceShouldRejectNonPageDataForPageList() throws Exception {
        Method method = DummyController.class.getDeclaredMethod("pageListEndpoint");
        MethodParameter returnType = new MethodParameter(method, -1);
        ApiSpecResponse<Map<String, Object>> body = ApiSpecResponse.ok(Map.of("items", 1));

        assertThrows(IllegalStateException.class,
            () -> contractAdvice.beforeBodyWrite(body, returnType, null, null, null, null));
    }

    @Test
    void contractAdviceShouldRejectNonApiSpecResponse() throws Exception {
        Method method = DummyController.class.getDeclaredMethod("detailEndpoint");
        MethodParameter returnType = new MethodParameter(method, -1);

        assertThrows(IllegalStateException.class,
            () -> contractAdvice.beforeBodyWrite("bad-body", returnType, null, null, null, null));
    }

    @Test
    void globalExceptionHandlerShouldReturnUnifiedPayloadForBizException() {
        BizException ex = new BizException(422001, "business failed");

        ApiSpecResponse<Void> response = globalExceptionHandler.handleBizException(ex);

        assertFalse(response.getSuccess());
        assertEquals("business failed", response.getMessage());
        assertNotNull(response.getTraceId());
    }

    @Test
    void globalExceptionHandlerShouldReturnFieldErrorsForMissingParam() {
        MissingServletRequestParameterException ex = new MissingServletRequestParameterException("page", "Integer");

        ApiSpecResponse<Void> response = globalExceptionHandler.handleMissingParameterException(ex);

        assertFalse(response.getSuccess());
        assertNotNull(response.getErrors());
        assertEquals(1, response.getErrors().size());
        ApiFieldError fieldError = response.getErrors().get(0);
        assertEquals("page", fieldError.getField());
        assertNotNull(response.getTraceId());
    }

    @Test
    void globalExceptionHandlerShouldReturnUnifiedPayloadForUnhandledException() {
        ApiSpecResponse<Void> response = globalExceptionHandler.handleException(new RuntimeException("boom"));

        assertFalse(response.getSuccess());
        assertEquals("Internal server error", response.getMessage());
        assertNotNull(response.getTraceId());
    }

    @Test
    void globalExceptionHandlerMethodsShouldReturnApiSpecResponse() throws Exception {
        Method bizMethod = GlobalExceptionHandler.class.getMethod("handleBizException", BizException.class);
        Method missingParamMethod = GlobalExceptionHandler.class.getMethod(
            "handleMissingParameterException", MissingServletRequestParameterException.class
        );
        Method exceptionMethod = GlobalExceptionHandler.class.getMethod("handleException", Exception.class);

        assertEquals(ApiSpecResponse.class, bizMethod.getReturnType());
        assertEquals(ApiSpecResponse.class, missingParamMethod.getReturnType());
        assertEquals(ApiSpecResponse.class, exceptionMethod.getReturnType());
    }

    private static class DummyController {

        @GetMapping("/detail")
        @ApiResponseContract(ApiEndpointKind.DETAIL)
        public ApiSpecResponse<Map<String, Object>> detailEndpoint() {
            return ApiSpecResponse.ok(Map.of());
        }

        @GetMapping("/list")
        @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
        public ApiSpecResponse<ApiPageData<String>> pageListEndpoint() {
            return ApiSpecResponse.ok(new ApiPageData<>(1, 10, 0L, java.util.List.of()));
        }
    }
}
