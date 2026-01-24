package com.youthloop.auth.application.facade;

import com.youthloop.auth.api.dto.*;
import com.youthloop.auth.api.facade.AuthFacade;
import com.youthloop.auth.application.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 认证门面实现
 */
@Service
@RequiredArgsConstructor
public class AuthFacadeImpl implements AuthFacade {
    
    private final AuthService authService;
    
    @Override
    public void sendEmailOtp(SendOtpRequest request) {
        authService.sendEmailOtp(request);
    }
    
    @Override
    public void sendPhoneOtp(SendOtpRequest request) {
        authService.sendPhoneOtp(request);
    }
    
    @Override
    public AuthResponse registerByEmail(EmailRegisterRequest request) {
        return authService.registerByEmail(request);
    }
    
    @Override
    public AuthResponse registerByPhone(PhoneRegisterRequest request) {
        return authService.registerByPhone(request);
    }
    
    @Override
    public AuthResponse loginByEmailOtp(OtpLoginRequest request) {
        return authService.loginByEmailOtp(request);
    }
    
    @Override
    public AuthResponse loginByPhoneOtp(OtpLoginRequest request) {
        return authService.loginByPhoneOtp(request);
    }
    
    @Override
    public AuthResponse loginByPassword(PasswordLoginRequest request) {
        return authService.loginByPassword(request);
    }
    
    @Override
    public void resetPassword(ResetPasswordRequest request) {
        authService.resetPassword(request);
    }
    
    @Override
    public AuthResponse refreshToken(String refreshToken) {
        return authService.refreshToken(refreshToken);
    }
    
    @Override
    public void logout(String refreshToken) {
        authService.logout(refreshToken);
    }
}
