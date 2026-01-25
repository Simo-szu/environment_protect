package com.youthloop.points.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 签到响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SigninResponse {
    @JsonProperty("points")
    private Integer pointsEarned; // 本次获得积分
    @JsonProperty("consecutiveDays")
    private Integer streakCount; // 连续签到天数
    private Long totalBalance; // 当前总积分
    
    // Frontend fields
    private UUID userId;
    private LocalDate signinDate;
}
