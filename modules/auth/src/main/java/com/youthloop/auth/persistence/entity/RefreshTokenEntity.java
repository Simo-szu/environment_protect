package com.youthloop.auth.persistence.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 刷新令牌实体（对应 shared.auth_refresh_token 表）
 */
@Data
public class RefreshTokenEntity {
    
    private UUID id;
    private UUID userId;
    private String tokenHash;
    private String deviceId;
    private LocalDateTime expiresAt;
    private LocalDateTime revokedAt;
    private LocalDateTime createdAt;
}
