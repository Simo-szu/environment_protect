package com.youthloop.user.domain.repository;

import com.youthloop.user.domain.model.UserProfile;

import java.util.UUID;

/**
 * 用户档案仓储接口（Domain 层定义，Persistence 层实现）
 */
public interface UserProfileRepository {
    
    /**
     * 根据用户 ID 查询档案
     */
    UserProfile findByUserId(UUID userId);
    
    /**
     * 保存用户档案（新增或更新）
     */
    void save(UserProfile profile);
    
    /**
     * 删除用户档案
     */
    void deleteByUserId(UUID userId);
}
