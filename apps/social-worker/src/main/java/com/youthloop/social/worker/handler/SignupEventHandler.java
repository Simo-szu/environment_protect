package com.youthloop.social.worker.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.event.domain.payload.SignupEventPayload;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
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
    public void handle(OutboxEventEntity event) throws Exception {
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
     * - 不再维护 signup_count，改为从 activity_signup 聚合计算
     */
    private void handleSignupCreated(SignupEventPayload payload) {
        log.info("报名创建事件: activityId={}, status={}", 
            payload.getActivityId(), payload.getStatus());
        
        // TODO: 发送通知给主办方（如果需要审核）
    }
    
    /**
     * 处理报名取消事件
     * - 不再维护 signup_count，改为从 activity_signup 聚合计算
     */
    private void handleSignupCanceled(SignupEventPayload payload) {
        log.info("报名已取消: activityId={}", payload.getActivityId());
    }
    
    /**
     * 处理报名审核事件
     * - 不再维护 signup_count，改为从 activity_signup 聚合计算
     */
    private void handleSignupAudited(SignupEventPayload payload) {
        log.info("报名审核事件: activityId={}, status={}", 
            payload.getActivityId(), payload.getStatus());
        
        // TODO: 发送通知给报名用户
    }
}
