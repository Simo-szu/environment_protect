package com.youthloop.points.api.dto;

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
    private Integer pointsEarned; // 本次获得积分
    private Integer streakCount; // 连续签到天数
    private Long totalBalance; // 当前总积分
}
