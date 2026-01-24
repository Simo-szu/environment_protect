package com.youthloop.user.api.dto;

import lombok.Data;

import java.util.UUID;

/**
 * 用户基本信息 DTO（跨模块查询）
 */
@Data
public class UserBasicInfo {
    
    /**
     * 用户 ID
     */
    private UUID userId;
    
    /**
     * 角色：1=普通用户 2=主办方 3=管理员
     */
    private Integer role;
    
    /**
     * 状态：1=正常 2=封禁
     */
    private Integer status;
    
    /**
     * 昵称
     */
    private String nickname;
    
    /**
     * 头像 URL
     */
    private String avatarUrl;
}
