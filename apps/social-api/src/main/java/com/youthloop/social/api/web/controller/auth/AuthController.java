package com.youthloop.social.api.web.controller.auth;

import com.youthloop.auth.api.dto.*;
import com.youthloop.auth.api.facade.AuthFacade;
import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证 Controller（按文档完整实现）
 */
@Tag(name = "认证", description = "用户注册、登录、刷新令牌、登出")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthFacade authFacade;
    
    // ==================== OTP 验证码 ====================
    
    @Operation(summary = "发送邮箱验证码", description = "发送邮箱验证码（注册/登录/重置密码）")
    @PostMapping("/otp/email")
    public BaseResponse<Void> sendEmailOtp(@Valid @RequestBody UnifiedRequest<SendOtpRequest> request) {
        authFacade.sendEmailOtp(request.getData());
        return BaseResponse.success("验证码已发送", null);
    }
    

    
    // ==================== 注册 ====================
    
    @Operation(summary = "邮箱注册", description = "使用邮箱+验证码+密码注册")
    @PostMapping("/register/email")
    public BaseResponse<AuthResponse> registerByEmail(@Valid @RequestBody UnifiedRequest<EmailRegisterRequest> request) {
        AuthResponse response = authFacade.registerByEmail(request.getData());
        return BaseResponse.success("注册成功", response);
    }
    

    
    // ==================== 登录 ====================
    
    @Operation(summary = "邮箱验证码登录", description = "使用邮箱+验证码登录")
    @PostMapping("/login/otp/email")
    public BaseResponse<AuthResponse> loginByEmailOtp(@Valid @RequestBody UnifiedRequest<OtpLoginRequest> request) {
        AuthResponse response = authFacade.loginByEmailOtp(request.getData());
        return BaseResponse.success("登录成功", response);
    }
    

    
    @Operation(summary = "账号密码登录", description = "使用邮箱+密码登录")

    @PostMapping("/login/password")
    public BaseResponse<AuthResponse> loginByPassword(@Valid @RequestBody UnifiedRequest<PasswordLoginRequest> request) {
        AuthResponse response = authFacade.loginByPassword(request.getData());
        return BaseResponse.success("登录成功", response);
    }
    
    @Operation(summary = "Google登录", description = "使用Google ID Token登录或注册")
    @PostMapping("/login/google")
    public BaseResponse<AuthResponse> loginByGoogle(@Valid @RequestBody UnifiedRequest<GoogleLoginRequest> request) {
        AuthResponse response = authFacade.loginByGoogle(request.getData());
        return BaseResponse.success("登录成功", response);
    }

    
    // ==================== 密码管理 ====================
    
    @Operation(summary = "重置密码", description = "找回/重置密码（账号+验证码+新密码）")
    @PostMapping("/password/reset")
    public BaseResponse<Void> resetPassword(@Valid @RequestBody UnifiedRequest<ResetPasswordRequest> request) {
        authFacade.resetPassword(request.getData());
        return BaseResponse.success("密码重置成功", null);
    }
    
    // ==================== Token 管理 ====================
    
    @Operation(summary = "刷新令牌", description = "使用刷新令牌获取新的访问令牌")
    @PostMapping("/token/refresh")
    public BaseResponse<AuthResponse> refreshToken(@Valid @RequestBody UnifiedRequest<RefreshTokenRequest> request) {
        AuthResponse response = authFacade.refreshToken(request.getData().getRefreshToken());
        return BaseResponse.success("刷新成功", response);
    }
    
    @Operation(summary = "登出", description = "撤销刷新令牌")
    @PostMapping("/logout")
    public BaseResponse<Void> logout(@Valid @RequestBody UnifiedRequest<RefreshTokenRequest> request) {
        authFacade.logout(request.getData().getRefreshToken());
        return BaseResponse.success("登出成功", null);
    }
}
