package com.youthloop.user.api.facade;

import com.youthloop.user.api.dto.CreateUserRequest;
import com.youthloop.user.api.dto.UserBasicInfo;

import java.util.UUID;

/**
 * 用户注册 Facade（供 Auth 模块调用）
 * 
 * 职责：
 * - 创建用户账号与档案
 * - 更新用户状态
 */
public interface UserRegistrationFacade {
    
    /**
     * 创建用户（包含账号和档案）
     * 
     * @param request 创建用户请求
     * @return 用户基本信息
     */
    UserBasicInfo createUser(CreateUserRequest request);
    
    /**
     * 更新用户最后登录时间
     * 
     * @param userId 用户 ID
     */
    void updateLastLoginTime(UUID userId);
}
