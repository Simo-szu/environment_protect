package com.youthloop.social.worker.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.event.api.dto.OutboxEventDTO;
import com.youthloop.event.domain.payload.SignupEventPayload;
import com.youthloop.notification.application.service.NotificationCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 报名事件处理器
 * 处理 SIGNUP_CREATED、SIGNUP_CANCELED、SIGNUP_AUDITED 事件
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SignupEventHandler implements EventHandler {
    
    private final ObjectMapper objectMapper;
    private final NotificationCommandService notificationCommandService;
    
    @Override
    public String supportedEventType() {
        return "SIGNUP_CREATED"; // 主要事件类型
    }
    
    /**
     * 判断是否支持该事件类型
     */
    public boolean supports(String eventType) {
        return eventType != null && eventType.startsWith("SIGNUP_");
    }
    
    @Override
    public void handle(OutboxEventDTO event) throws Exception {
        String eventType = event.getEventType();
        
        // 解析 Payload
        SignupEventPayload payload = objectMapper.readValue(
            event.getPayload(), 
            SignupEventPayload.class
        );
        
        log.info("处理报名事件: type={}, activityId={}, action={}", 
            eventType, payload.getActivityId(), payload.getAction());
        
        // 根据事件类型处理
        switch (eventType) {
            case "SIGNUP_CREATED":
                handleSignupCreated(payload);
                break;
            case "SIGNUP_CANCELED":
                handleSignupCanceled(payload);
                break;
            case "SIGNUP_AUDITED":
                handleSignupAudited(payload);
                break;
            default:
                log.warn("未知的报名事件类型: {}", eventType);
        }
    }
    
    /**
     * 处理报名创建事件
     * - 如果需要审核，发送通知给主办方
     */
    private void handleSignupCreated(SignupEventPayload payload) {
        log.info("报名创建事件: activityId={}, status={}", 
            payload.getActivityId(), payload.getStatus());
        
        // 如果是待审核状态（status=1），通知主办方
        if (payload.getStatus() == 1 && payload.getHostUserId() != null && payload.getUserId() != null) {
            try {
                // 通知类型：2=activity_signup_pending（待审核报名）
                notificationCommandService.createNotification(
                    payload.getHostUserId(),     // 接收者：主办方
                    2,                           // 通知类型：2=activity_signup_pending
                    payload.getUserId(),         // 触发者：报名用户
                    2,                           // 目标类型：2=activity
                    payload.getActivityId(),     // 目标 ID：活动 ID
                    payload.getSignupId(),       // 关联 ID：报名 ID
                    null,                        // 根 ID
                    null                         // meta
                );
                log.info("报名待审核通知已创建: hostUserId={}, signupId={}", 
                    payload.getHostUserId(), payload.getSignupId());
            } catch (Exception e) {
                log.error("创建报名待审核通知失败: signupId={}, error={}", 
                    payload.getSignupId(), e.getMessage(), e);
            }
        }
    }
    
    /**
     * 处理报名取消事件
     * - 不再维护 signup_count，改为从 activity_signup 聚合计算
     */
    private void handleSignupCanceled(SignupEventPayload payload) {
        log.info("报名已取消: activityId={}", payload.getActivityId());
        // 取消报名通常不需要通知
    }
    
    /**
     * 处理报名审核事件
     * - 发送通知给报名用户
     */
    private void handleSignupAudited(SignupEventPayload payload) {
        log.info("报名审核事件: activityId={}, status={}", 
            payload.getActivityId(), payload.getStatus());
        
        // 只通知登录用户（游客无法接收站内通知）
        if (payload.getUserId() != null) {
            try {
                // 通知类型：3=activity_signup_approved（审核通过）或 4=activity_signup_rejected（审核拒绝）
                Integer notificationType = (payload.getStatus() == 2) ? 3 : 4;
                
                notificationCommandService.createNotification(
                    payload.getUserId(),         // 接收者：报名用户
                    notificationType,            // 通知类型：3=approved 4=rejected
                    payload.getHostUserId(),     // 触发者：主办方（可能为 null）
                    2,                           // 目标类型：2=activity
                    payload.getActivityId(),     // 目标 ID：活动 ID
                    payload.getSignupId(),       // 关联 ID：报名 ID
                    null,                        // 根 ID
                    null                         // meta
                );
                log.info("报名审核通知已创建: userId={}, signupId={}, status={}", 
                    payload.getUserId(), payload.getSignupId(), payload.getStatus());
            } catch (Exception e) {
                log.error("创建报名审核通知失败: signupId={}, error={}", 
                    payload.getSignupId(), e.getMessage(), e);
            }
        }
    }
}
