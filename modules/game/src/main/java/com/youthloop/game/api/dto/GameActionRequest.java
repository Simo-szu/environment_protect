package com.youthloop.game.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import java.util.UUID;

/**
 * 游戏操作请求
 */
@Data
public class GameActionRequest {
    private UUID sessionId;
    private Integer actionType; // 1=feed 2=clean 3=add_plant 4=add_fish 5=adjust_params
    private JsonNode actionData; // 操作详细数据
}
