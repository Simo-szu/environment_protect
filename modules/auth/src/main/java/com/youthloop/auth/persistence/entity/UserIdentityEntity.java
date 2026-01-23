package com.youthloop.auth.persistence.entity;

import com.youthloop.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户身份实体（对应 shared.user_identity 表）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class UserIdentityEntity extends BaseEntity {
    
    private UUID id;
    private UUID userId;
    
    /**
     * 身份类型：1=EMAIL 2=PHONE 3=GOOGLE
     */
    private Integer identityType;
    
    /**
     * 身份标识符：email(小写) / phone(E.164) / google_sub
     */
    private String identityIdentifier;
    
    /**
     * 验证时间
     */
    private LocalDateTime verifiedAt;
    
    /**
     * 是否为主身份
     */
    private Boolean isPrimary;
}
