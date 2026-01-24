package com.youthloop.common.api;

import lombok.Getter;

/**
 * 统一错误码
 */
@Getter
public enum ErrorCode {
    
    // ========== 通用错误码 (0-999) ==========
    SUCCESS(0, "操作成功"),
    SYSTEM_ERROR(500, "系统错误"),
    SERVICE_UNAVAILABLE(503, "服务暂时不可用"),
    
    // ========== 客户端错误 (1000-1999) ==========
    BAD_REQUEST(1000, "请求参数错误"),
    VALIDATION_ERROR(1001, "参数校验失败"),
    MISSING_PARAMETER(1002, "缺少必要参数"),
    INVALID_PARAMETER(1003, "参数格式错误"),
    
    // ========== 认证/鉴权错误 (2000-2999) ==========
    UNAUTHORIZED(2000, "未登录或登录已过期"),
    FORBIDDEN(2003, "无权限访问"),
    TOKEN_INVALID(2001, "Token 无效"),
    TOKEN_EXPIRED(2002, "Token 已过期"),
    
    // ========== 业务错误 (3000-9999) ==========
    RESOURCE_NOT_FOUND(3000, "资源不存在"),
    RESOURCE_ALREADY_EXISTS(3001, "资源已存在"),
    OPERATION_NOT_ALLOWED(3002, "操作不被允许"),
    
    // Auth 模块 (3100-3199)
    USER_NOT_FOUND(3100, "用户不存在"),
    USER_ALREADY_EXISTS(3101, "用户已存在"),
    PASSWORD_INCORRECT(3102, "密码错误"),
    VERIFICATION_CODE_INVALID(3103, "验证码无效或已过期"),
    
    // Content 模块 (3200-3299)
    CONTENT_NOT_FOUND(3200, "内容不存在"),
    CONTENT_ALREADY_PUBLISHED(3201, "内容已发布"),
    
    // Activity 模块 (3300-3399)
    ACTIVITY_NOT_FOUND(3300, "活动不存在"),
    ACTIVITY_SESSION_FULL(3301, "活动场次已满"),
    ALREADY_SIGNED_UP(3302, "已报名该活动"),
    
    // Interaction 模块 (3400-3499)
    COMMENT_NOT_FOUND(3400, "评论不存在"),
    ALREADY_REACTED(3401, "已进行过该操作"),
    
    // Points 模块 (3500-3599)
    INSUFFICIENT_POINTS(3500, "积分不足"),
    ALREADY_SIGNED_IN(3501, "今日已签到"),
    TASK_NOT_COMPLETED(3502, "任务未完成"),
    
    // Game 模块 (3600-3699)
    GAME_SESSION_NOT_FOUND(3600, "游戏会话不存在"),
    GAME_SESSION_ALREADY_EXISTS(3601, "已有活跃的游戏会话"),
    GAME_SESSION_NOT_ACTIVE(3602, "游戏会话未激活"),
    GAME_SESSION_INVALID(3603, "无效的游戏会话"),
    
    ;
    
    private final Integer code;
    private final String message;
    
    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
