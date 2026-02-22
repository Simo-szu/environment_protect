package com.youthloop.game.api.web.controller;

import com.youthloop.common.api.UnifiedRequest;
import com.youthloop.common.api.contract.ApiEndpointKind;
import com.youthloop.common.api.contract.ApiResponseContract;
import com.youthloop.common.api.contract.ApiSpecResponse;
import com.youthloop.common.security.AllowGuest;
import com.youthloop.common.security.RequireAuth;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameCardCatalogDTO;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.api.facade.GameFacade;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Game", description = "Low-carbon card gameplay APIs")
@RestController
@RequestMapping("/api/v1/game")
@RequiredArgsConstructor
@AllowGuest
public class GameController {

    private final GameFacade gameFacade;

    @Operation(summary = "List card metadata")
    @GetMapping("/cards")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<GameCardCatalogDTO> listCards(
        @Parameter(description = "Whether policy cards should be included")
        @RequestParam(name = "includePolicy", required = false, defaultValue = "true")
        boolean includePolicy
    ) {
        List<GameCardMetaDTO> cards = gameFacade.listCards(includePolicy);
        return ApiSpecResponse.ok(GameCardCatalogDTO.builder().items(cards).build());
    }

    @Operation(summary = "Start a new game session")
    @PostMapping("/sessions/start")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiSpecResponse<GameSessionDTO> startSession() {
        return ApiSpecResponse.ok(gameFacade.startSession());
    }

    @Operation(summary = "Get current active session for logged-in user")
    @GetMapping("/sessions/current")
    @RequireAuth
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<GameSessionDTO> currentSession() {
        return ApiSpecResponse.ok(gameFacade.getCurrentSession());
    }

    @Operation(summary = "Get a session by session id")
    @GetMapping("/sessions/{sessionId}")
    @ApiResponseContract(ApiEndpointKind.DETAIL)
    public ApiSpecResponse<GameSessionDTO> getSessionById(
        @PathVariable("sessionId") UUID sessionId
    ) {
        return ApiSpecResponse.ok(gameFacade.getSessionById(sessionId));
    }

    @Operation(summary = "Perform one gameplay action")
    @PostMapping("/actions")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<GameActionResponse> performAction(
        @Valid @RequestBody UnifiedRequest<GameActionRequest> request
    ) {
        return ApiSpecResponse.ok(gameFacade.performAction(request.getData()));
    }

    @Operation(summary = "End an active session")
    @PostMapping("/sessions/{sessionId}/end")
    @ApiResponseContract(ApiEndpointKind.COMMAND)
    public ApiSpecResponse<GameActionResponse> endSession(
        @PathVariable("sessionId") UUID sessionId
    ) {
        return ApiSpecResponse.ok(gameFacade.endSession(sessionId));
    }
}
