package com.youthloop.activity.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 活动报名实体（对应 social.activity_signup 表）
 */
@Data
public class ActivitySignupEntity {
    
    /**
     * 报名 ID
     */
    private UUID id;
    
    /**
     * 活动 ID
     */
    private UUID activityId;
    
    /**
     * 场次 ID（HOSTED 活动必填）
     */
    private UUID sessionId;
    
    /**
     * 用户 ID（登录用户必填，游客为 null）
     */
    private UUID userId;
    
    /**
     * 邮箱（游客必填，用于去重和通知）
     */
    private String email;
    
    /**
     * 昵称
     */
    private String nickname;
    
    /**
     * 真实姓名
     */
    private String realName;
    
    /**
     * 手机号
     */
    private String phone;
    
    /**
     * 参与时间（快照，通常等于场次开始时间）
     */
    private LocalDateTime joinTime;
    
    /**
     * 状态：1=待审核 2=已通过 3=已拒绝 4=已取消
     */
    private Integer status;
    
    /**
     * 审核人 ID
     */
    private UUID auditedBy;
    
    /**
     * 审核时间
     */
    private LocalDateTime auditedAt;
    
    /**
     * 审核备注
     */
    private String auditNote;
    
    /**
     * 取消时间
     */
    private LocalDateTime canceledAt;
    
    /**
     * 取消备注
     */
    private String cancelNote;
    
    /**
     * 去重键：登录用户="U:{userId}"，游客="E:{email}"
     */
    private String dedupKey;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
