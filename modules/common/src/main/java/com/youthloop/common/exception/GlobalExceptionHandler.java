package com.youthloop.common.exception;

import com.youthloop.common.api.contract.ApiFieldError;
import com.youthloop.common.api.contract.ApiSpecResponse;
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

import java.util.List;
import java.util.stream.Collectors;

/**
 * Global exception handler with unified response envelope.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    @ResponseStatus(HttpStatus.OK)
    public ApiSpecResponse<Void> handleBizException(BizException e) {
        log.warn("Business exception: code={}, message={}, traceId={}",
            e.getCode(), e.getMessage(), TraceIdUtil.getTraceId());
        return ApiSpecResponse.<Void>fail(e.getMessage()).withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiSpecResponse<Void> handleValidationException(MethodArgumentNotValidException e) {
        List<ApiFieldError> fieldErrors = e.getBindingResult().getFieldErrors().stream()
            .map(fieldError -> new ApiFieldError(fieldError.getField(), fieldError.getDefaultMessage()))
            .collect(Collectors.toList());
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        log.warn("Validation failed: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return ApiSpecResponse.<Void>fail(message, fieldErrors).withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiSpecResponse<Void> handleBindException(BindException e) {
        List<ApiFieldError> fieldErrors = e.getBindingResult().getFieldErrors().stream()
            .map(fieldError -> new ApiFieldError(fieldError.getField(), fieldError.getDefaultMessage()))
            .collect(Collectors.toList());
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        log.warn("Binding failed: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return ApiSpecResponse.<Void>fail(message, fieldErrors).withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiSpecResponse<Void> handleConstraintViolationException(ConstraintViolationException e) {
        List<ApiFieldError> fieldErrors = e.getConstraintViolations().stream()
            .map(violation -> new ApiFieldError(violation.getPropertyPath().toString(), violation.getMessage()))
            .collect(Collectors.toList());
        String message = e.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.joining("; "));
        log.warn("Constraint violation: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return ApiSpecResponse.<Void>fail(message, fieldErrors).withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiSpecResponse<Void> handleMissingParameterException(MissingServletRequestParameterException e) {
        String message = String.format("Missing required parameter: %s", e.getParameterName());
        log.warn("{}, traceId={}", message, TraceIdUtil.getTraceId());
        return ApiSpecResponse.<Void>fail(
            message,
            List.of(new ApiFieldError(e.getParameterName(), message))
        ).withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiSpecResponse<Void> handleTypeMismatchException(MethodArgumentTypeMismatchException e) {
        String message = String.format("Invalid parameter type: %s", e.getName());
        log.warn("{}, traceId={}", message, TraceIdUtil.getTraceId());
        return ApiSpecResponse.<Void>fail(
            message,
            List.of(new ApiFieldError(e.getName(), message))
        ).withTraceId(TraceIdUtil.getTraceId());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiSpecResponse<Void> handleException(Exception e) {
        log.error("Unhandled exception, traceId={}", TraceIdUtil.getTraceId(), e);
        return ApiSpecResponse.<Void>fail("Internal server error").withTraceId(TraceIdUtil.getTraceId());
    }
}
