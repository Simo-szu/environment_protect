package com.youthloop.social.api.web.controller.me;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.security.RequireAuth;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.notification.api.facade.NotificationFacade;
import com.youthloop.points.api.dto.PointsAccountDTO;
import com.youthloop.points.api.facade.PointsFacade;
import com.youthloop.query.dto.NotificationItemDTO;
import com.youthloop.query.dto.MyActivityItemDTO;
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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 当前用户 Controller
 * 所有接口都操作当前登录用户的数据，必须登录
 */
@Tag(name = "当前用户", description = "当前登录用户的个人信息管理")
@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
@RequireAuth
public class MeController {
    
    private final UserProfileFacade userProfileFacade;
    private final QueryFacade queryFacade;
    private final NotificationFacade notificationFacade;
    private final PointsFacade pointsFacade;
    
    @Operation(summary = "获取我的档案", description = "获取当前登录用户的档案信息")
    @GetMapping("/profile")
    public BaseResponse<UserProfileDTO> getMyProfile() {
        UUID userId = SecurityUtil.getCurrentUserId();
        UserProfileDTO profile = userProfileFacade.getUserProfile(userId);
        return BaseResponse.success(profile);
    }
    
    @Operation(summary = "获取我的积分余额", description = "获取当前用户的积分账户余额")
    @GetMapping("/points")
    public BaseResponse<PointsAccountDTO> getMyPoints() {
        PointsAccountDTO account = pointsFacade.getAccount();
        return BaseResponse.success(account);
    }
    
    @Operation(summary = "更新我的档案", description = "更新当前登录用户的档案信息")
    @PostMapping("/profile")
    public BaseResponse<Void> updateMyProfile(@Valid @RequestBody UnifiedRequest<UserProfileDTO> request) {
        UUID userId = SecurityUtil.getCurrentUserId();
        userProfileFacade.updateUserProfile(userId, request.getData());
        return BaseResponse.success("档案更新成功", null);
    }
    
    @Operation(summary = "获取我的收藏/点赞", description = "查询当前用户的收藏/点赞列表")
    @GetMapping("/reactions")
    public BaseResponse<PageResponse<ReactionItemDTO>> getMyReactions(
        @Parameter(description = "反应类型：1=点赞 2=收藏 3=踩") @RequestParam(name = "reactionType", required = false) Integer reactionType,
        @Parameter(description = "目标类型：1=内容 2=活动") @RequestParam(name = "targetType", required = false) Integer targetType,
        @Parameter(description = "页码（从 1 开始）") @RequestParam(name = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(name = "size", defaultValue = "20") Integer size
    ) {
        PageResponse<ReactionItemDTO> result = queryFacade.getMyReactions(reactionType, targetType, page, size);
        return BaseResponse.success(result);
    }
    
    @Operation(summary = "获取我的通知", description = "查询当前用户的通知列表（回复我的）")
    @GetMapping("/notifications")
    public BaseResponse<PageResponse<NotificationItemDTO>> getMyNotifications(
        @Parameter(description = "页码（从 1 开始）") @RequestParam(name = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(name = "size", defaultValue = "20") Integer size
    ) {
        PageResponse<NotificationItemDTO> result = queryFacade.getMyNotifications(page, size);
        return BaseResponse.success(result);
    }
    
    @Operation(summary = "标记通知为已读", description = "标记通知为已读（支持批量，传空数组表示全部已读）")
    @PostMapping("/notifications/read")
    public BaseResponse<Void> markNotificationsAsRead(
        @Valid @RequestBody UnifiedRequest<MarkNotificationsReadRequest> request
    ) {
        MarkNotificationsReadRequest data = request.getData();
        if (data.getNotificationIds() == null || data.getNotificationIds().isEmpty()) {
            // 标记所有通知为已读
            notificationFacade.markAllAsRead();
        } else {
            // 批量标记指定通知为已读
            for (UUID notificationId : data.getNotificationIds()) {
                notificationFacade.markAsRead(notificationId);
            }
        }
        return BaseResponse.success(null);
    }
    
    @Operation(summary = "获取我报名的活动", description = "查询当前用户报名的活动列表")
    @GetMapping("/activities")
    public BaseResponse<PageResponse<MyActivityItemDTO>> getMyActivities(
        @Parameter(description = "报名状态：1=待审核 2=已通过 3=已拒绝 4=已取消") @RequestParam(name = "status", required = false) Integer status,
        @Parameter(description = "页码（从 1 开始）") @RequestParam(name = "page", defaultValue = "1") Integer page,
        @Parameter(description = "每页数量") @RequestParam(name = "size", defaultValue = "20") Integer size
    ) {
        PageResponse<MyActivityItemDTO> result = queryFacade.getMyActivities(status, page, size);
        return BaseResponse.success(result);
    }
}
