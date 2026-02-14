package com.youthloop.user.persistence.repository;

import com.youthloop.user.domain.model.UserProfile;
import com.youthloop.user.domain.repository.UserProfileRepository;
import com.youthloop.user.persistence.entity.UserProfileEntity;
import com.youthloop.user.persistence.mapper.UserProfileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户档案仓储实现
 */
@Repository
@RequiredArgsConstructor
public class UserProfileRepositoryImpl implements UserProfileRepository {
    
    private final UserProfileMapper userProfileMapper;
    
    @Override
    public UserProfile findByUserId(UUID userId) {
        UserProfileEntity entity = userProfileMapper.selectByUserId(userId);
        return entity == null ? null : toModel(entity);
    }
    
    @Override
    public void save(UserProfile profile) {
        UserProfileEntity entity = toEntity(profile);
        
        // 检查是否已存在
        UserProfileEntity existing = userProfileMapper.selectByUserId(profile.getUserId());
        
        if (existing == null) {
            // 新增
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            userProfileMapper.insert(entity);
        } else {
            // 更新
            entity.setUpdatedAt(LocalDateTime.now());
            userProfileMapper.update(entity);
        }
    }
    
    @Override
    public void deleteByUserId(UUID userId) {
        userProfileMapper.deleteByUserId(userId);
    }
    
    /**
     * Entity 转 Model
     */
    private UserProfile toModel(UserProfileEntity entity) {
        UserProfile model = new UserProfile();
        model.setUserId(entity.getUserId());
        model.setNickname(entity.getNickname());
        model.setAvatarUrl(entity.getAvatarUrl());
        model.setRole(entity.getRole());
        model.setGender(entity.getGender());
        model.setBirthday(entity.getBirthday());
        model.setHometown(entity.getHometown());
        model.setBio(entity.getBio());
        model.setLocation(entity.getLocation());
        model.setCreatedAt(entity.getCreatedAt());
        model.setUpdatedAt(entity.getUpdatedAt());
        return model;
    }
    
    /**
     * Model 转 Entity
     */
    private UserProfileEntity toEntity(UserProfile model) {
        UserProfileEntity entity = new UserProfileEntity();
        entity.setUserId(model.getUserId());
        entity.setNickname(model.getNickname());
        entity.setAvatarUrl(model.getAvatarUrl());
        entity.setGender(model.getGender());
        entity.setBirthday(model.getBirthday());
        entity.setHometown(model.getHometown());
        return entity;
    }
}
