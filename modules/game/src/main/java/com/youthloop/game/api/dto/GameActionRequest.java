package com.youthloop.game.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

import java.util.UUID;

/**
 * Gameplay action request.
 */
@Data
public class GameActionRequest {
    private UUID sessionId;
    private Integer actionType; // 1=place_core_card, 2=end_turn, 3=use_policy_card, 4=trade_carbon
    private JsonNode actionData; // Payload examples: {"cardId":"card001"} or {"tradeType":"buy","amount":10}
}
