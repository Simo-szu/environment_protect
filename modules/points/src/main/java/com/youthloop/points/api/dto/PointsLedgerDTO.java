package com.youthloop.points.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 积分记录 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointsLedgerDTO {
    private UUID id;
    private UUID userId;
    private Integer amount; // 变动金额 (+/-)
    
    @JsonProperty("reasonCode")
    private Integer reason; // 变动原因代码
    
    @JsonProperty("reason")
    private String reasonDesc; // 原因描述
    
    private String memo; // 备注
    private LocalDateTime createdAt;
    
    // Frontend compatibility
    private Long balance;
    private String sourceType;
    private UUID sourceId;
}
