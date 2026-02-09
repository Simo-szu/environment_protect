package com.youthloop.social.api.web.controller.host;

import com.youthloop.activity.api.dto.ActivitySignupListItemDTO;
import com.youthloop.activity.api.dto.ApproveSignupRequest;
import com.youthloop.activity.api.dto.CreateActivitySessionRequest;
import com.youthloop.activity.api.dto.CreateHostActivityRequest;
import com.youthloop.activity.api.dto.RejectSignupRequest;
import com.youthloop.activity.api.dto.UpdateHostActivityRequest;
import com.youthloop.activity.api.facade.ActivityFacade;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.host.api.dto.HostVerificationRequest;
import com.youthloop.host.api.dto.HostVerificationResponse;
import com.youthloop.host.api.facade.HostFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "主办方", description = "主办方认证申请和活动管理")
@RestController
@RequestMapping("/api/v1/host")
@RequiredArgsConstructor
public class HostController {

    private final HostFacade hostFacade;
    private final ActivityFacade activityFacade;

    @Operation(summary = "提交主办方认证申请", description = "用户提交主办方认证申请")
    @PostMapping("/verification/submit")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> submitVerification(@Valid @RequestBody UnifiedRequest<HostVerificationRequest> request) {
        hostFacade.submitVerification(request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "查询我的认证状态", description = "查询当前用户主办方认证状态")
    @GetMapping("/verification")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<HostVerificationResponse> getMyVerification() {
        HostVerificationResponse response = hostFacade.getMyVerification();
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "主办方发布活动", description = "主办方发布 HOSTED 类型活动")
    @PostMapping("/activities")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<UUID> createActivity(@Valid @RequestBody UnifiedRequest<CreateHostActivityRequest> request) {
        UUID activityId = activityFacade.createHostActivity(request.getData());
        return ApiSpecResponse.ok(activityId);
    }

    @Operation(summary = "主办方编辑活动", description = "主办方编辑自己发布的活动")
    @PutMapping("/activities/{id}")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> updateActivity(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<UpdateHostActivityRequest> request
    ) {
        activityFacade.updateHostActivity(id, request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "创建/更新场次", description = "批量创建或更新活动场次")
    @PostMapping("/activities/{id}/sessions")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> createOrUpdateSessions(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<List<CreateActivitySessionRequest>> request
    ) {
        activityFacade.createOrUpdateSessions(id, request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "我发布的活动列表", description = "查询当前主办方发布的活动")
    @GetMapping("/activities")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<Map<String, Object>>> getMyActivities(
        @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<Map<String, Object>> result = activityFacade.getMyHostActivities(page, size);
        ApiPageData<Map<String, Object>> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "查看报名名单", description = "主办方查看活动报名名单")
    @GetMapping("/activities/{id}/signups")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<ActivitySignupListItemDTO>> getSignupList(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Parameter(description = "状态筛选") @RequestParam(required = false) Integer status,
        @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(defaultValue = "20") Integer size
    ) {
        PageResponse<ActivitySignupListItemDTO> result = activityFacade.getActivitySignupList(id, status, page, size);
        ApiPageData<ActivitySignupListItemDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "审核通过报名", description = "主办方或管理员审核通过报名")
    @PatchMapping("/activities/{id}/signups/{signupId}/approve")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> approveSignup(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Parameter(description = "报名 ID") @PathVariable UUID signupId,
        @Valid @RequestBody(required = false) UnifiedRequest<ApproveSignupRequest> request
    ) {
        String auditNote = request != null && request.getData() != null ? request.getData().getAuditNote() : null;
        activityFacade.auditSignup(signupId, 2, auditNote);
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "审核拒绝报名", description = "主办方或管理员审核拒绝报名")
    @PatchMapping("/activities/{id}/signups/{signupId}/reject")
    @PreAuthorize("isAuthenticated()")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> rejectSignup(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Parameter(description = "报名 ID") @PathVariable UUID signupId,
        @Valid @RequestBody(required = false) UnifiedRequest<RejectSignupRequest> request
    ) {
        String auditNote = request != null && request.getData() != null ? request.getData().getAuditNote() : null;
        activityFacade.auditSignup(signupId, 3, auditNote);
        return ApiSpecResponse.ok(Map.of());
    }
}
