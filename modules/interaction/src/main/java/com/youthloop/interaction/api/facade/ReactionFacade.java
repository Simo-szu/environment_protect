package com.youthloop.interaction.api.facade;

import com.youthloop.interaction.api.dto.ToggleReactionRequest;

/**
 * 反应门面（对外契约）
 */
public interface ReactionFacade {
    
    /**
     * 创建反应（幂等）
     */
    void createReaction(ToggleReactionRequest request);
    
    /**
     * 删除反应（幂等）
     */
    void deleteReaction(ToggleReactionRequest request);
}
