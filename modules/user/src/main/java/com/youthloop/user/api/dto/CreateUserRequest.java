package com.youthloop.user.api.dto;

import lombok.Data;

import java.util.UUID;

/**
 * 创建用户请求 DTO（跨模块调用）
 */
@Data
public class CreateUserRequest {
    
    /**
     * 用户 ID（由调用方生成）
     */
    private UUID userId;
    
    /**
     * 昵称
     */
    private String nickname;
    
    /**
     * 角色：1=普通用户 2=主办方 3=管理员
     */
    private Integer role;
}
