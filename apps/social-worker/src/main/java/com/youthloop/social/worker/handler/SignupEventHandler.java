package com.youthloop.social.worker.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.youthloop.event.domain.payload.SignupEventPayload;
import com.youthloop.event.persistence.entity.OutboxEventEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 报名事件处理器
 * 处理 SIGNUP_CREATED、SIGNUP_CANCELED、SIGNUP_AUDITED 事件
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SignupEventHandler implements EventHandler {
    
    private final JdbcTemplate jdbcTemplate;
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
     * - 如果是自动通过（status=2），增加 signup_count
     * - 如果是待审核（status=1），不增加计数
     */
    private void handleSignupCreated(SignupEventPayload payload) {
        // 只有状态为已通过（2）时才增加计数
        if (payload.getStatus() == 2) {
            incrementSignupCount(payload.getActivityId());
            log.info("报名已通过，增加计数: activityId={}", payload.getActivityId());
        } else {
            log.info("报名待审核，不增加计数: activityId={}, status={}", 
                payload.getActivityId(), payload.getStatus());
        }
        
        // TODO: 发送通知给主办方（如果需要审核）
    }
    
    /**
     * 处理报名取消事件
     * - 减少 signup_count
     */
    private void handleSignupCanceled(SignupEventPayload payload) {
        decrementSignupCount(payload.getActivityId());
        log.info("报名已取消，减少计数: activityId={}", payload.getActivityId());
    }
    
    /**
     * 处理报名审核事件
     * - 如果审核通过（status=2），增加 signup_count
     * - 如果审核拒绝（status=3），不操作
     */
    private void handleSignupAudited(SignupEventPayload payload) {
        if (payload.getStatus() == 2) {
            // 审核通过，增加计数
            incrementSignupCount(payload.getActivityId());
            log.info("报名审核通过，增加计数: activityId={}", payload.getActivityId());
        } else if (payload.getStatus() == 3) {
            log.info("报名审核拒绝，不操作: activityId={}", payload.getActivityId());
        }
        
        // TODO: 发送通知给报名用户
    }
    
    /**
     * 增加活动报名计数
     */
    private void incrementSignupCount(java.util.UUID activityId) {
        String sql = """
            INSERT INTO social.activity_stats (activity_id, signup_count, updated_at)
            VALUES (?::uuid, 1, now())
            ON CONFLICT (activity_id) DO UPDATE
            SET signup_count = activity_stats.signup_count + 1,
                updated_at = now()
            """;
        
        jdbcTemplate.update(sql, activityId.toString());
    }
    
    /**
     * 减少活动报名计数
     */
    private void decrementSignupCount(java.util.UUID activityId) {
        String sql = """
            UPDATE social.activity_stats
            SET signup_count = GREATEST(0, signup_count - 1),
                updated_at = now()
            WHERE activity_id = ?::uuid
            """;
        
        jdbcTemplate.update(sql, activityId.toString());
    }
}
