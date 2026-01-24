package com.youthloop.game.application.facade;

import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.api.facade.GameFacade;
import com.youthloop.game.application.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * 游戏门面实现
 */
@Service
@RequiredArgsConstructor
public class GameFacadeImpl implements GameFacade {
    
    private final GameService gameService;
    
    @Override
    public GameSessionDTO startSession() {
        return gameService.startSession();
    }
    
    @Override
    public GameSessionDTO getCurrentSession() {
        return gameService.getCurrentSession();
    }
    
    @Override
    public GameActionResponse performAction(GameActionRequest request) {
        return gameService.performAction(request);
    }
    
    @Override
    public GameActionResponse endSession(UUID sessionId) {
        return gameService.endSession(sessionId);
    }
}
