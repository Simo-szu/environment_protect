package com.youthloop.user.application.facade;

import com.youthloop.user.api.facade.UserProfileFacade;
import com.youthloop.user.application.dto.UserProfileDTO;
import com.youthloop.user.application.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * 用户档案门面实现
 */
@Service
@RequiredArgsConstructor
public class UserProfileFacadeImpl implements UserProfileFacade {
    
    private final UserProfileService userProfileService;
    
    @Override
    public UserProfileDTO getUserProfile(UUID userId) {
        return userProfileService.getUserProfile(userId);
    }
    
    @Override
    public void updateUserProfile(UUID userId, UserProfileDTO dto) {
        userProfileService.updateUserProfile(userId, dto);
    }
}
