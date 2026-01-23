package com.youthloop.auth.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户密码实体（对应 shared.user_password 表）
 */
@Data
public class UserPasswordEntity {
    
    private UUID userId;
    private String passwordHash;
    private LocalDateTime setAt;
    private LocalDateTime updatedAt;
}
