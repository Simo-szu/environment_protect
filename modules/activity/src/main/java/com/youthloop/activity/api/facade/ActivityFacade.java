package com.youthloop.activity.api.facade;

import com.youthloop.activity.api.dto.SignupRequest;
import com.youthloop.activity.api.dto.SignupResponse;
import com.youthloop.activity.application.service.ActivitySignupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * 活动 Facade（对外统一接口）
 */
@Component
@RequiredArgsConstructor
public class ActivityFacade {
    
    private final ActivitySignupService activitySignupService;
    
    /**
     * 报名活动
     */
    public SignupResponse signup(SignupRequest request) {
        return activitySignupService.signup(request);
    }
    
    /**
     * 取消报名
     */
    public void cancelSignup(UUID signupId, String cancelNote) {
        activitySignupService.cancelSignup(signupId, cancelNote);
    }
    
    /**
     * 改场次
     */
    public void changeSession(UUID signupId, UUID newSessionId) {
        activitySignupService.changeSession(signupId, newSessionId);
    }
    
    /**
     * 审核报名
     */
    public void auditSignup(UUID signupId, Integer status, String auditNote) {
        activitySignupService.auditSignup(signupId, status, auditNote);
    }
}
