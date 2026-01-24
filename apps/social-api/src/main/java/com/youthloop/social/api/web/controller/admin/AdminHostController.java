package com.youthloop.social.api.web.controller.admin;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.security.RequireAdmin;
import com.youthloop.host.api.dto.HostVerificationResponse;
import com.youthloop.host.api.facade.HostFacade;
import com.youthloop.social.api.web.dto.ReviewVerificationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 管理端 - 主办方认证审核 Controller
 */
@Tag(name = "管理端 - 主办方认证", description = "主办方认证审核管理")
@RestController
@RequestMapping("/api/v1/admin/host/verifications")
@RequiredArgsConstructor
@RequireAdmin
public class AdminHostController {
    
    private final HostFacade hostFacade;
    
    @Operation(summary = "获取认证申请列表", description = "查询所有主办方认证申请（待审核/已审核）")
    @GetMapping
    public BaseResponse<List<HostVerificationResponse>> getVerifications(
        @Parameter(description = "状态：1=待审核 2=已通过 3=已拒绝") @RequestParam(required = false) Integer status
    ) {
        List<HostVerificationResponse> verifications = hostFacade.getAllVerifications(status);
        return BaseResponse.success(verifications);
    }
    
    @Operation(summary = "审核认证申请", description = "管理员审核主办方认证申请（通过或拒绝）")
    @PatchMapping("/{id}")
    public BaseResponse<Void> reviewVerification(
        @Parameter(description = "认证申请 ID（即 userId）") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<ReviewVerificationRequest> request
    ) {
        ReviewVerificationRequest data = request.getData();
        hostFacade.reviewVerification(id, data.getStatus(), data.getReviewNote());
        return BaseResponse.success(null);
    }
}
