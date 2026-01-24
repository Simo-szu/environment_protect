package com.youthloop.event.domain.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 反应变化事件 Payload（点赞/收藏/踩）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReactionChangedPayload {
    
    /**
     * 反应 ID
     */
    private UUID reactionId;
    
    /**
     * 反应类型：1=点赞 2=收藏 3=踩
     */
    private Integer reactionType;
    
    /**
     * 目标类型：1=内容 2=活动
     */
    private Integer targetType;
    
    /**
     * 目标 ID
     */
    private UUID targetId;
    
    /**
     * 用户 ID
     */
    private UUID userId;
    
    /**
     * 操作类型：1=创建 2=删除
     */
    private Integer action;
}
