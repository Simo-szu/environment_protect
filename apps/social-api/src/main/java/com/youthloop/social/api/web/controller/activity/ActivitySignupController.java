package com.youthloop.social.api.web.controller.activity;

import com.youthloop.activity.api.dto.SignupRequest;
import com.youthloop.activity.api.dto.SignupResponse;
import com.youthloop.activity.api.facade.ActivityFacade;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.AllowGuest;
import com.youthloop.social.api.web.dto.CancelSignupRequest;
import com.youthloop.social.api.web.dto.UpdateSignupRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@Tag(name = "活动报名", description = "活动报名、取消、改场次")
@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivitySignupController {

    private final ActivityFacade activityFacade;

    @Operation(summary = "报名活动", description = "支持登录用户和游客报名")
    @PostMapping("/{id}/signups")
    @AllowGuest
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<SignupResponse> signup(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID activityId,
        @Valid @RequestBody UnifiedRequest<SignupRequest> request
    ) {
        SignupRequest data = request.getData();
        data.setActivityId(activityId);
        SignupResponse response = activityFacade.signup(data);
        return ApiSpecResponse.ok(response);
    }

    @Operation(summary = "修改报名信息/改场次", description = "修改报名信息或更换场次")
    @PatchMapping("/{id}/signups/{signupId}")
    @AllowGuest
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> updateSignup(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID activityId,
        @Parameter(description = "报名 ID") @PathVariable UUID signupId,
        @Valid @RequestBody UnifiedRequest<UpdateSignupRequest> request
    ) {
        UpdateSignupRequest data = request.getData();

        if (data.getNewSessionId() != null) {
            activityFacade.changeSession(signupId, data.getNewSessionId(), data.getGuestEmail());
        }

        if (data.getNickname() != null || data.getRealName() != null || data.getPhone() != null) {
            activityFacade.updateSignupInfo(
                signupId,
                data.getNickname(),
                data.getRealName(),
                data.getPhone(),
                data.getGuestEmail()
            );
        }

        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "取消报名", description = "用户取消自己的报名")
    @DeleteMapping("/{id}/signups/{signupId}")
    @AllowGuest
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> cancelSignup(
        @Parameter(description = "活动 ID") @PathVariable("id") UUID activityId,
        @Parameter(description = "报名 ID") @PathVariable UUID signupId,
        @Valid @RequestBody(required = false) UnifiedRequest<CancelSignupRequest> request
    ) {
        String cancelNote = request != null && request.getData() != null ? request.getData().getCancelNote() : null;
        String guestEmail = request != null && request.getData() != null ? request.getData().getGuestEmail() : null;
        activityFacade.cancelSignup(signupId, cancelNote, guestEmail);
        return ApiSpecResponse.ok(Map.of());
    }
}
