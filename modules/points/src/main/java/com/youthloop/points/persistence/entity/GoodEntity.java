package com.youthloop.points.persistence.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 兑换商品 PO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodEntity {
    private UUID id;
    private String title;
    private String description;
    private String imageUrl;
    private Integer pointsCost;
    private Integer stock;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
