package com.youthloop.event.domain;

/**
 * 事件类型常量
 */
public class EventType {
    
    // === Content 相关事件 ===
    public static final String CONTENT_CREATED = "CONTENT_CREATED";
    public static final String CONTENT_UPDATED = "CONTENT_UPDATED";
    public static final String CONTENT_DELETED = "CONTENT_DELETED";
    
    // === Activity 相关事件 ===
    public static final String ACTIVITY_CREATED = "ACTIVITY_CREATED";
    public static final String ACTIVITY_UPDATED = "ACTIVITY_UPDATED";
    public static final String ACTIVITY_DELETED = "ACTIVITY_DELETED";
    public static final String ACTIVITY_SIGNUP_CREATED = "ACTIVITY_SIGNUP_CREATED";
    public static final String ACTIVITY_SIGNUP_CANCELLED = "ACTIVITY_SIGNUP_CANCELLED";
    
    // === Interaction 相关事件 ===
    public static final String COMMENT_CREATED = "COMMENT_CREATED";
    public static final String COMMENT_DELETED = "COMMENT_DELETED";
    public static final String REACTION_CHANGED = "REACTION_CHANGED"; // 统一使用REACTION_CHANGED
    
    // === Points 相关事件 ===
    public static final String POINTS_EARNED = "POINTS_EARNED";
    public static final String SIGNIN_COMPLETED = "SIGNIN_COMPLETED";
    public static final String TASK_COMPLETED = "TASK_COMPLETED";
    
    // === Notification 相关事件 ===
    public static final String NOTIFICATION_CREATED = "NOTIFICATION_CREATED";
    
    private EventType() {
        // 工具类，禁止实例化
    }
}
