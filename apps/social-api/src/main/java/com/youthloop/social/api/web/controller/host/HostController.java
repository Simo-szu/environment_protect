package com.youthloop.social.api.web.controller.host;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.host.api.dto.HostVerificationRequest;
import com.youthloop.host.api.dto.HostVerificationResponse;
import com.youthloop.host.api.facade.HostFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 主办方 Controller
 */
@Tag(name = "主办方", description = "主办方认证申请和审核")
@RestController
@RequestMapping("/api/v1/host")
@RequiredArgsConstructor
public class HostController {
    
    private final HostFacade hostFacade;
    
    @Operation(summary = "提交主办方认证申请", description = "用户提交主办方认证申请")
    @PostMapping("/verification/submit")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> submitVerification(@Valid @RequestBody UnifiedRequest<HostVerificationRequest> request) {
        hostFacade.submitVerification(request.getData());
        return BaseResponse.success(null);
    }
    
    @Operation(summary = "查询我的认证状态", description = "查询当前用户的主办方认证状态")
    @GetMapping("/verification")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<HostVerificationResponse> getMyVerification() {
        HostVerificationResponse response = hostFacade.getMyVerification();
        return BaseResponse.success(response);
    }
}
