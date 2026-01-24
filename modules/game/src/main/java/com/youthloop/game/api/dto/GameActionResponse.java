package com.youthloop.game.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 游戏操作响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameActionResponse {
    private JsonNode newPondState; // 新的池塘状态
    private Integer pointsEarned; // 本次获得积分
    private Long totalScore; // 总分
    private Integer newLevel; // 新等级
}
