package com.youthloop.points.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

/**
 * 积分账户DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointsAccountDTO {
    private UUID userId;
    private Long balance;
    
    // Frontend compatibility
    private Long totalPoints;
    private Long availablePoints;
    private Integer level;
    private String levelName;
}
