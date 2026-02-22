package com.youthloop.game.application.facade;

import com.youthloop.common.api.PageResponse;
import com.youthloop.game.api.dto.AdminCreateGameCardRequest;
import com.youthloop.game.api.dto.AdminUpdateGameCardRequest;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.api.facade.GameCardAdminFacade;
import com.youthloop.game.application.service.GameCardAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Game card admin facade implementation.
 */
@Service
@RequiredArgsConstructor
public class GameCardAdminFacadeImpl implements GameCardAdminFacade {

    private final GameCardAdminService gameCardAdminService;

    @Override
    public PageResponse<GameCardMetaDTO> listCards(int page, int size) {
        return gameCardAdminService.listCards(page, size);
    }

    @Override
    public GameCardMetaDTO getCardById(String cardId) {
        return gameCardAdminService.getCardById(cardId);
    }

    @Override
    public String createCard(AdminCreateGameCardRequest request) {
        return gameCardAdminService.createCard(request);
    }

    @Override
    public void updateCard(String cardId, AdminUpdateGameCardRequest request) {
        gameCardAdminService.updateCard(cardId, request);
    }

    @Override
    public void deleteCard(String cardId) {
        gameCardAdminService.deleteCard(cardId);
    }
}
