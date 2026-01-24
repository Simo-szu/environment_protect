package com.youthloop.common.security;

/**
 * 用户角色枚举（对应数据库 shared.user.role）
 */
public enum UserRole {
    /**
     * 普通用户（role=1）
     */
    USER(1, "USER"),
    
    /**
     * 主办方（role=2）
     */
    HOST(2, "HOST"),
    
    /**
     * 管理员（role=3）
     */
    ADMIN(3, "ADMIN");
    
    private final int code;
    private final String name;
    
    UserRole(int code, String name) {
        this.code = code;
        this.name = name;
    }
    
    public int getCode() {
        return code;
    }
    
    public String getName() {
        return name;
    }
    
    /**
     * 从数据库代码转换
     */
    public static UserRole fromCode(Integer code) {
        if (code == null) {
            return USER;
        }
        for (UserRole role : values()) {
            if (role.code == code) {
                return role;
            }
        }
        return USER;
    }
    
    /**
     * 从字符串转换
     */
    public static UserRole fromString(String role) {
        if (role == null) {
            return USER;
        }
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return USER;
        }
    }
}
