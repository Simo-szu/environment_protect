package com.youthloop.points.persistence.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 积分账本实体
 */
@Data
public class PointsLedgerEntity {
    private UUID id;
    private UUID userId;
    private Integer delta; // 积分变化量
    private Integer reason; // 1=signin 2=task 3=quiz 4=admin 5=other
    private Integer refType;
    private UUID refId;
    private String memo;
    private LocalDateTime createdAt;
}
