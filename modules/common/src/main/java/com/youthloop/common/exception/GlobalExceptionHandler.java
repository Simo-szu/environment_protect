package com.youthloop.common.exception;

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

import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * 业务异常
     */
    @ExceptionHandler(BizException.class)
    @ResponseStatus(HttpStatus.OK)
    public BaseResponse<?> handleBizException(BizException e) {
        log.warn("业务异常: code={}, message={}, traceId={}", 
            e.getCode(), e.getMessage(), TraceIdUtil.getTraceId());
        return BaseResponse.error(e.getCode(), e.getMessage())
            .withTraceId(TraceIdUtil.getTraceId());
    }
    
    /**
     * 参数校验异常 (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        log.warn("参数校验失败: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.VALIDATION_ERROR, message)
            .withTraceId(TraceIdUtil.getTraceId());
    }
    
    /**
     * 参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleBindException(BindException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        log.warn("参数绑定失败: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.VALIDATION_ERROR, message)
            .withTraceId(TraceIdUtil.getTraceId());
    }
    
    /**
     * 约束违反异常 (@Validated)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
            .map(ConstraintViolation::getMessage)
            .collect(Collectors.joining("; "));
        log.warn("约束违反: {}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.VALIDATION_ERROR, message)
            .withTraceId(TraceIdUtil.getTraceId());
    }
    
    /**
     * 缺少请求参数
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleMissingParameterException(MissingServletRequestParameterException e) {
        String message = String.format("缺少必要参数: %s", e.getParameterName());
        log.warn("{}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.MISSING_PARAMETER, message)
            .withTraceId(TraceIdUtil.getTraceId());
    }
    
    /**
     * 参数类型不匹配
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleTypeMismatchException(MethodArgumentTypeMismatchException e) {
        String message = String.format("参数类型错误: %s", e.getName());
        log.warn("{}, traceId={}", message, TraceIdUtil.getTraceId());
        return BaseResponse.error(ErrorCode.INVALID_PARAMETER, message)
            .withTraceId(TraceIdUtil.getTraceId());
    }
    
    /**
     * 系统异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public BaseResponse<?> handleException(Exception e) {
        log.error("系统异常: traceId={}", TraceIdUtil.getTraceId(), e);
        return BaseResponse.error(ErrorCode.SYSTEM_ERROR)
            .withTraceId(TraceIdUtil.getTraceId());
    }
}
