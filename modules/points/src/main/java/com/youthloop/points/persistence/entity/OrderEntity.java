package com.youthloop.points.persistence.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 兑换订单 PO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {
    private UUID id;
    private UUID userId;
    private UUID goodId;
    private Integer pointsCost;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
