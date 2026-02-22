package com.youthloop.game.api.security;

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
 * Authorization aspect for auth annotations.
 */
@Slf4j
@Aspect
@Component
@Order(1)
public class AuthorizationAspect {

    @Before("@annotation(com.youthloop.common.security.RequireAuth) || " +
        "@within(com.youthloop.common.security.RequireAuth)")
    public void checkRequireAuth(JoinPoint joinPoint) {
        if (!SecurityUtil.isAuthenticated()) {
            log.warn("Unauthenticated access for @RequireAuth endpoint: {}", getMethodName(joinPoint));
            throw new BizException(ErrorCode.UNAUTHORIZED, "Please login first");
        }
    }

    @Before("@annotation(com.youthloop.common.security.RequireAdmin) || " +
        "@within(com.youthloop.common.security.RequireAdmin)")
    public void checkRequireAdmin(JoinPoint joinPoint) {
        if (!SecurityUtil.isAuthenticated()) {
            log.warn("Unauthenticated access for @RequireAdmin endpoint: {}", getMethodName(joinPoint));
            throw new BizException(ErrorCode.UNAUTHORIZED, "Please login first");
        }
        if (!SecurityUtil.isAdmin()) {
            log.warn("Forbidden access for @RequireAdmin endpoint: {}", getMethodName(joinPoint));
            throw new BizException(ErrorCode.FORBIDDEN, "Admin role required");
        }
    }

    @Before("@annotation(com.youthloop.common.security.OptionalAuth) || " +
        "@within(com.youthloop.common.security.OptionalAuth)")
    public void checkOptionalAuth(JoinPoint joinPoint) {
        boolean authenticated = SecurityUtil.isAuthenticated();
        log.debug("@OptionalAuth endpoint visited: method={}, authenticated={}", getMethodName(joinPoint), authenticated);
    }

    @Before("@annotation(com.youthloop.common.security.AllowGuest) || " +
        "@within(com.youthloop.common.security.AllowGuest)")
    public void checkAllowGuest(JoinPoint joinPoint) {
        boolean authenticated = SecurityUtil.isAuthenticated();
        log.debug("@AllowGuest endpoint visited: method={}, authenticated={}", getMethodName(joinPoint), authenticated);
    }

    private String getMethodName(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        return method.getDeclaringClass().getSimpleName() + "." + method.getName();
    }
}
