package com.youthloop.game.application.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameActionLogDTO;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.api.facade.GameFacade;
import com.youthloop.game.application.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Game facade implementation.
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
    public GameSessionDTO getSessionById(UUID sessionId) {
        return gameService.getSessionById(sessionId);
    }

    @Override
    public List<GameCardMetaDTO> listCards(boolean includePolicy) {
        return gameService.listCards(includePolicy);
    }

    @Override
    public GameActionResponse performAction(GameActionRequest request) {
        return gameService.performAction(request);
    }

    @Override
    public GameActionResponse endSession(UUID sessionId) {
        return gameService.endSession(sessionId);
    }

    @Override
    public PageResponse<GameActionLogDTO> listActions(UUID sessionId, int page, int size) {
        return gameService.listActions(sessionId, page, size);
    }
}
