package com.youthloop.social.api.web.controller.auth;

import com.youthloop.auth.api.dto.AuthResponse;
import com.youthloop.auth.api.dto.EmailRegisterRequest;
import com.youthloop.auth.api.dto.GoogleLoginRequest;
import com.youthloop.auth.api.dto.OtpLoginRequest;
import com.youthloop.auth.api.dto.PasswordLoginRequest;
import com.youthloop.auth.api.dto.RefreshTokenRequest;
import com.youthloop.auth.api.dto.ResetPasswordRequest;
import com.youthloop.auth.api.dto.SendOtpRequest;
import com.youthloop.auth.api.facade.AuthFacade;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "认证", description = "用户注册、登录、刷新令牌、登出")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthFacade authFacade;

    @Operation(summary = "发送邮箱验证码", description = "发送邮箱验证码")
    @PostMapping("/otp/email")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> sendEmailOtp(@Valid @RequestBody UnifiedRequest<SendOtpRequest> request) {
        authFacade.sendEmailOtp(request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "邮箱注册", description = "使用邮箱+验证码+密码注册")
    @PostMapping("/register/email")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<AuthResponse> registerByEmail(@Valid @RequestBody UnifiedRequest<EmailRegisterRequest> request) {
        AuthResponse response = authFacade.registerByEmail(request.getData());
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "邮箱验证码登录", description = "使用邮箱+验证码登录")
    @PostMapping("/login/otp/email")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<AuthResponse> loginByEmailOtp(@Valid @RequestBody UnifiedRequest<OtpLoginRequest> request) {
        AuthResponse response = authFacade.loginByEmailOtp(request.getData());
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "账号密码登录", description = "使用邮箱+密码登录")
    @PostMapping("/login/password")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<AuthResponse> loginByPassword(@Valid @RequestBody UnifiedRequest<PasswordLoginRequest> request) {
        AuthResponse response = authFacade.loginByPassword(request.getData());
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "Google 登录", description = "使用 Google ID Token 登录或注册")
    @PostMapping("/login/google")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<AuthResponse> loginByGoogle(@Valid @RequestBody UnifiedRequest<GoogleLoginRequest> request) {
        AuthResponse response = authFacade.loginByGoogle(request.getData());
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "重置密码", description = "找回/重置密码")
    @PostMapping("/password/reset")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> resetPassword(@Valid @RequestBody UnifiedRequest<ResetPasswordRequest> request) {
        authFacade.resetPassword(request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "刷新令牌", description = "使用刷新令牌获取新访问令牌")
    @PostMapping("/token/refresh")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<AuthResponse> refreshToken(@Valid @RequestBody UnifiedRequest<RefreshTokenRequest> request) {
        AuthResponse response = authFacade.refreshToken(request.getData().getRefreshToken());
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "登出", description = "撤销刷新令牌")
    @PostMapping("/logout")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> logout(@Valid @RequestBody UnifiedRequest<RefreshTokenRequest> request) {
        authFacade.logout(request.getData().getRefreshToken());
        return ApiSpecResponse.ok(Map.of());
    }
}
