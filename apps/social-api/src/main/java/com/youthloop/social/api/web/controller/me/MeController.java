package com.youthloop.social.api.web.controller.me;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.user.api.facade.UserProfileFacade;
import com.youthloop.user.application.dto.UserProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 当前用户 Controller
 * 所有接口都操作当前登录用户的数据
 */
@Tag(name = "当前用户", description = "当前登录用户的个人信息管理")
@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class MeController {
    
    private final UserProfileFacade userProfileFacade;
    
    @Operation(summary = "获取我的档案", description = "获取当前登录用户的档案信息")
    @GetMapping("/profile")
    public BaseResponse<UserProfileDTO> getMyProfile() {
        UUID userId = SecurityUtil.getCurrentUserId();
        UserProfileDTO profile = userProfileFacade.getUserProfile(userId);
        return BaseResponse.success(profile);
    }
    
    @Operation(summary = "更新我的档案", description = "更新当前登录用户的档案信息")
    @PostMapping("/profile")
    public BaseResponse<Void> updateMyProfile(@Valid @RequestBody UnifiedRequest<UserProfileDTO> request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        userProfileFacade.updateUserProfile(userId, request.getData());
        return BaseResponse.success("档案更新成功", null);
    }
}
