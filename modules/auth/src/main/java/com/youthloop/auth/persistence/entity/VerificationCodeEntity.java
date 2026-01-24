package com.youthloop.auth.persistence.entity;

import com.youthloop.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 验证码实体（对应 shared.verification_code 表）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class VerificationCodeEntity extends BaseEntity {
    
    /**
     * 验证码 ID
     */
    private UUID id;
    
    /**
     * 账号（邮箱或手机号）
     */
    private String account;
    
    /**
     * 渠道：1=email 2=sms
     */
    private Integer channel;
    
    /**
     * 用途：1=register 2=login 3=reset_pwd
     */
    private Integer purpose;
    
    /**
     * 验证码哈希值
     */
    private String codeHash;
    
    /**
     * 过期时间
     */
    private LocalDateTime expiresAt;
    
    /**
     * 尝试次数
     */
    private Integer attempts;
}
