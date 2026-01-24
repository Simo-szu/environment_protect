package com.youthloop.social.api.web.controller.activity;

import com.youthloop.activity.api.dto.SignupRequest;
import com.youthloop.activity.api.dto.SignupResponse;
import com.youthloop.activity.api.facade.ActivityFacade;
import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.security.AllowGuest;
import com.youthloop.social.api.web.dto.CancelSignupRequest;
import com.youthloop.social.api.web.dto.UpdateSignupRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

/**
 * 活动报名 Controller
 */
@Tag(name = "活动报名", description = "活动报名、取消、改场次")
@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivitySignupController {
    
    private final ActivityFacade activityFacade;
    
    @Operation(summary = "报名活动", description = "支持登录用户和游客报名，游客需提供邮箱")
    @PostMapping("/{id}/signups")
    @AllowGuest
    public BaseResponse<SignupResponse> signup(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID activityId,
        @Valid @RequestBody UnifiedRequest<SignupRequest> request
    ) {
        SignupRequest data = request.getData();
        // 确保 activityId 一致
        data.setActivityId(activityId);
        SignupResponse response = activityFacade.signup(data);
        return BaseResponse.success(response);
    }
    
    @Operation(summary = "修改报名信息/改场次", description = "用户修改报名信息或改场次（游客需提供邮箱验证）")
    @PatchMapping("/{id}/signups/{signupId}")
    @AllowGuest
    public BaseResponse<Void> updateSignup(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID activityId,
        @Parameter(description = "报名 ID") @PathVariable UUID signupId,
        @Valid @RequestBody UnifiedRequest<UpdateSignupRequest> request
    ) {
        UpdateSignupRequest data = request.getData();
        if (data.getNewSessionId() != null) {
            activityFacade.changeSession(signupId, data.getNewSessionId(), data.getGuestEmail());
        }
        // TODO: 支持修改其他报名信息（昵称/手机号/真实姓名等）
        return BaseResponse.success(null);
    }
    
    @Operation(summary = "取消报名", description = "用户取消自己的报名（游客需提供邮箱验证）")
    @DeleteMapping("/{id}/signups/{signupId}")
    @AllowGuest
    public BaseResponse<Void> cancelSignup(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID activityId,
        @Parameter(description = "报名 ID") @PathVariable UUID signupId,
        @Valid @RequestBody(required = false) UnifiedRequest<CancelSignupRequest> request
    ) {
        String cancelNote = request != null && request.getData() != null ? request.getData().getCancelNote() : null;
        String guestEmail = request != null && request.getData() != null ? request.getData().getGuestEmail() : null;
        activityFacade.cancelSignup(signupId, cancelNote, guestEmail);
        return BaseResponse.success(null);
    }
}
