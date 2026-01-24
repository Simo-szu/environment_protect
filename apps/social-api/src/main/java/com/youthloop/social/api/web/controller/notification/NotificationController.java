package com.youthloop.social.api.web.controller.notification;

import com.youthloop.common.api.BaseResponse;
import com.youthloop.notification.api.facade.NotificationFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * 通知 Controller
 */
@Tag(name = "通知", description = "通知标记已读")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationFacade notificationFacade;
    
    @Operation(summary = "标记通知为已读", description = "标记单个通知为已读")
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> markAsRead(
        @Parameter(description = "通知 ID") @PathVariable UUID id
    ) {
        notificationFacade.markAsRead(id);
        return BaseResponse.success(null);
    }
    
    @Operation(summary = "标记所有通知为已读", description = "批量标记当前用户的所有通知为已读")
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<Void> markAllAsRead() {
        notificationFacade.markAllAsRead();
        return BaseResponse.success(null);
    }
}
