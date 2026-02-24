package com.youthloop.game.api.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameActionLogDTO;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.api.dto.GameSessionDTO;

import java.util.List;
import java.util.UUID;

/**
 * Game facade interface.
 */
public interface GameFacade {

    GameSessionDTO startSession();

    GameSessionDTO getCurrentSession();

    GameSessionDTO getSessionById(UUID sessionId);

    List<GameCardMetaDTO> listCards(boolean includePolicy);

    GameActionResponse performAction(GameActionRequest request);

    GameActionResponse endSession(UUID sessionId);

    PageResponse<GameActionLogDTO> listActions(UUID sessionId, int page, int size);
}
