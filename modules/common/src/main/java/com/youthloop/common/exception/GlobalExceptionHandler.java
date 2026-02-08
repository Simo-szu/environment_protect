package com.youthloop.common.exception;

import com.youthloop.common.api.ApiError;
import com.youthloop.common.api.ApiErrorDetail;
import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.util.TraceIdUtil;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    @ResponseStatus(HttpStatus.OK)
    public BaseResponse<?> handleBizException(BizException e) {
        log.warn("业务异常: code={}, message={}, traceId={}",
            e.getCode(), e.getMessage(), TraceIdUtil.getTraceId());
        return BaseResponse.error(e.getCode(), e.getMessage())
            .withError(buildError(
                "https://api.youthloop.com/errors/business_error",
                HttpStatus.OK.value(),
                Collections.emptyList()
            ))
            .withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleValidationException(MethodArgumentNotValidException e) {
        List<ApiErrorDetail> details = e.getBindingResult().getFieldErrors().stream()
            .map(fieldError -> new ApiErrorDetail("data." + fieldError.getField(), fieldError.getDefaultMessage()))
            .collect(Collectors.toList());
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        log.warn("参数校验失败: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.VALIDATION_ERROR, message)
            .withError(buildError(
                "https://api.youthloop.com/errors/validation_error",
                HttpStatus.BAD_REQUEST.value(),
                details
            ))
            .withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleBindException(BindException e) {
        List<ApiErrorDetail> details = e.getBindingResult().getFieldErrors().stream()
            .map(fieldError -> new ApiErrorDetail("data." + fieldError.getField(), fieldError.getDefaultMessage()))
            .collect(Collectors.toList());
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        log.warn("参数绑定失败: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.VALIDATION_ERROR, message)
            .withError(buildError(
                "https://api.youthloop.com/errors/bind_error",
                HttpStatus.BAD_REQUEST.value(),
                details
            ))
            .withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleConstraintViolationException(ConstraintViolationException e) {
        List<ApiErrorDetail> details = e.getConstraintViolations().stream()
            .map(violation -> new ApiErrorDetail(violation.getPropertyPath().toString(), violation.getMessage()))
            .collect(Collectors.toList());
        String message = e.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.joining("; "));
        log.warn("约束校验失败: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.VALIDATION_ERROR, message)
            .withError(buildError(
                "https://api.youthloop.com/errors/constraint_violation",
                HttpStatus.BAD_REQUEST.value(),
                details
            ))
            .withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleMissingParameterException(MissingServletRequestParameterException e) {
        String message = String.format("缺少必要参数: %s", e.getParameterName());
        log.warn("{}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.MISSING_PARAMETER, message)
            .withError(buildError(
                "https://api.youthloop.com/errors/missing_parameter",
                HttpStatus.BAD_REQUEST.value(),
                List.of(new ApiErrorDetail(e.getParameterName(), message))
            ))
            .withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleTypeMismatchException(MethodArgumentTypeMismatchException e) {
        String message = String.format("参数类型错误: %s", e.getName());
        log.warn("{}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.INVALID_PARAMETER, message)
            .withError(buildError(
                "https://api.youthloop.com/errors/invalid_parameter",
                HttpStatus.BAD_REQUEST.value(),
                List.of(new ApiErrorDetail(e.getName(), message))
            ))
            .withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public BaseResponse<?> handleException(Exception e) {
        log.error("系统异常: traceId={}", TraceIdUtil.getTraceId(), e);
        return BaseResponse.error(ErrorCode.SYSTEM_ERROR)
            .withError(buildError(
                "https://api.youthloop.com/errors/system_error",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                Collections.emptyList()
            ))
            .withTraceId(TraceIdUtil.getTraceId());
    }

    private ApiError buildError(String type, Integer httpStatus, List<ApiErrorDetail> details) {
        return new ApiError(type, httpStatus, details);
    }
}
