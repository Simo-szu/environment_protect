package com.youthloop.social.api.web.controller.host;

import com.youthloop.activity.api.dto.*;
import com.youthloop.activity.api.facade.ActivityFacade;
import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.PageResponse;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 主办方 Controller
 */
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
    
    // ========== 活动管理端点 ==========
    
    @Operation(summary = "主办方发布活动", description = "主办方发布 HOSTED 类型活动")
    @PostMapping("/activities")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<UUID> createActivity(@Valid @RequestBody UnifiedRequest<CreateHostActivityRequest> request) {
        UUID activityId = activityFacade.createHostActivity(request.getData());
        return BaseResponse.success(activityId);
    }
    
    @Operation(summary = "主办方编辑活动", description = "主办方编辑自己发布的活动（仅本人或管理员）")
    @PutMapping("/activities/{id}")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> updateActivity(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<UpdateHostActivityRequest> request
    ) {
        activityFacade.updateHostActivity(id, request.getData());
        return BaseResponse.success(null);
    }
    
    @Operation(summary = "创建/更新场次", description = "批量创建或更新活动场次")
    @PostMapping("/activities/{id}/sessions")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> createOrUpdateSessions(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Valid @RequestBody UnifiedRequest<List<CreateActivitySessionRequest>> request
    ) {
        activityFacade.createOrUpdateSessions(id, request.getData());
        return BaseResponse.success(null);
    }
    
    @Operation(summary = "我发布的活动列表", description = "查询当前主办方发布的所有活动")
    @GetMapping("/activities")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<PageResponse<Map<String, Object>>> getMyActivities(
        @Parameter(description = "页码（从 1 开始）") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<Map<String, Object>> result = activityFacade.getMyHostActivities(page, size);
        return BaseResponse.success(result);
    }
    
    @Operation(summary = "查看报名名单", description = "主办方查看活动的报名名单与统计（含敏感信息）")
    @GetMapping("/activities/{id}/signups")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<PageResponse<ActivitySignupListItemDTO>> getSignupList(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Parameter(description = "状态筛选：1=待审核 2=已通过 3=已拒绝 4=已取消") @RequestParam(required = false) Integer status,
        @Parameter(description = "页码（从 1 开始）") @RequestParam(defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(defaultValue = "20") Integer size
    ) {
        PageResponse<ActivitySignupListItemDTO> result = activityFacade.getActivitySignupList(id, status, page, size);
        return BaseResponse.success(result);
    }
    
    @Operation(summary = "审核通过报名", description = "主办方或管理员审核通过报名")
    @PatchMapping("/activities/{id}/signups/{signupId}/approve")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> approveSignup(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Parameter(description = "报名 ID") @PathVariable UUID signupId,
        @Valid @RequestBody(required = false) UnifiedRequest<ApproveSignupRequest> request
    ) {
        String auditNote = request != null && request.getData() != null ? request.getData().getAuditNote() : null;
        activityFacade.auditSignup(signupId, 2, auditNote);
        return BaseResponse.success(null);
    }
    
    @Operation(summary = "审核拒绝报名", description = "主办方或管理员审核拒绝报名")
    @PatchMapping("/activities/{id}/signups/{signupId}/reject")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> rejectSignup(
        @Parameter(description = "活动 ID") @PathVariable UUID id,
        @Parameter(description = "报名 ID") @PathVariable UUID signupId,
        @Valid @RequestBody(required = false) UnifiedRequest<RejectSignupRequest> request
    ) {
        String auditNote = request != null && request.getData() != null ? request.getData().getAuditNote() : null;
        activityFacade.auditSignup(signupId, 3, auditNote);
        return BaseResponse.success(null);
    }
}
