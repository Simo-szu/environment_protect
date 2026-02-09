package com.youthloop.social.api.web.controller.me;

import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.RequireAuth;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.notification.api.facade.NotificationFacade;
import com.youthloop.points.api.dto.PointsAccountDTO;
import com.youthloop.points.api.facade.PointsFacade;
import com.youthloop.query.dto.MyActivityItemDTO;
import com.youthloop.query.dto.NotificationItemDTO;
import com.youthloop.query.dto.ReactionItemDTO;
import com.youthloop.query.facade.QueryFacade;
import com.youthloop.social.api.web.dto.MarkNotificationsReadRequest;
import com.youthloop.user.api.facade.UserProfileFacade;
import com.youthloop.user.application.dto.UserProfileDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@Tag(name = "当前用户", description = "当前登录用户个人信息")
@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
@RequireAuth
public class MeController {

    private final UserProfileFacade userProfileFacade;
    private final QueryFacade queryFacade;
    private final NotificationFacade notificationFacade;
    private final PointsFacade pointsFacade;

    @Operation(summary = "获取我的档案", description = "获取当前登录用户档案信息")
    @GetMapping("/profile")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<UserProfileDTO> getMyProfile() {
        UUID userId = SecurityUtil.getCurrentUserId();
        UserProfileDTO profile = userProfileFacade.getUserProfile(userId);
        return ApiSpecResponse.ok(profile);
    }

    @Operation(summary = "获取我的积分余额", description = "获取当前用户积分账户余额")
    @GetMapping("/points")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<PointsAccountDTO> getMyPoints() {
        PointsAccountDTO account = pointsFacade.getAccount();
        return ApiSpecResponse.ok(account);
    }

    @Operation(summary = "更新我的档案", description = "更新当前登录用户档案")
    @PostMapping("/profile")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> updateMyProfile(@Valid @RequestBody UnifiedRequest<UserProfileDTO> request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        userProfileFacade.updateUserProfile(userId, request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "获取我的收藏/点赞", description = "查询当前用户收藏/点赞列表")
    @GetMapping("/reactions")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<ReactionItemDTO>> getMyReactions(
        @Parameter(description = "反应类型") @RequestParam(name = "reactionType", required = false) Integer reactionType,
        @Parameter(description = "目标类型") @RequestParam(name = "targetType", required = false) Integer targetType,
        @Parameter(description = "页码") @RequestParam(name = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(name = "size", defaultValue = "20") Integer size
    ) {
        PageResponse<ReactionItemDTO> result = queryFacade.getMyReactions(reactionType, targetType, page, size);
        ApiPageData<ReactionItemDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "获取我的通知", description = "查询当前用户通知列表")
    @GetMapping("/notifications")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<NotificationItemDTO>> getMyNotifications(
        @Parameter(description = "页码") @RequestParam(name = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(name = "size", defaultValue = "20") Integer size
    ) {
        PageResponse<NotificationItemDTO> result = queryFacade.getMyNotifications(page, size);
        ApiPageData<NotificationItemDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "标记通知为已读", description = "支持批量标记已读")
    @PostMapping("/notifications/read")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> markNotificationsAsRead(
        @Valid @RequestBody UnifiedRequest<MarkNotificationsReadRequest> request
    ) {
        MarkNotificationsReadRequest data = request.getData();
        if (data.getNotificationIds() == null || data.getNotificationIds().isEmpty()) {
            notificationFacade.markAllAsRead();
        } else {
            for (UUID notificationId : data.getNotificationIds()) {
                notificationFacade.markAsRead(notificationId);
            }
        }
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "获取我报名的活动", description = "查询当前用户报名活动列表")
    @GetMapping("/activities")
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<MyActivityItemDTO>> getMyActivities(
        @Parameter(description = "报名状态") @RequestParam(name = "status", required = false) Integer status,
        @Parameter(description = "页码") @RequestParam(name = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(name = "size", defaultValue = "20") Integer size
    ) {
        PageResponse<MyActivityItemDTO> result = queryFacade.getMyActivities(status, page, size);
        ApiPageData<MyActivityItemDTO> pageData = new ApiPageData<>(
            result.getPage(),
            result.getSize(),
            result.getTotal(),
            result.getItems()
        );
        return ApiSpecResponse.ok(pageData);
    }
}
