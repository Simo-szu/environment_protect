package com.youthloop.game.api.facade;

import com.youthloop.game.api.dto.AdminCreateGameCardRequest;
import com.youthloop.game.api.dto.AdminUpdateGameCardRequest;
import com.youthloop.game.api.dto.GameCardMetaDTO;

import java.util.List;

/**
 * Admin facade for game card management.
 */
public interface GameCardAdminFacade {

    List<GameCardMetaDTO> listCards();

    GameCardMetaDTO getCardById(String cardId);

    String createCard(AdminCreateGameCardRequest request);

    void updateCard(String cardId, AdminUpdateGameCardRequest request);

    void deleteCard(String cardId);
}
