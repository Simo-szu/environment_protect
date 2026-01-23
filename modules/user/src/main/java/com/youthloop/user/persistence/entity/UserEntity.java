package com.youthloop.user.persistence.entity;

import com.youthloop.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户实体（对应 shared.user 表）
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class UserEntity extends BaseEntity {
    
    /**
     * 用户 ID
     */
    private UUID id;
    
    /**
     * 角色：1=普通用户 2=主办方 3=管理员
     */
    private Integer role;
    
    /**
     * 状态：1=正常 2=封禁
     */
    private Integer status;
    
    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginAt;
}
