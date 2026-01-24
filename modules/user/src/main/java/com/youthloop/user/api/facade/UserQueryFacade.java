package com.youthloop.user.api.facade;

import com.youthloop.user.api.dto.UserBasicInfo;

import java.util.UUID;

/**
 * 用户查询 Facade（供其他模块调用）
 * 
 * 职责：
 * - 查询用户基本信息
 * - 验证用户状态
 */
public interface UserQueryFacade {
    
    /**
     * 根据用户 ID 查询基本信息
     * 
     * @param userId 用户 ID
     * @return 用户基本信息，不存在返回 null
     */
    UserBasicInfo getUserBasicInfo(UUID userId);
    
    /**
     * 检查用户是否存在且状态正常
     * 
     * @param userId 用户 ID
     * @return true=存在且正常，false=不存在或已封禁
     */
    boolean isUserActive(UUID userId);
}
