package com.youthloop.event.domain.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 报名事件 Payload
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupEventPayload {
    
    /**
     * 报名 ID
     */
    private UUID signupId;
    
    /**
     * 活动 ID
     */
    private UUID activityId;
    
    /**
     * 场次 ID
     */
    private UUID sessionId;
    
    /**
     * 用户 ID（游客为 null）
     */
    private UUID userId;
    
    /**
     * 报名状态：1=待审核 2=已通过 3=已拒绝 4=已取消
     */
    private Integer status;
    
    /**
     * 操作类型：CREATED, APPROVED, REJECTED, CANCELED
     */
    private String action;
    
    /**
     * 活动主办方 ID（用于通知）
     */
    private UUID hostUserId;
}
