package com.youthloop.points.persistence.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 积分账户实体
 */
@Data
public class PointsAccountEntity {
    private UUID userId;
    private Long balance;
    private LocalDateTime updatedAt;
}
