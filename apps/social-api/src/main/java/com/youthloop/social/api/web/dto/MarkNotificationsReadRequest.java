package com.youthloop.social.api.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * 标记通知已读请求
 */
@Data
@Schema(description = "标记通知已读请求")
public class MarkNotificationsReadRequest {
    
    @Schema(description = "通知 ID 列表（为空或空数组表示标记所有通知为已读）")
    private List<UUID> notificationIds;
}
