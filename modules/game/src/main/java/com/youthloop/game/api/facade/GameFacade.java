package com.youthloop.game.api.facade;

import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameSessionDTO;

/**
 * 游戏门面接口
 */
public interface GameFacade {
    
    /**
     * 开始新游戏会话
     */
    GameSessionDTO startSession();
    
    /**
     * 获取当前游戏会话
     */
    GameSessionDTO getCurrentSession();
    
    /**
     * 执行游戏操作
     */
    GameActionResponse performAction(GameActionRequest request);
    
    /**
     * 结束游戏会话
     */
    void endSession();
}
