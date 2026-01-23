package com.youthloop.social.api.web.controller;

import com.youthloop.auth.application.dto.AuthResponse;
import com.youthloop.auth.application.dto.LoginRequest;
import com.youthloop.auth.application.dto.RefreshTokenRequest;
import com.youthloop.auth.application.dto.RegisterRequest;
import com.youthloop.auth.application.service.AuthService;
import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 认证 Controller
 */
@Tag(name = "认证", description = "用户注册、登录、刷新令牌、登出")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @Operation(summary = "用户注册", description = "使用邮箱和密码注册新用户")
    @PostMapping("/register")
    public BaseResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return BaseResponse.success("注册成功", response);
    }
    
    @Operation(summary = "用户登录", description = "使用邮箱和密码登录")
    @PostMapping("/login")
    public BaseResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return BaseResponse.success("登录成功", response);
    }
    
    @Operation(summary = "刷新令牌", description = "使用刷新令牌获取新的访问令牌")
    @PostMapping("/refresh")
    public BaseResponse<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return BaseResponse.success("刷新成功", response);
    }
    
    @Operation(summary = "用户登出", description = "撤销刷新令牌")
    @PostMapping("/logout")
    public BaseResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return BaseResponse.success("登出成功", null);
    }
    
    @Operation(summary = "登出所有设备", description = "撤销当前用户的所有刷新令牌（需要登录）")
    @PostMapping("/logout-all")
    public BaseResponse<Void> logoutAll() {
        UUID userId = SecurityUtil.getCurrentUserId();
        authService.logoutAll(userId);
        return BaseResponse.success("已登出所有设备", null);
    }
}
