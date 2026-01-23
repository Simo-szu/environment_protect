package com.youthloop.user.application.service;

import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.user.application.dto.UserProfileDTO;
import com.youthloop.user.domain.model.UserProfile;
import com.youthloop.user.domain.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 用户档案服务
 * 
 * 事务边界：Application 层负责事务管理
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileService {
    
    private final UserProfileRepository userProfileRepository;
    
    /**
     * 获取用户档案（只读事务）
     */
    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId);
        if (profile == null) {
            throw new BizException(ErrorCode.RESOURCE_NOT_FOUND, "用户档案不存在");
        }
        return toDTO(profile);
    }
    
    /**
     * 更新用户档案（写事务）
     */
    @Transactional
    public void updateUserProfile(UUID userId, UserProfileDTO dto) {
        // 查询现有档案
        UserProfile profile = userProfileRepository.findByUserId(userId);
        if (profile == null) {
            // 创建新档案
            profile = new UserProfile();
            profile.setUserId(userId);
        }
        
        // 更新字段
        if (dto.getNickname() != null) {
            profile.setNickname(dto.getNickname());
        }
        if (dto.getAvatarUrl() != null) {
            profile.setAvatarUrl(dto.getAvatarUrl());
        }
        if (dto.getGender() != null) {
            profile.setGender(dto.getGender());
        }
        if (dto.getBirthday() != null) {
            profile.setBirthday(dto.getBirthday());
        }
        if (dto.getHometown() != null) {
            profile.setHometown(dto.getHometown());
        }
        
        // 保存
        userProfileRepository.save(profile);
        
        log.info("用户档案已更新: userId={}", userId);
    }
    
    /**
     * Model 转 DTO
     */
    private UserProfileDTO toDTO(UserProfile model) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setUserId(model.getUserId());
        dto.setNickname(model.getNickname());
        dto.setAvatarUrl(model.getAvatarUrl());
        dto.setGender(model.getGender());
        dto.setBirthday(model.getBirthday());
        dto.setHometown(model.getHometown());
        return dto;
    }
}
