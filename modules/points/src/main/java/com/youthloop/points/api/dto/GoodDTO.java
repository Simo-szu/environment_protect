package com.youthloop.points.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 兑换商品 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodDTO {
    private UUID id;
    private String title;
    private String description;
    private String imageUrl;
    private Integer pointsCost;
    private Integer stock;
    private Integer status; // 1=on_shelf 2=off_shelf
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
