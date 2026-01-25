package com.youthloop.auth.api.facade;

import com.youthloop.auth.api.dto.*;

import java.util.UUID;

/**
 * 认证门面（对外契约）
 */
public interface AuthFacade {
    
    /**
     * 发送邮箱验证码
     */
    void sendEmailOtp(SendOtpRequest request);
    

    
    /**
     * 邮箱注册
     */
    AuthResponse registerByEmail(EmailRegisterRequest request);
    

    
    /**
     * 邮箱验证码登录
     */
    AuthResponse loginByEmailOtp(OtpLoginRequest request);
    

    
    /**
     * 账号密码登录
     */
    /**
     * 账号密码登录
     */
    AuthResponse loginByPassword(PasswordLoginRequest request);

    /**
     * Google 登录/注册
     */
    AuthResponse loginByGoogle(GoogleLoginRequest request);

    
    /**
     * 重置密码
     */
    void resetPassword(ResetPasswordRequest request);
    
    /**
     * 刷新令牌
     */
    AuthResponse refreshToken(String refreshToken);
    
    /**
     * 登出
     */
    void logout(String refreshToken);
}
