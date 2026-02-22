package com.youthloop.game.api.web.controller.admin;

import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiPageData;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.RequireAdmin;
import com.youthloop.game.api.dto.AdminCreateGameCardRequest;
import com.youthloop.game.api.dto.AdminUpdateGameCardRequest;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.api.facade.GameCardAdminFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Admin controller for game card management.
 */
@Tag(name = "Admin-Game-Card", description = "Admin APIs for game card management")
@RestController
@RequestMapping("/api/v1/admin/game/cards")
@RequiredArgsConstructor
@RequireAdmin
public class AdminGameCardController {

    private final GameCardAdminFacade gameCardAdminFacade;

    @Operation(summary = "List all game cards for admin")
    @GetMapping
    @ApiResponseContract(ApiEndpointKind.PAGE_LIST)
    public ApiSpecResponse<ApiPageData<GameCardMetaDTO>> listCards() {
        List<GameCardMetaDTO> cards = gameCardAdminFacade.listCards();
        ApiPageData<GameCardMetaDTO> pageData = new ApiPageData<>(1, cards.size(), (long) cards.size(), cards);
        return ApiSpecResponse.ok(pageData);
    }

    @Operation(summary = "Get game card detail by id")
    @GetMapping("/{cardId}")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<GameCardMetaDTO> getCardById(
        @Parameter(description = "Card ID, e.g. card001") @PathVariable("cardId") String cardId
    ) {
        return ApiSpecResponse.ok(gameCardAdminFacade.getCardById(cardId));
    }

    @Operation(summary = "Create a game card")
    @PostMapping
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<String> createCard(
        @Valid @RequestBody UnifiedRequest<AdminCreateGameCardRequest> request
    ) {
        return ApiSpecResponse.ok(gameCardAdminFacade.createCard(request.getData()));
    }

    @Operation(summary = "Update a game card")
    @PatchMapping("/{cardId}")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> updateCard(
        @PathVariable("cardId") String cardId,
        @Valid @RequestBody UnifiedRequest<AdminUpdateGameCardRequest> request
    ) {
        gameCardAdminFacade.updateCard(cardId, request.getData());
        return ApiSpecResponse.ok(Map.of());
    }

    @Operation(summary = "Delete a game card")
    @DeleteMapping("/{cardId}")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<Map<String, Object>> deleteCard(
        @PathVariable("cardId") String cardId
    ) {
        gameCardAdminFacade.deleteCard(cardId);
        return ApiSpecResponse.ok(Map.of());
    }
}
