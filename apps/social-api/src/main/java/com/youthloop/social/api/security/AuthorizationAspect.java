package com.youthloop.social.api.security;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.security.AllowGuest;
import com.youthloop.common.security.OptionalAuth;
import com.youthloop.common.security.RequireAdmin;
import com.youthloop.common.security.RequireAuth;
import com.youthloop.common.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * 鉴权切面
 * 处理 @RequireAuth、@RequireAdmin、@OptionalAuth、@AllowGuest 注解
 */
@Slf4j
@Aspect
@Component
@Order(1) // 确保在其他切面之前执行
public class AuthorizationAspect {
    
    /**
     * 处理 @RequireAuth 注解
     */
    @Before("@annotation(com.youthloop.common.security.RequireAuth) || " +
            "@within(com.youthloop.common.security.RequireAuth)")
    public void checkRequireAuth(JoinPoint joinPoint) {
        if (!SecurityUtil.isAuthenticated()) {
            log.warn("未登录访问需要认证的接口: {}", getMethodName(joinPoint));
            throw new BizException(ErrorCode.UNAUTHORIZED, "请先登录");
        }
        log.debug("认证检查通过: {}", getMethodName(joinPoint));
    }
    
    /**
     * 处理 @RequireAdmin 注解
     */
    @Before("@annotation(com.youthloop.common.security.RequireAdmin) || " +
            "@within(com.youthloop.common.security.RequireAdmin)")
    public void checkRequireAdmin(JoinPoint joinPoint) {
        if (!SecurityUtil.isAuthenticated()) {
            log.warn("未登录访问需要管理员权限的接口: {}", getMethodName(joinPoint));
            throw new BizException(ErrorCode.UNAUTHORIZED, "请先登录");
        }
        
        if (!SecurityUtil.isAdmin()) {
            log.warn("非管理员访问管理员接口: userId={}, method={}", 
                SecurityUtil.getCurrentUserId(), getMethodName(joinPoint));
            throw new BizException(ErrorCode.FORBIDDEN, "需要管理员权限");
        }
        
        log.debug("管理员权限检查通过: userId={}, method={}", 
            SecurityUtil.getCurrentUserId(), getMethodName(joinPoint));
    }
    
    /**
     * 处理 @OptionalAuth 注解
     * 可选登录，不做任何检查，只记录日志
     */
    @Before("@annotation(com.youthloop.common.security.OptionalAuth) || " +
            "@within(com.youthloop.common.security.OptionalAuth)")
    public void checkOptionalAuth(JoinPoint joinPoint) {
        boolean authenticated = SecurityUtil.isAuthenticated();
        log.debug("可选认证接口访问: method={}, authenticated={}", 
            getMethodName(joinPoint), authenticated);
    }
    
    /**
     * 处理 @AllowGuest 注解
     * 允许游客访问，不做任何检查，只记录日志
     */
    @Before("@annotation(com.youthloop.common.security.AllowGuest) || " +
            "@within(com.youthloop.common.security.AllowGuest)")
    public void checkAllowGuest(JoinPoint joinPoint) {
        boolean authenticated = SecurityUtil.isAuthenticated();
        log.debug("允许游客接口访问: method={}, authenticated={}", 
            getMethodName(joinPoint), authenticated);
    }
    
    /**
     * 获取方法全名
     */
    private String getMethodName(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        return method.getDeclaringClass().getSimpleName() + "." + method.getName();
    }
}
