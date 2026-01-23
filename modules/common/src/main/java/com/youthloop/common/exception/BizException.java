package com.youthloop.common.exception;

import com.youthloop.common.api.ErrorCode;
import lombok.Getter;

/**
 * 业务异常
 */
@Getter
public class BizException extends RuntimeException {
    
    private final Integer code;
    private final String message;
    
    public BizException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
    }
    
    public BizException(ErrorCode errorCode, String message) {
        super(message);
        this.code = errorCode.getCode();
        this.message = message;
    }
    
    public BizException(Integer code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
