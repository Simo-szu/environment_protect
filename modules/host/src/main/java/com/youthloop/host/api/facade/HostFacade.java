package com.youthloop.host.api.facade;

import com.youthloop.host.api.dto.HostVerificationRequest;
import com.youthloop.host.api.dto.HostVerificationResponse;
import com.youthloop.host.application.service.HostVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * 主办方 Facade（对外统一接口）
 */
@Component
@RequiredArgsConstructor
public class HostFacade {
    
    private final HostVerificationService hostVerificationService;
    
    /**
     * 提交主办方认证申请
     */
    public void submitVerification(HostVerificationRequest request) {
        hostVerificationService.submitVerification(request);
    }
    
    /**
     * 查询当前用户的认证状态
     */
    public HostVerificationResponse getMyVerification() {
        return hostVerificationService.getMyVerification();
    }
    
    /**
     * 查询所有认证申请（管理员）
     */
    public List<HostVerificationResponse> getAllVerifications(Integer status) {
        return hostVerificationService.getAllVerifications(status);
    }
    
    /**
     * 审核主办方认证（管理员）
     */
    public void reviewVerification(UUID userId, Integer status, String reviewNote) {
        hostVerificationService.reviewVerification(userId, status, reviewNote);
    }
}
