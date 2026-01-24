package com.youthloop.social.api.web.controller.user;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.user.api.facade.UserProfileFacade;
import com.youthloop.user.application.dto.UserProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 用户档案 Controller（公开查询接口）
 * 注意：更新接口已移至 /api/v1/me，此处仅保留查询功能
 */
@Tag(name = "用户档案", description = "用户档案查询接口（公开）")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserProfileController {
    
    private final UserProfileFacade userProfileFacade;
    
    @Operation(summary = "获取用户档案", description = "根据用户 ID 获取档案信息（公开接口，无需登录）")
    @GetMapping("/{userId}/profile")
    public BaseResponse<UserProfileDTO> getUserProfile(@PathVariable UUID userId) {
        UserProfileDTO profile = userProfileFacade.getUserProfile(userId);
        return BaseResponse.success(profile);
    }
}
