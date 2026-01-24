package com.youthloop.common.util;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.security.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * 安全工具类
 * 用于获取当前登录用户信息
 */
public class SecurityUtil {
    
    /**
     * 获取当前登录用户 ID
     * @throws BizException 如果用户未登录
     */
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new BizException(ErrorCode.UNAUTHORIZED, "用户未登录");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }
        
        throw new BizException(ErrorCode.UNAUTHORIZED, "无效的认证信息");
    }
    
    /**
     * 获取当前登录用户 ID（可选）
     * @return 用户 ID，如果未登录则返回 null
     */
    public static UUID getCurrentUserIdOptional() {
        try {
            return getCurrentUserId();
        } catch (BizException e) {
            return null;
        }
    }
    
    /**
     * 获取当前用户角色
     * @return 用户角色，如果未登录则返回 USER
     */
    public static UserRole getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return UserRole.USER;
        }
        
        // 从 authorities 中提取角色
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.startsWith("ROLE_")) {
                return UserRole.fromString(role.substring(5));
            }
        }
        
        return UserRole.USER;
    }
    
    /**
     * 检查当前用户是否是管理员
     */
    public static boolean isAdmin() {
        return getCurrentUserRole() == UserRole.ADMIN;
    }
    
    /**
     * 检查当前用户是否是主办方
     */
    public static boolean isHost() {
        UserRole role = getCurrentUserRole();
        return role == UserRole.HOST || role == UserRole.ADMIN;
    }
    
    /**
     * 要求当前用户是管理员
     * @throws BizException 如果不是管理员
     */
    public static void requireAdmin() {
        if (!isAdmin()) {
            throw new BizException(ErrorCode.FORBIDDEN, "需要管理员权限");
        }
    }
    
    /**
     * 检查当前用户是否已登录
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof UUID;
    }
}
