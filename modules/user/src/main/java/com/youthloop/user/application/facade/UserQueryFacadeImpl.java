package com.youthloop.user.application.facade;

import com.youthloop.user.api.dto.UserBasicInfo;
import com.youthloop.user.api.facade.UserQueryFacade;
import com.youthloop.user.persistence.entity.UserEntity;
import com.youthloop.user.persistence.entity.UserProfileEntity;
import com.youthloop.user.persistence.mapper.UserMapper;
import com.youthloop.user.persistence.mapper.UserProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 用户查询 Facade 实现
 */
@Service
@RequiredArgsConstructor
public class UserQueryFacadeImpl implements UserQueryFacade {
    
    private final UserMapper userMapper;
    private final UserProfileMapper userProfileMapper;
    
    @Override
    @Transactional(readOnly = true)
    public UserBasicInfo getUserBasicInfo(UUID userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        
        UserProfileEntity profile = userProfileMapper.selectByUserId(userId);
        
        UserBasicInfo info = new UserBasicInfo();
        info.setUserId(user.getId());
        info.setRole(user.getRole());
        info.setStatus(user.getStatus());
        
        if (profile != null) {
            info.setNickname(profile.getNickname());
            info.setAvatarUrl(profile.getAvatarUrl());
        }
        
        return info;
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isUserActive(UUID userId) {
        UserEntity user = userMapper.selectById(userId);
        return user != null && user.getStatus() == 1;
    }
}
