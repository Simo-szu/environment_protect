package com.youthloop.social.api.web.controller.admin;

import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.RequireAdmin;
import com.youthloop.host.api.dto.HostVerificationResponse;
import com.youthloop.host.api.facade.HostFacade;
import com.youthloop.social.api.web.dto.ReviewVerificationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "管理端-主办方认证", description = "主办方认证审核管理")
@RestController
@RequestMapping("/api/v1/admin/host/verifications")
@RequiredArgsConstructor
@RequireAdmin
public class AdminHostController {

    private final HostFacade hostFacade;

    @Operation(summary = "获取认证申请列表", description = "查询所有主办方认证申请")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<HostVerificationResponse>> getVerifications(
        @Parameter(description = "状态") @RequestParam(required = false) Integer status
    ) {
        List<HostVerificationResponse> verifications = hostFacade.getAllVerifications(status);
        ApiPageData<HostVerificationResponse> pageData = new ApiPageData<>(
            1,
            verifications.size(),
            (long) verifications.size(),
            verifications
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "审核认证申请", description = "管理员审核主办方认证申请")
    @PatchMapping("/{id}")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> reviewVerification(
        @Parameter(description = "认证申请 ID") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<ReviewVerificationRequest> request
    ) {
        ReviewVerificationRequest data = request.getData();
        hostFacade.reviewVerification(id, data.getStatus(), data.getReviewNote());
        return ApiSpecResponse.ok(Map.of());
    }
}
