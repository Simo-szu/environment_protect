package com.youthloop.user.application.facade;

import com.youthloop.user.api.dto.CreateUserRequest;
import com.youthloop.user.api.dto.UserBasicInfo;
import com.youthloop.user.api.facade.UserRegistrationFacade;
import com.youthloop.user.persistence.entity.UserEntity;
import com.youthloop.user.persistence.entity.UserProfileEntity;
import com.youthloop.user.persistence.mapper.UserMapper;
import com.youthloop.user.persistence.mapper.UserProfileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户注册 Facade 实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserRegistrationFacadeImpl implements UserRegistrationFacade {
    
    private final UserMapper userMapper;
    private final UserProfileMapper userProfileMapper;
    
    @Override
    @Transactional
    public UserBasicInfo createUser(CreateUserRequest request) {
        // 创建用户
        UserEntity user = new UserEntity();
        user.setId(request.getUserId());
        user.setRole(request.getRole() != null ? request.getRole() : 1); // 默认普通用户
        user.setStatus(1); // 正常状态
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);
        
        // 创建用户档案
        UserProfileEntity profile = new UserProfileEntity();
        profile.setUserId(user.getId());
        profile.setNickname(request.getNickname());
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        userProfileMapper.insert(profile);
        
        log.info("用户创建成功: userId={}, nickname={}", user.getId(), request.getNickname());
        
        // 返回基本信息
        UserBasicInfo info = new UserBasicInfo();
        info.setUserId(user.getId());
        info.setRole(user.getRole());
        info.setStatus(user.getStatus());
        info.setNickname(profile.getNickname());
        
        return info;
    }
    
    @Override
    @Transactional
    public void updateLastLoginTime(UUID userId) {
        userMapper.updateLastLoginAt(userId);
        log.debug("更新用户最后登录时间: userId={}", userId);
    }
}
