package com.youthloop.game.api.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.game.api.dto.AdminCreateGameCardRequest;
import com.youthloop.game.api.dto.AdminUpdateGameCardRequest;
import com.youthloop.game.api.dto.GameCardMetaDTO;

/**
 * Admin facade for game card management.
 */
public interface GameCardAdminFacade {

    PageResponse<GameCardMetaDTO> listCards(int page, int size);

    GameCardMetaDTO getCardById(String cardId);

    String createCard(AdminCreateGameCardRequest request);

    void updateCard(String cardId, AdminUpdateGameCardRequest request);

    void deleteCard(String cardId);
}
