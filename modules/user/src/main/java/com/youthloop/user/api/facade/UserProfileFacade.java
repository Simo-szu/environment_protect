package com.youthloop.user.api.facade;

import com.youthloop.user.application.dto.UserProfileDTO;

import java.util.UUID;

/**
 * 用户档案门面（对外契约）
 */
public interface UserProfileFacade {
    
    /**
     * 获取用户档案
     */
    UserProfileDTO getUserProfile(UUID userId);
    
    /**
     * 更新用户档案
     */
    void updateUserProfile(UUID userId, UserProfileDTO dto);
}
