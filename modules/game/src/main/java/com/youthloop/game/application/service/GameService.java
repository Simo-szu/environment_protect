package com.youthloop.game.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.common.api.PageResponse;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
import com.youthloop.game.api.dto.GameActionLogDTO;
import com.youthloop.game.api.dto.GameActionRequest;
import com.youthloop.game.api.dto.GameActionResponse;
import com.youthloop.game.api.dto.GameCardMetaDTO;
import com.youthloop.game.api.dto.GameSessionDTO;
import com.youthloop.game.persistence.entity.GameActionEntity;
import com.youthloop.game.persistence.entity.GameSessionEntity;
import com.youthloop.game.persistence.mapper.GameActionMapper;
import com.youthloop.game.persistence.mapper.GameSessionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private static final int ACTION_PLACE_CORE_CARD = 1;
    private static final int ACTION_END_TURN = 2;
    private static final int ACTION_USE_POLICY_CARD = 3;
    private static final int ACTION_TRADE_CARBON = 4;
    private static final int ACTION_DISCARD_CARD = 5;
    private static final int ACTION_REMOVE_CORE_CARD = 6;

    private static final int SESSION_ACTIVE = 1;
    private static final int SESSION_ENDED = 3;

    private static final String TAG_LOW_CARBON_CORE = "low_carbon_core";
    private static final String TAG_SHENZHEN = "shenzhen_tag";
    private static final String TAG_LINK = "link_tag";
    private static final String TAG_NEW_ENERGY_EFFECT = "new_energy_effect";

    private static final String ENDING_FAILURE = "failure";
    private static final String ENDING_INNOVATION = "innovation_technology";
    private static final String ENDING_ECOLOGY = "ecology_priority";
    private static final String ENDING_DOUGHNUT = "doughnut_city";
    private static final String ENDING_ZERO_TRADE_ECOLOGY = "zero_trade_ecology_priority";
    private static final String ENDING_SPEEDRUN_EFFICIENT = "speedrun_efficient_layout";
    private static final int INITIAL_CARBON_QUOTA = 50;
    private static final int CARBON_QUOTA_BASELINE = 90;
    private static final int CARBON_QUOTA_PER_N_OVER = 10;

    private final GameSessionMapper gameSessionMapper;
    private final GameActionMapper gameActionMapper;
    private final CardCatalogService cardCatalogService;
    private final GameRuleConfigService gameRuleConfigService;
    private final ObjectMapper objectMapper;
    private final Map<UUID, GameSessionEntity> guestSessions = new ConcurrentHashMap<>();

    @Transactional
    public GameSessionDTO startSession() {
        UUID userId = resolveCurrentUserIdOptional();
        if (userId != null) {
            GameSessionEntity existing = gameSessionMapper.selectActiveByUserId(userId);
            if (existing != null) {
                return toDTO(existing);
            }
            GameSessionEntity session = createSession(userId, false);
            gameSessionMapper.insert(session);
            return toDTO(session);
        }

        GameSessionEntity guestSession = createSession(UUID.randomUUID(), true);
        gameSessionMapper.insert(guestSession);
        guestSessions.put(guestSession.getId(), guestSession);
        return toDTO(guestSession);
    }

    public GameSessionDTO getCurrentSession() {
        UUID userId = resolveCurrentUserId();
        GameSessionEntity session = gameSessionMapper.selectActiveByUserId(userId);
        if (session == null) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
        }
        ObjectNode state = ensureStateObject(session.getPondState());
        syncRuntimeConfigForSession(state);
        processPendingDiscardTimeout(state);
        processTradeWindowTimeout(state);
        session.setPondState(state);
        session.setUpdatedAt(OffsetDateTime.now());
        gameSessionMapper.update(session);
        return toDTO(session);
    }

    public GameSessionDTO getSessionById(UUID sessionId) {
        if (sessionId == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "sessionId is required");
        }

        UUID userId = resolveCurrentUserIdOptional();
        if (userId != null) {
            GameSessionEntity session = gameSessionMapper.selectById(sessionId);
            if (session == null || !userId.equals(session.getUserId())) {
                throw new BizException(ErrorCode.GAME_SESSION_INVALID);
            }
            ObjectNode state = ensureStateObject(session.getPondState());
            syncRuntimeConfigForSession(state);
            processPendingDiscardTimeout(state);
            processTradeWindowTimeout(state);
            session.setPondState(state);
            session.setUpdatedAt(OffsetDateTime.now());
            gameSessionMapper.update(session);
            return toDTO(session);
        }

        GameSessionEntity guestSession = resolveGuestSession(sessionId);
        if (guestSession == null) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
        }
        ObjectNode guestState = ensureStateObject(guestSession.getPondState());
        syncRuntimeConfigForSession(guestState);
        processPendingDiscardTimeout(guestState);
        processTradeWindowTimeout(guestState);
        guestSession.setPondState(guestState);
        guestSession.setUpdatedAt(OffsetDateTime.now());
        if (guestSession.getUserId() != null) {
            gameSessionMapper.update(guestSession);
        }
        guestSessions.put(guestSession.getId(), guestSession);
        return toDTO(guestSession);
    }

    public List<GameCardMetaDTO> listCards(boolean includePolicy) {
        return cardCatalogService.listCards(includePolicy);
    }

    @Transactional(readOnly = true)
    public PageResponse<GameActionLogDTO> listActions(UUID sessionId, int page, int size) {
        if (sessionId == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "sessionId is required");
        }
        UUID userId = resolveCurrentUserIdOptional();
        if (userId == null) {
            GameSessionEntity guestSession = resolveGuestSession(sessionId);
            if (guestSession == null) {
                throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
            }
            return PageResponse.of(List.of(), 0L, Math.max(1, page), Math.min(100, Math.max(1, size)));
        }

        GameSessionEntity session = gameSessionMapper.selectById(sessionId);
        if (session == null || !userId.equals(session.getUserId())) {
            throw new BizException(ErrorCode.GAME_SESSION_INVALID);
        }

        int validPage = Math.max(1, page);
        int validSize = Math.min(100, Math.max(1, size));
        int offset = (validPage - 1) * validSize;
        long total = gameActionMapper.countBySessionId(sessionId);
        List<GameActionLogDTO> items = gameActionMapper.selectBySessionId(sessionId, offset, validSize)
            .stream()
            .map(this::toActionLogDTO)
            .toList();
        return PageResponse.of(items, total, validPage, validSize);
    }

    @Transactional
    public GameActionResponse performAction(GameActionRequest request) {
        UUID userId = resolveCurrentUserIdOptional();
        if (request == null || request.getSessionId() == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "sessionId is required");
        }

        boolean authenticated = userId != null;
        GameSessionEntity session;
        if (authenticated) {
            session = gameSessionMapper.selectById(request.getSessionId());
            if (session == null || !userId.equals(session.getUserId())) {
                throw new BizException(ErrorCode.GAME_SESSION_INVALID);
            }
        } else {
            session = resolveGuestSession(request.getSessionId());
            if (session == null) {
                throw new BizException(ErrorCode.GAME_SESSION_INVALID);
            }
        }
        if (session.getStatus() != SESSION_ACTIVE) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_ACTIVE);
        }

        ObjectNode state = ensureStateObject(session.getPondState());
        syncRuntimeConfigForSession(state);
        processPendingDiscardTimeout(state);
        processTradeWindowTimeout(state);
        if (state.path("pendingDiscard").path("active").asBoolean(false)
            && request.getActionType() != ACTION_DISCARD_CARD) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Discard required before other actions");
        }
        int pointsEarned;
        String summary;

        if (request.getActionType() == ACTION_PLACE_CORE_CARD) {
            pointsEarned = handlePlaceCoreCard(state, request.getActionData());
            summary = "Card placed";
        } else if (request.getActionType() == ACTION_USE_POLICY_CARD) {
            pointsEarned = handleUsePolicyCard(state, request.getActionData());
            summary = "Policy card used";
        } else if (request.getActionType() == ACTION_TRADE_CARBON) {
            pointsEarned = handleCarbonTrade(state, request.getActionData());
            summary = "Carbon trade executed";
        } else if (request.getActionType() == ACTION_DISCARD_CARD) {
            pointsEarned = handleDiscardCard(state, request.getActionData());
            summary = "Card discarded";
        } else if (request.getActionType() == ACTION_REMOVE_CORE_CARD) {
            pointsEarned = handleRemoveCoreCard(state, request.getActionData());
            summary = "Core card removed";
        } else if (request.getActionType() == ACTION_END_TURN) {
            pointsEarned = handleEndTurn(state);
            summary = "Turn ended";
        } else {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unsupported actionType: " + request.getActionType());
        }

        long latestScore = state.path("metrics").path("lowCarbonScore").asLong(0);
        boolean sessionEnded = state.path("sessionEnded").asBoolean(false) || state.path("turn").asInt() > maxTurn();
        session.setPondState(state);
        session.setScore(latestScore);
        session.setLevel(calculateLevel(latestScore));
        session.setLastActionAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        if (sessionEnded) {
            session.setStatus(SESSION_ENDED);
            if (state.has("ending") && state.path("ending").isObject()) {
                summary = "Ending reached";
            } else {
                summary = "Turn limit reached, session ended";
            }
        }
        if (authenticated) {
            gameSessionMapper.update(session);

            GameActionEntity action = new GameActionEntity();
            action.setId(UUID.randomUUID());
            action.setSessionId(session.getId());
            action.setUserId(userId);
            action.setActionType(request.getActionType());
            action.setActionData(request.getActionData());
            action.setPointsEarned(pointsEarned);
            action.setCreatedAt(OffsetDateTime.now());
            gameActionMapper.insert(action);
        } else {
            if (session.getUserId() != null) {
                gameSessionMapper.update(session);
            }
            guestSessions.put(session.getId(), session);
        }

        ObjectNode sanitizedState = sanitizeStateForClient(state);
        ObjectNode ending = sanitizedState.path("ending").isObject() ? (ObjectNode) sanitizedState.path("ending") : null;
        return GameActionResponse.builder()
            .newPondState(sanitizedState)
            .pointsEarned(pointsEarned)
            .totalScore(latestScore)
            .newLevel(session.getLevel())
            .message(summary)
            .sessionEnded(sessionEnded)
            .endingId(ending == null ? null : ending.path("endingId").asText(null))
            .endingName(ending == null ? null : ending.path("endingName").asText(null))
            .endingImageKey(ending == null ? null : ending.path("imageKey").asText(null))
            .build();
    }

    @Transactional
    public GameActionResponse endSession(UUID sessionId) {
        UUID userId = resolveCurrentUserIdOptional();
        boolean authenticated = userId != null;
        GameSessionEntity session;
        if (authenticated) {
            session = gameSessionMapper.selectById(sessionId);
            if (session == null) {
                throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
            }
            if (!userId.equals(session.getUserId())) {
                throw new BizException(ErrorCode.FORBIDDEN, "No permission to end this session");
            }
        } else {
            session = resolveGuestSession(sessionId);
            if (session == null) {
                throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
            }
        }
        if (session.getStatus() != SESSION_ACTIVE) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_ACTIVE);
        }
        session.setStatus(SESSION_ENDED);
        session.setUpdatedAt(OffsetDateTime.now());
        if (authenticated) {
            gameSessionMapper.update(session);
        } else {
            if (session.getUserId() != null) {
                gameSessionMapper.update(session);
            }
            guestSessions.put(session.getId(), session);
        }

        return GameActionResponse.builder()
            .newPondState(sanitizeStateForClient(session.getPondState()))
            .pointsEarned(0)
            .totalScore(session.getScore())
            .newLevel(session.getLevel())
            .message("Session ended")
            .sessionEnded(true)
            .endingId(session.getPondState().path("ending").path("endingId").asText(null))
            .endingName(session.getPondState().path("ending").path("endingName").asText(null))
            .endingImageKey(session.getPondState().path("ending").path("imageKey").asText(null))
            .build();
    }

    private ObjectNode buildInitialState(boolean guestSession) {
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        ObjectNode root = objectMapper.createObjectNode();
        root.put("turn", 1);
        root.put("phase", balance.initialPhase());
        root.put("eventCooldown", balance.initialEventCooldown());
        root.put("maxTurn", maxTurn());
        root.put("highCarbonStreak", 0);
        root.put("highCarbonOverLimitStreak", 0);
        root.put("carbonTierScoreAccumulated", 0);
        root.put("carbonOverLimitCount", 0);
        root.put("sessionEnded", false);
        root.putNull("ending");
        root.put("guestSession", guestSession);
        root.put("boardSize", balance.boardSize());
        root.put("boardRows", balance.boardSize());
        root.put("boardCols", Math.max(balance.boardSize(), balance.boardSize() + 2));
        root.set("boardOccupied", objectMapper.createObjectNode());
        ObjectNode runtimeConfig = root.putObject("runtimeConfig");
        runtimeConfig.put("endingDisplaySeconds", endingDisplaySeconds());
        runtimeConfig.put("turnTransitionAnimationEnabledDefault", turnTransitionAnimationEnabledDefault());
        runtimeConfig.put("turnTransitionAnimationSeconds", turnTransitionAnimationSeconds());
        runtimeConfig.put("tradeWindowInterval", tradeWindowInterval());
        runtimeConfig.put("freePlacementEnabled", freePlacementEnabled());

        ObjectNode resources = root.putObject("resources");
        resources.put("industry", balance.initialIndustry());
        resources.put("tech", balance.initialTech());
        resources.put("population", balance.initialPopulation());

        ObjectNode metrics = root.putObject("metrics");
        metrics.put("green", balance.initialGreen());
        metrics.put("carbon", balance.initialCarbon());
        metrics.put("satisfaction", balance.initialSatisfaction());
        metrics.put("lowCarbonScore", balance.initialLowCarbonScore());
        ObjectNode domainProgress = root.putObject("domainProgress");
        domainProgress.put("industry", 0);
        domainProgress.put("ecology", 0);
        domainProgress.put("science", 0);
        domainProgress.put("society", 0);

        ObjectNode carbonTrade = root.putObject("carbonTrade");
        carbonTrade.put("quota", INITIAL_CARBON_QUOTA);
        carbonTrade.put("buyAmountTotal", 0D);
        carbonTrade.put("sellAmountTotal", 0D);
        carbonTrade.put("profit", 0D);
        carbonTrade.put("lastPrice", baseCarbonPrice());
        carbonTrade.put("lastWindowTurn", 0);
        carbonTrade.put("windowOpened", false);
        carbonTrade.put("windowExpiresAt", 0L);
        carbonTrade.put("pricePctModifier", 0);
        carbonTrade.put("quotaExhaustedCount", 0);
        carbonTrade.put("invalidOperationCount", 0);
        carbonTrade.put("quotaDeductionStreak", 0);
        carbonTrade.put("lastQuotaConsumed", 0);
        carbonTrade.put("lastQuotaShortage", 0);
        carbonTrade.set("history", objectMapper.createArrayNode());

        ObjectNode pools = root.putObject("remainingPools");
        pools.set("early", toShuffledArray(cardCatalogService.listCoreCardsByPhase("early")));
        pools.set("mid", toShuffledArray(cardCatalogService.listCoreCardsByPhase("mid")));
        pools.set("late", toShuffledArray(cardCatalogService.listCoreCardsByPhase("late")));

        root.set("handCore", objectMapper.createArrayNode());
        root.set("handPolicy", objectMapper.createArrayNode());
        root.set("placedCore", objectMapper.createArrayNode());
        root.set("discardCore", objectMapper.createArrayNode());
        root.set("discardPolicy", objectMapper.createArrayNode());
        root.set("policyUnlocked", objectMapper.createArrayNode());
        root.set("activePolicies", objectMapper.createArrayNode());
        root.set("eventHistory", objectMapper.createArrayNode());
        root.set("activeNegativeEvents", objectMapper.createArrayNode());
        root.set("activePositiveEvents", objectMapper.createArrayNode());
        root.set("comboHistory", objectMapper.createArrayNode());
        root.set("policyHistory", objectMapper.createArrayNode());
        root.set("settlementHistory", objectMapper.createArrayNode());
        root.putNull("cardEffectSnapshot");
        root.put("policyUsedThisTurn", false);
        root.put("corePlacedThisTurn", false);
        root.putNull("lastPolicyUsed");
        ObjectNode policyDrawStats = root.putObject("policyDrawStats");
        policyDrawStats.set("drawCount", objectMapper.createObjectNode());
        policyDrawStats.put("lastDrawn", "");
        root.set("handOverflowHistory", objectMapper.createArrayNode());
        ObjectNode pendingDiscard = root.putObject("pendingDiscard");
        pendingDiscard.put("active", false);
        pendingDiscard.put("expiresAt", 0L);
        pendingDiscard.put("coreRequired", 0);
        pendingDiscard.put("policyRequired", 0);

        ObjectNode eventStats = root.putObject("eventStats");
        eventStats.put("negativeTriggered", 0);
        eventStats.put("negativeResolved", 0);
        eventStats.put("positiveTriggered", 0);
        eventStats.put("positiveEcologySinkTriggered", 0);

        decrementEventCooldownAtTurnStart(root);
        drawCoreCards(root, balance.initialPhase(), balance.initialDrawEarly());
        return root;
    }

    private int handlePlaceCoreCard(ObjectNode state, JsonNode actionData) {
        if (state.path("corePlacedThisTurn").asBoolean(false)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Only one core card can be placed per turn");
        }
        String cardId = readRequiredText(actionData, "cardId");
        int row = readRequiredInt(actionData, "row");
        int col = readRequiredInt(actionData, "col");
        validateBoardPlacement(state, row, col);
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
        if (!"core".equals(card.getCardType())) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Only core cards can be placed");
        }

        ArrayNode hand = state.withArray("handCore");
        int handIndex = indexOf(hand, cardId);
        if (handIndex < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Card is not in hand");
        }

        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        GameCardMetaDTO.UnlockCost cost = card.getUnlockCost();
        int industryCost = safeCost(cost.getIndustry());
        int techCost = safeCost(cost.getTech());
        int populationCost = safeCost(cost.getPopulation());
        int greenCost = safeCost(cost.getGreen());
        int costReductionPct = resolveCorePlacementCostReductionPct(state, card.getDomain());
        industryCost = applyPercentage(industryCost, -costReductionPct);
        techCost = applyPercentage(techCost, -costReductionPct);
        populationCost = applyPercentage(populationCost, -costReductionPct);
        greenCost = applyPercentage(greenCost, -costReductionPct);

        if (resources.path("industry").asInt() < industryCost ||
            resources.path("tech").asInt() < techCost ||
            resources.path("population").asInt() < populationCost ||
            metrics.path("green").asInt() < greenCost) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Insufficient resources for this card");
        }

        resources.put("industry", resources.path("industry").asInt() - industryCost);
        resources.put("tech", resources.path("tech").asInt() - techCost);
        resources.put("population", resources.path("population").asInt() - populationCost);
        metrics.put("green", metrics.path("green").asInt() - greenCost);

        hand.remove(handIndex);
        state.withArray("placedCore").add(cardId);
        state.put("corePlacedThisTurn", true);
        state.with("boardOccupied").put(boardKey(row, col), cardId);
        applyCoreImmediateEffectNow(state, cardId);

        int placedCount = state.withArray("placedCore").size();
        metrics.put("lowCarbonScore", Math.max(0, metrics.path("lowCarbonScore").asInt() + 1));
        updatePhaseByProgress(state, placedCount, metrics.path("lowCarbonScore").asInt());
        return 1;
    }

    private int handleDiscardCard(ObjectNode state, JsonNode actionData) {
        ObjectNode pending = state.with("pendingDiscard");
        if (!pending.path("active").asBoolean(false)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "No pending discard");
        }
        String handType = readRequiredText(actionData, "handType");
        String cardId = readRequiredText(actionData, "cardId");
        if (!"core".equals(handType) && !"policy".equals(handType)) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "handType must be core or policy");
        }

        if ("core".equals(handType)) {
            discardFromHand(state.withArray("handCore"), state.withArray("discardCore"), state, handType, cardId, "player_discard");
        } else {
            discardFromHand(state.withArray("handPolicy"), state.withArray("discardPolicy"), state, handType, cardId, "player_discard");
        }
        refreshPendingDiscardState(state);
        return 0;
    }

    private int handleRemoveCoreCard(ObjectNode state, JsonNode actionData) {
        int row = readRequiredInt(actionData, "row");
        int col = readRequiredInt(actionData, "col");
        int boardRows = boardRows(state);
        int boardCols = boardCols(state);
        if (row < 0 || row >= boardRows || col < 0 || col >= boardCols) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Tile is out of board range");
        }

        ObjectNode occupied = state.with("boardOccupied");
        String key = boardKey(row, col);
        if (!occupied.has(key)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Tile has no placed core card");
        }

        String cardId = occupied.path(key).asText();
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
        if (!"core".equals(card.getCardType())) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Only core cards can be removed");
        }

        int placedIndex = indexOf(state.withArray("placedCore"), cardId);
        if (placedIndex < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Placed core card record not found");
        }

        GameCardMetaDTO.UnlockCost cost = card.getUnlockCost();
        int industryRefund = safeCost(cost.getIndustry());
        int techRefund = safeCost(cost.getTech());
        int populationRefund = safeCost(cost.getPopulation());
        int greenRefund = safeCost(cost.getGreen());
        int costReductionPct = resolveCorePlacementCostReductionPct(state, card.getDomain());
        industryRefund = applyPercentage(industryRefund, -costReductionPct);
        techRefund = applyPercentage(techRefund, -costReductionPct);
        populationRefund = applyPercentage(populationRefund, -costReductionPct);
        greenRefund = applyPercentage(greenRefund, -costReductionPct);

        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        resources.put("industry", resources.path("industry").asInt() + industryRefund);
        resources.put("tech", resources.path("tech").asInt() + techRefund);
        resources.put("population", resources.path("population").asInt() + populationRefund);
        metrics.put("green", metrics.path("green").asInt() + greenRefund);

        occupied.remove(key);
        state.withArray("placedCore").remove(placedIndex);
        state.withArray("handCore").add(cardId);
        metrics.put("lowCarbonScore", Math.max(0, metrics.path("lowCarbonScore").asInt() - 1));

        int placedCount = state.withArray("placedCore").size();
        updatePhaseByProgress(state, placedCount, metrics.path("lowCarbonScore").asInt());
        refreshPendingDiscardState(state);
        return 0;
    }

    private int handleUsePolicyCard(ObjectNode state, JsonNode actionData) {
        String cardId = readRequiredText(actionData, "cardId");
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
        if (!"policy".equals(card.getCardType())) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Only policy cards can be used");
        }
        if (state.path("policyUsedThisTurn").asBoolean(false)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Only one policy card can be used per turn");
        }

        ArrayNode unlocked = state.withArray("policyUnlocked");
        if (indexOf(unlocked, cardId) < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Policy card has not been unlocked");
        }

        ArrayNode handPolicy = state.withArray("handPolicy");
        int handIndex = indexOf(handPolicy, cardId);
        if (handIndex < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Policy card is not in hand");
        }

        handPolicy.remove(handIndex);
        applyPolicyEffectNow(state, cardId);
        resolveNegativeEventsByPolicy(state, cardId);
        state.put("policyUsedThisTurn", true);
        state.put("lastPolicyUsed", cardId);

        ObjectNode record = objectMapper.createObjectNode();
        record.put("turn", state.path("turn").asInt());
        record.put("policyId", cardId);
        state.withArray("policyHistory").add(record);
        return 2;
    }

    private int handleEndTurn(ObjectNode state) {
        settlePendingTradeWindowAsSkip(state);

        DomainCounts counts = countPlacedDomains(state);
        refreshDomainProgress(state, counts);
        resolvePolicyUnlocks(state, counts);

        ObjectNode settlementBonus = objectMapper.createObjectNode();
        putAllBonusFields(settlementBonus, 0);

        AdjacencyStats adjacency = calculateAdjacencyStats(state);
        applyAdjacencySynergy(settlementBonus, adjacency);

        applyCoreContinuousEffects(state, counts, settlementBonus);
        applyCoreSpecialEffects(state, counts, settlementBonus);
        int comboTriggered = applyTurnCombos(state, counts, settlementBonus, adjacency);
        applyActivePolicyEffects(state, settlementBonus);
        applyActivePositiveEventEffects(state, settlementBonus);
        applyActiveNegativeEventEffects(state, settlementBonus);
        state.set("cardEffectSnapshot", settlementBonus.deepCopy());

        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        ObjectNode tradeBefore = captureValueNode(state.with("carbonTrade"), "quota", "pricePctModifier");
        ObjectNode resourcesBefore = captureValueNode(resources, "industry", "tech", "population");
        ObjectNode metricsBefore = captureValueNode(metrics, "green", "carbon", "satisfaction", "lowCarbonScore");
        int globalPct = settlementBonus.path("globalPct").asInt(0);
        int industryCarbonReductionPct = settlementBonus.path("industryCarbonReductionPct").asInt(0);
        int newEnergyIndustryCount = countPlacedByTag(state, TAG_NEW_ENERGY_EFFECT);
        int newEnergyExtraIndustry = applyPercentage(
            newEnergyIndustryCount,
            settlementBonus.path("newEnergyIndustryPct").asInt(0)
        ) - newEnergyIndustryCount;
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        int industryGain = applyPercentage(
            balance.settlementBaseIndustryGain() + counts.industry + settlementBonus.path("industry").asInt() + newEnergyExtraIndustry,
            settlementBonus.path("industryPct").asInt(0) + globalPct
        );
        int techGain = applyPercentage(
            balance.settlementBaseTechGain() + counts.science + settlementBonus.path("tech").asInt(),
            settlementBonus.path("techPct").asInt(0) + globalPct
        );
        int populationGain = applyPercentage(
            balance.settlementBasePopulationGain() + counts.society + settlementBonus.path("population").asInt(),
            settlementBonus.path("populationPct").asInt(0) + globalPct
        );
        resources.put("industry", resources.path("industry").asInt() + industryGain);
        resources.put("tech", resources.path("tech").asInt() + techGain);
        resources.put("population", resources.path("population").asInt() + populationGain);

        int greenGain = applyPercentage(
            counts.ecology + settlementBonus.path("green").asInt(),
            settlementBonus.path("greenPct").asInt(0)
        );
        metrics.put("green", Math.max(0, metrics.path("green").asInt() + greenGain));
        int industryCarbon = applyPercentage(counts.industry * balance.carbonIndustryEmissionPerCard(), -industryCarbonReductionPct);
        int carbonDelta = industryCarbon
            - counts.ecology * balance.carbonEcologyReductionPerCard()
            - counts.science * balance.carbonScienceReductionPerCard()
            + settlementBonus.path("carbon").asInt();
        if (carbonDelta > 0) {
            carbonDelta = applyPercentage(carbonDelta, -settlementBonus.path("carbonDeltaReductionPct").asInt(0));
        }
        metrics.put(
            "carbon",
            Math.max(0, metrics.path("carbon").asInt() + carbonDelta)
        );
        metrics.put(
            "satisfaction",
            clamp(
                metrics.path("satisfaction").asInt()
                    + counts.society
                    - Math.max(0, counts.industry - counts.ecology)
                    + settlementBonus.path("satisfaction").asInt(),
                0,
                balance.satisfactionMax()
            )
        );
        ObjectNode trade = state.with("carbonTrade");
        int quotaBonus = settlementBonus.path("quota").asInt(0);
        if (quotaBonus != 0) {
            trade.put("quota", clamp(trade.path("quota").asInt(0) + quotaBonus, 0, maxCarbonQuota()));
        }
        trade.put("pricePctModifier", settlementBonus.path("tradePricePct").asInt(0));
        applyCarbonQuotaSettlement(state);
        updateCarbonOverLimitStreak(state);

        int phaseMatchBonus = calculatePhaseMatchBonus(state);
        LowCarbonScoreBreakdown scoreBreakdown = calculateLowCarbonScoreBreakdown(state, counts.late);
        int lowCarbonScoreRaw = Math.max(0, scoreBreakdown.totalBeforeBonuses() + settlementBonus.path("lowCarbon").asInt(0) + phaseMatchBonus);
        int lowCarbonScore = Math.max(
            0,
            applyPercentage(lowCarbonScoreRaw, settlementBonus.path("lowCarbonPct").asInt(0) + globalPct)
        );
        metrics.put("lowCarbonScore", lowCarbonScore);
        updateLowCarbonScoreBreakdown(state, scoreBreakdown, settlementBonus.path("lowCarbon").asInt(0), phaseMatchBonus, settlementBonus.path("lowCarbonPct").asInt(0) + globalPct, lowCarbonScoreRaw, lowCarbonScore);
        appendSettlementHistory(state, settlementBonus, resourcesBefore, metricsBefore, tradeBefore);

        tickActivePositiveEvents(state);
        tickActiveNegativeEvents(state);
        applyEventCheck(state);
        processCarbonTradeWindow(state);
        updateFailureStreak(state);
        applyEndingEvaluationByDocument(state, counts, lowCarbonScore);

        if (!state.path("sessionEnded").asBoolean(false)) {
            state.put("turn", state.path("turn").asInt() + 1);
            prepareNextTurn(state);
        }

        int baseTurnPoint = Math.max(0, lowCarbonScore - Math.max(0, state.path("turn").asInt() - 1));
        return baseTurnPoint + comboTriggered;
    }

    private void prepareNextTurn(ObjectNode state) {
        int placedCount = state.withArray("placedCore").size();
        int lowCarbonScore = state.with("metrics").path("lowCarbonScore").asInt();
        String phase = updatePhaseByProgress(state, placedCount, lowCarbonScore);
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        decrementEventCooldownAtTurnStart(state);
        int drawCount = switch (phase) {
            case "early" -> balance.drawCountEarly();
            case "mid" -> balance.drawCountMid();
            default -> balance.drawCountLate();
        };
        drawCoreCards(state, phase, drawCount);
        drawPolicyCards(state);
        state.put("policyUsedThisTurn", false);
        state.put("corePlacedThisTurn", false);
        state.putNull("lastPolicyUsed");
    }

    private void validateBoardPlacement(ObjectNode state, int row, int col) {
        int boardRows = boardRows(state);
        int boardCols = boardCols(state);
        if (row < 0 || row >= boardRows || col < 0 || col >= boardCols) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Tile is out of board range");
        }
        ObjectNode occupied = state.with("boardOccupied");
        String key = boardKey(row, col);
        if (occupied.has(key)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Tile already occupied");
        }
        if (freePlacementEnabled(state)) {
            return;
        }
        if (occupied.isEmpty()) {
            return;
        }
        if (!hasOrthogonalAdjacent(occupied, row, col)) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Tile must be orthogonally adjacent");
        }
    }

    private boolean hasOrthogonalAdjacent(ObjectNode occupied, int row, int col) {
        return occupied.has(boardKey(row - 1, col))
            || occupied.has(boardKey(row + 1, col))
            || occupied.has(boardKey(row, col - 1))
            || occupied.has(boardKey(row, col + 1));
    }

    private int boardRows(ObjectNode state) {
        int boardSize = state.path("boardSize").asInt(balanceRule().boardSize());
        return Math.max(1, state.path("boardRows").asInt(boardSize));
    }

    private int boardCols(ObjectNode state) {
        int boardSize = state.path("boardSize").asInt(balanceRule().boardSize());
        // fallback must match frontend: boardRows + 2
        int fallback = boardRows(state) + 2;
        return Math.max(1, state.path("boardCols").asInt(fallback));
    }

    private String boardKey(int row, int col) {
        return row + "," + col;
    }

    private DomainCounts countPlacedDomains(ObjectNode state) {
        ArrayNode placed = state.withArray("placedCore");
        DomainCounts counts = new DomainCounts();
        for (JsonNode cardNode : placed) {
            String cardId = cardNode.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            switch (card.getDomain()) {
                case "industry" -> counts.industry++;
                case "ecology" -> counts.ecology++;
                case "science" -> counts.science++;
                case "society" -> counts.society++;
                default -> {
                    // no-op
                }
            }
            if ("late".equals(card.getPhaseBucket())) {
                counts.late++;
            }
            counts.total++;
        }
        return counts;
    }
    private void resolvePolicyUnlocks(ObjectNode state, DomainCounts counts) {
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        ArrayNode unlocked = state.withArray("policyUnlocked");
        for (GameRuleConfigService.PolicyUnlockRuleConfig rule : gameRuleConfigService.listPolicyUnlockRules()) {
            tryUnlockPolicy(state, unlocked, rule.policyId(), isPolicyUnlockRuleMatched(state, counts, resources, metrics, rule));
        }
    }

    private boolean isPolicyUnlockRuleMatched(
        ObjectNode state,
        DomainCounts counts,
        ObjectNode resources,
        ObjectNode metrics,
        GameRuleConfigService.PolicyUnlockRuleConfig rule
    ) {
        if (counts.industry < rule.minIndustry()) {
            return false;
        }
        if (counts.ecology < rule.minEcology()) {
            return false;
        }
        if (counts.science < rule.minScience()) {
            return false;
        }
        if (counts.society < rule.minSociety()) {
            return false;
        }
        if (resources.path("industry").asInt() < rule.minIndustryResource()) {
            return false;
        }
        if (resources.path("tech").asInt() < rule.minTechResource()) {
            return false;
        }
        if (resources.path("population").asInt() < rule.minPopulationResource()) {
            return false;
        }
        if (rule.minGreen() != null && metrics.path("green").asInt() < rule.minGreen()) {
            return false;
        }
        if (rule.minCarbon() != null && metrics.path("carbon").asInt() < rule.minCarbon()) {
            return false;
        }
        if (rule.maxCarbon() != null && metrics.path("carbon").asInt() > rule.maxCarbon()) {
            return false;
        }
        if (rule.minSatisfaction() != null && metrics.path("satisfaction").asInt() < rule.minSatisfaction()) {
            return false;
        }
        if (rule.minTaggedCards() > 0) {
            return countPlacedByConditionTag(state, rule.requiredTag()) >= rule.minTaggedCards();
        }
        return true;
    }

    private int countPlacedTaggedCardsByTagAndDomain(ObjectNode state, String domain, String tagCode) {
        Set<String> taggedCards = taggedCardIdSet(tagCode);
        if (taggedCards.isEmpty()) {
            return 0;
        }
        int count = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            if (domain.equals(card.getDomain()) && taggedCards.contains(cardId)) {
                count++;
            }
        }
        return count;
    }

    private int countPlacedByTag(ObjectNode state, String tagCode) {
        Set<String> taggedCards = taggedCardIdSet(tagCode);
        if (taggedCards.isEmpty()) {
            return 0;
        }
        int count = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            if (taggedCards.contains(node.asText())) {
                count++;
            }
        }
        return count;
    }

    private boolean hasTag(String cardId, String tagCode) {
        return taggedCardIdSet(tagCode).contains(cardId);
    }

    private Set<String> taggedCardIdSet(String tagCode) {
        Map<String, List<String>> cardTagMap = gameRuleConfigService.cardTagMap();
        if (cardTagMap == null) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "Game card tag config is not loaded");
        }
        List<String> cardIds = cardTagMap.get(tagCode);
        if (cardIds == null || cardIds.isEmpty()) {
            return Set.of();
        }
        return Set.copyOf(cardIds);
    }

    private AdjacencyStats calculateAdjacencyStats(ObjectNode state) {
        AdjacencyStats stats = new AdjacencyStats();
        ObjectNode occupied = state.with("boardOccupied");
        List<String> keys = new ArrayList<>();
        occupied.fieldNames().forEachRemaining(keys::add);

        for (String key : keys) {
            Coord coord = parseCoord(key);
            if (coord == null) {
                continue;
            }
            String cardId = occupied.path(key).asText("");
            if (cardId.isBlank()) {
                continue;
            }
            String rightKey = boardKey(coord.row, coord.col + 1);
            String downKey = boardKey(coord.row + 1, coord.col);
            if (occupied.has(rightKey)) {
                accumulatePair(stats, cardId, occupied.path(rightKey).asText(""));
            }
            if (occupied.has(downKey)) {
                accumulatePair(stats, cardId, occupied.path(downKey).asText(""));
            }
        }
        return stats;
    }

    private Coord parseCoord(String key) {
        String[] parts = key.split(",");
        if (parts.length != 2) {
            return null;
        }
        try {
            return new Coord(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private void accumulatePair(AdjacencyStats stats, String leftCardId, String rightCardId) {
        if (leftCardId.isBlank() || rightCardId.isBlank()) {
            return;
        }
        GameCardMetaDTO left = cardCatalogService.getRequiredCard(leftCardId);
        GameCardMetaDTO right = cardCatalogService.getRequiredCard(rightCardId);
        String leftDomain = left.getDomain();
        String rightDomain = right.getDomain();
        boolean leftLowCarbon = hasTag(leftCardId, TAG_LOW_CARBON_CORE);
        boolean rightLowCarbon = hasTag(rightCardId, TAG_LOW_CARBON_CORE);

        if ("industry".equals(leftDomain) && "industry".equals(rightDomain) && leftLowCarbon && rightLowCarbon) {
            stats.industryLowCarbonAdjacentPairs++;
        }
        if ("science".equals(leftDomain) && "science".equals(rightDomain)) {
            stats.scienceScienceAdjacentPairs++;
        }
        if (isPair(leftDomain, rightDomain, "science", "industry")
            && (("industry".equals(leftDomain) && leftLowCarbon) || ("industry".equals(rightDomain) && rightLowCarbon))) {
            stats.scienceIndustryAdjacentPairs++;
        }
        if (isPair(leftDomain, rightDomain, "industry", "ecology")) {
            stats.industryEcologyAdjacentPairs++;
        }
        if (isPair(leftDomain, rightDomain, "society", "ecology")) {
            stats.societyEcologyAdjacentPairs++;
        }
    }

    private boolean isPair(String left, String right, String expectedA, String expectedB) {
        return (expectedA.equals(left) && expectedB.equals(right))
            || (expectedA.equals(right) && expectedB.equals(left));
    }

    private void tryUnlockPolicy(ObjectNode state, ArrayNode unlocked, String policyId, boolean condition) {
        if (!condition || indexOf(unlocked, policyId) >= 0) {
            return;
        }
        unlocked.add(policyId);
        ObjectNode record = objectMapper.createObjectNode();
        record.put("turn", state.path("turn").asInt());
        record.put("eventType", "policy_unlock");
        record.put("policyId", policyId);
        state.withArray("eventHistory").add(record);
    }

    private int applyTurnCombos(ObjectNode state, DomainCounts counts, ObjectNode settlementBonus, AdjacencyStats adjacency) {
        int triggered = 0;
        ArrayNode combos = objectMapper.createArrayNode();
        String lastPolicyUsed = state.path("lastPolicyUsed").asText("");
        int lowCarbonIndustryCount = countPlacedTaggedCardsByTagAndDomain(state, "industry", TAG_LOW_CARBON_CORE);
        int shenzhenEcologyCount = countPlacedTaggedCardsByTagAndDomain(state, "ecology", TAG_SHENZHEN);
        int linkCardCount = countPlacedByTag(state, TAG_LINK);
        boolean scienceComboBlocked = isScienceComboBlocked(state);

        for (GameRuleConfigService.ComboRuleConfig rule : gameRuleConfigService.listComboRules()) {
            if (triggered >= maxComboPerTurn()) {
                break;
            }
            if (scienceComboBlocked && isScienceRelatedCombo(rule)) {
                continue;
            }
            if (!matchesComboTriggerRule(
                rule,
                lastPolicyUsed,
                counts,
                lowCarbonIndustryCount,
                shenzhenEcologyCount,
                linkCardCount,
                adjacency
            )) {
                continue;
            }
            applyComboEffect(settlementBonus, rule.effect());
            combos.add(rule.comboId());
            triggered++;
        }

        state.set("comboTriggeredThisTurn", combos);
        if (!combos.isEmpty()) {
            ObjectNode history = objectMapper.createObjectNode();
            history.put("turn", state.path("turn").asInt());
            history.set("combos", combos);
            state.withArray("comboHistory").add(history);
        }
        return triggered;
    }

    private boolean isScienceComboBlocked(ObjectNode state) {
        for (JsonNode node : state.withArray("activeNegativeEvents")) {
            ObjectNode event = (ObjectNode) node;
            if (event.path("remainingTurns").asInt(0) <= 0) {
                continue;
            }
            if (event.path("blockScienceCombo").asBoolean(false)) {
                return true;
            }
        }
        return false;
    }

    private boolean isScienceRelatedCombo(GameRuleConfigService.ComboRuleConfig rule) {
        return rule.minScience() > 0
            || rule.minScienceScienceAdjacentPairs() > 0
            || rule.minScienceIndustryAdjacentPairs() > 0
            || rule.comboId().contains("science");
    }

    private void applyPolicyEffectNow(ObjectNode state, String policyId) {
        PolicyImmediateEffect effect = resolvePolicyImmediateEffect(policyId);
        if (effect == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown policy id: " + policyId);
        }
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        ObjectNode trade = state.with("carbonTrade");
        resources.put("industry", resources.path("industry").asInt() + effect.industryDelta());
        resources.put("tech", resources.path("tech").asInt() + effect.techDelta());
        resources.put("population", resources.path("population").asInt() + effect.populationDelta());
        metrics.put("green", metrics.path("green").asInt() + effect.greenDelta());
        metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() + effect.carbonDelta()));
        metrics.put(
            "satisfaction",
            clamp(metrics.path("satisfaction").asInt() + effect.satisfactionDelta(), 0, balanceRule().satisfactionMax())
        );
        trade.put("quota", clamp(trade.path("quota").asInt(0) + effect.quotaDelta(), 0, maxCarbonQuota()));
        if (!effect.group().isBlank() && effect.turns() > 0) {
            upsertActivePolicy(state, policyId, effect.group(), effect.turns());
        }
    }

    private void upsertActivePolicy(ObjectNode state, String policyId, String group, int turns) {
        ArrayNode activePolicies = state.withArray("activePolicies");
        for (int i = activePolicies.size() - 1; i >= 0; i--) {
            if (group.equals(activePolicies.path(i).path("group").asText())) {
                activePolicies.remove(i);
            }
        }
        ObjectNode policyState = objectMapper.createObjectNode();
        policyState.put("policyId", policyId);
        policyState.put("group", group);
        policyState.put("remainingTurns", turns);
        activePolicies.add(policyState);
    }

    private void applyActivePolicyEffects(ObjectNode state, ObjectNode settlementBonus) {
        ArrayNode activePolicies = state.withArray("activePolicies");
        for (int i = activePolicies.size() - 1; i >= 0; i--) {
            ObjectNode policy = (ObjectNode) activePolicies.get(i);
            String policyId = policy.path("policyId").asText();
            PolicyContinuousEffect effect = resolvePolicyContinuousEffect(policyId);
            if (effect != null) {
                addBonus(settlementBonus, "industry", effect.industryDelta());
                addBonus(settlementBonus, "tech", effect.techDelta());
                addBonus(settlementBonus, "population", effect.populationDelta());
                addBonus(settlementBonus, "green", effect.greenDelta());
                addBonus(settlementBonus, "carbon", effect.carbonDelta());
                addBonus(settlementBonus, "satisfaction", effect.satisfactionDelta());
                addBonus(settlementBonus, "lowCarbon", effect.lowCarbonDelta());
                addPercentBonus(settlementBonus, "greenPct", effect.greenPct());
                addPercentBonus(settlementBonus, "techPct", effect.techPct());
                addPercentBonus(settlementBonus, "populationPct", effect.populationPct());
                addPercentBonus(settlementBonus, "industryPct", effect.industryPct());
                addPercentBonus(settlementBonus, "industryCarbonReductionPct", effect.industryCarbonReductionPct());
            }

            int remain = policy.path("remainingTurns").asInt();
            if (remain <= 1) {
                activePolicies.remove(i);
            } else {
                policy.put("remainingTurns", remain - 1);
            }
        }
    }

    private PolicyImmediateEffect resolvePolicyImmediateEffect(String policyId) {
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(policyId);
        if (card == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown policy id: " + policyId);
        }
        return new PolicyImmediateEffect(
            card.getPolicyImmediateIndustryDelta() == null ? 0 : card.getPolicyImmediateIndustryDelta(),
            card.getPolicyImmediateTechDelta() == null ? 0 : card.getPolicyImmediateTechDelta(),
            card.getPolicyImmediatePopulationDelta() == null ? 0 : card.getPolicyImmediatePopulationDelta(),
            card.getPolicyImmediateGreenDelta() == null ? 0 : card.getPolicyImmediateGreenDelta(),
            card.getPolicyImmediateCarbonDelta() == null ? 0 : card.getPolicyImmediateCarbonDelta(),
            card.getPolicyImmediateSatisfactionDelta() == null ? 0 : card.getPolicyImmediateSatisfactionDelta(),
            card.getPolicyImmediateQuotaDelta() == null ? 0 : card.getPolicyImmediateQuotaDelta(),
            card.getPolicyImmediateGroup() == null ? "" : card.getPolicyImmediateGroup(),
            card.getPolicyImmediateTurns() == null ? 0 : card.getPolicyImmediateTurns()
        );
    }

    private PolicyContinuousEffect resolvePolicyContinuousEffect(String policyId) {
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(policyId);
        if (card == null) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown policy id: " + policyId);
        }
        return new PolicyContinuousEffect(
            card.getPolicyContinuousIndustryDelta() == null ? 0 : card.getPolicyContinuousIndustryDelta(),
            card.getPolicyContinuousTechDelta() == null ? 0 : card.getPolicyContinuousTechDelta(),
            card.getPolicyContinuousPopulationDelta() == null ? 0 : card.getPolicyContinuousPopulationDelta(),
            card.getPolicyContinuousGreenDelta() == null ? 0 : card.getPolicyContinuousGreenDelta(),
            card.getPolicyContinuousCarbonDelta() == null ? 0 : card.getPolicyContinuousCarbonDelta(),
            card.getPolicyContinuousSatisfactionDelta() == null ? 0 : card.getPolicyContinuousSatisfactionDelta(),
            card.getPolicyContinuousLowCarbonDelta() == null ? 0 : card.getPolicyContinuousLowCarbonDelta(),
            card.getPolicyContinuousGreenPct() == null ? 0 : card.getPolicyContinuousGreenPct(),
            card.getPolicyContinuousTechPct() == null ? 0 : card.getPolicyContinuousTechPct(),
            card.getPolicyContinuousPopulationPct() == null ? 0 : card.getPolicyContinuousPopulationPct(),
            card.getPolicyContinuousIndustryPct() == null ? 0 : card.getPolicyContinuousIndustryPct(),
            card.getPolicyContinuousIndustryCarbonReductionPct() == null ? 0 : card.getPolicyContinuousIndustryCarbonReductionPct()
        );
    }

    private void applyCoreImmediateEffectNow(ObjectNode state, String cardId) {
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
        DomainCounts counts = countPlacedDomains(state);
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        if (!isCoreEffectConditionMatched(cardId, card, state, counts, resources, metrics)) {
            return;
        }
        CoreImmediateEffect effect = resolveCoreImmediateEffect(cardId, card);
        resources.put("industry", resources.path("industry").asInt() + effect.industryDelta());
        resources.put("tech", resources.path("tech").asInt() + effect.techDelta());
        resources.put("population", resources.path("population").asInt() + effect.populationDelta());
        metrics.put("green", metrics.path("green").asInt() + effect.greenDelta());

        int carbon = Math.max(0, metrics.path("carbon").asInt() + effect.carbonDelta() + effect.industryCarbonDelta());
        if (effect.industryCarbonReductionPct() > 0) {
            carbon = Math.max(0, applyPercentage(carbon, -effect.industryCarbonReductionPct()));
        }
        metrics.put("carbon", carbon);
        metrics.put(
            "satisfaction",
            clamp(metrics.path("satisfaction").asInt() + effect.satisfactionDelta(), 0, balanceRule().satisfactionMax())
        );
        ObjectNode trade = state.with("carbonTrade");
        trade.put("quota", clamp(trade.path("quota").asInt(0) + effect.quotaDelta(), 0, maxCarbonQuota()));
    }

    private void applyActiveNegativeEventEffects(ObjectNode state, ObjectNode settlementBonus) {
        ArrayNode activeEvents = state.withArray("activeNegativeEvents");
        for (JsonNode node : activeEvents) {
            ObjectNode event = (ObjectNode) node;
            if (event.path("remainingTurns").asInt(0) <= 1) {
                continue;
            }
            addBonus(settlementBonus, "green", event.path("greenDelta").asInt(0));
            addBonus(settlementBonus, "carbon", event.path("carbonDelta").asInt(0));
            addBonus(settlementBonus, "satisfaction", event.path("satisfactionDelta").asInt(0));
            addPercentBonus(settlementBonus, "greenPct", event.path("greenPctDelta").asInt(0));
            addPercentBonus(settlementBonus, "populationPct", event.path("populationPctDelta").asInt(0));
            addPercentBonus(settlementBonus, "industryPct", event.path("industryPctDelta").asInt(0));
            addPercentBonus(settlementBonus, "techPct", event.path("techPctDelta").asInt(0));
        }
    }

    private void applyActivePositiveEventEffects(ObjectNode state, ObjectNode settlementBonus) {
        ArrayNode activeEvents = state.withArray("activePositiveEvents");
        for (JsonNode node : activeEvents) {
            ObjectNode event = (ObjectNode) node;
            if (event.path("remainingTurns").asInt(0) <= 1) {
                continue;
            }
            addBonus(settlementBonus, "green", event.path("greenDelta").asInt(0));
            addBonus(settlementBonus, "carbon", event.path("carbonDelta").asInt(0));
            addBonus(settlementBonus, "satisfaction", event.path("satisfactionDelta").asInt(0));
            addBonus(settlementBonus, "population", event.path("populationDelta").asInt(0));
            addBonus(settlementBonus, "lowCarbon", event.path("lowCarbonDelta").asInt(0));
            addPercentBonus(settlementBonus, "industryPct", event.path("industryPctDelta").asInt(0));
            addPercentBonus(settlementBonus, "techPct", event.path("techPctDelta").asInt(0));
            addPercentBonus(settlementBonus, "populationPct", event.path("populationPctDelta").asInt(0));
            addPercentBonus(settlementBonus, "industryCarbonReductionPct", event.path("industryCarbonReductionPct").asInt(0));
        }
    }

    private void resolveNegativeEventsByPolicy(ObjectNode state, String policyId) {
        ArrayNode activeEvents = state.withArray("activeNegativeEvents");
        if (activeEvents.isEmpty()) {
            return;
        }

        ObjectNode metrics = state.with("metrics");
        int resolvedCount = 0;
        for (int i = activeEvents.size() - 1; i >= 0; i--) {
            ObjectNode event = (ObjectNode) activeEvents.get(i);
            if (!eventResolvableByPolicy(event, policyId)) {
                continue;
            }
            String eventType = event.path("eventType").asText();

            metrics.put("green", Math.max(0, metrics.path("green").asInt() - event.path("greenDelta").asInt()));
            metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() - event.path("carbonDelta").asInt()));
            metrics.put(
                "satisfaction",
                clamp(metrics.path("satisfaction").asInt() - event.path("satisfactionDelta").asInt(), 0, balanceRule().satisfactionMax())
            );
            activeEvents.remove(i);
            resolvedCount++;

            ObjectNode record = objectMapper.createObjectNode();
            record.put("turn", state.path("turn").asInt());
            record.put("eventType", "event_resolved");
            record.put("resolvedEvent", eventType);
            record.put("policyId", policyId);
            state.withArray("eventHistory").add(record);
        }

        if (resolvedCount > 0) {
            ObjectNode stats = state.with("eventStats");
            stats.put("negativeResolved", stats.path("negativeResolved").asInt(0) + resolvedCount);
        }
    }

    private boolean eventResolvableByPolicy(ObjectNode event, String policyId) {
        if (policyId == null || policyId.isBlank()) {
            return false;
        }
        ArrayNode resolvableBy = event.withArray("resolvablePolicyIds");
        for (JsonNode node : resolvableBy) {
            if (policyId.equals(node.asText(""))) {
                return true;
            }
        }
        return false;
    }

    private void drawPolicyCards(ObjectNode state) {
        ArrayNode unlocked = state.withArray("policyUnlocked");
        if (unlocked.isEmpty()) {
            return;
        }

        ArrayNode handPolicy = state.withArray("handPolicy");
        String selected = pickPolicyCardForDraw(state, unlocked, handPolicy);
        if (selected == null || selected.isBlank()) {
            return;
        }
        handPolicy.add(selected);
        recordPolicyDraw(state, selected);
        enforcePolicyHandLimit(state);
    }

    private String pickPolicyCardForDraw(ObjectNode state, ArrayNode unlocked, ArrayNode handPolicy) {
        List<String> unlockedIds = new ArrayList<>();
        for (JsonNode node : unlocked) {
            String policyId = node.asText("");
            if (!policyId.isBlank()) {
                unlockedIds.add(policyId);
            }
        }
        if (unlockedIds.isEmpty()) {
            return "";
        }

        Set<String> handPolicySet = new HashSet<>();
        for (JsonNode node : handPolicy) {
            String policyId = node.asText("");
            if (!policyId.isBlank()) {
                handPolicySet.add(policyId);
            }
        }

        List<String> candidatePool = new ArrayList<>();
        for (String policyId : unlockedIds) {
            // Session uniqueness: do not redraw a policy that has already appeared in this run.
            if (!handPolicySet.contains(policyId) && countPolicyDraw(state, policyId) == 0) {
                candidatePool.add(policyId);
            }
        }
        if (candidatePool.isEmpty()) {
            // Avoid drawing duplicate policy cards into hand when no new candidate exists.
            return "";
        }

        Set<String> activeEventTypes = activeNegativeEventTypeSet(state);
        if (!activeEventTypes.isEmpty()) {
            List<String> resolvers = new ArrayList<>();
            for (String policyId : candidatePool) {
                if (canResolveAnyActiveNegativeEvent(state, policyId)) {
                    resolvers.add(policyId);
                }
            }
            if (!resolvers.isEmpty()) {
                return pickLeastUsedAndLeastDrawnPolicy(state, resolvers);
            }
        }

        return pickLeastUsedAndLeastDrawnPolicy(state, candidatePool);
    }

    private boolean canResolveAnyActiveNegativeEvent(ObjectNode state, String policyId) {
        if (policyId == null || policyId.isBlank()) {
            return false;
        }
        ArrayNode activeEvents = state.withArray("activeNegativeEvents");
        for (JsonNode node : activeEvents) {
            ObjectNode event = (ObjectNode) node;
            if (eventResolvableByPolicy(event, policyId)) {
                return true;
            }
        }
        return false;
    }

    private String pickLeastUsedAndLeastDrawnPolicy(ObjectNode state, List<String> candidates) {
        if (candidates.isEmpty()) {
            return "";
        }
        int minUsage = Integer.MAX_VALUE;
        List<String> leastUsed = new ArrayList<>();
        for (String policyId : candidates) {
            int usage = countPolicyUsage(state, policyId);
            if (usage < minUsage) {
                minUsage = usage;
                leastUsed.clear();
                leastUsed.add(policyId);
            } else if (usage == minUsage) {
                leastUsed.add(policyId);
            }
        }

        int minDrawCount = Integer.MAX_VALUE;
        List<String> leastDrawn = new ArrayList<>();
        for (String policyId : leastUsed) {
            int drawCount = countPolicyDraw(state, policyId);
            if (drawCount < minDrawCount) {
                minDrawCount = drawCount;
                leastDrawn.clear();
                leastDrawn.add(policyId);
            } else if (drawCount == minDrawCount) {
                leastDrawn.add(policyId);
            }
        }

        String lastDrawn = state.with("policyDrawStats").path("lastDrawn").asText("");
        if (leastDrawn.size() > 1 && lastDrawn != null && !lastDrawn.isBlank()) {
            List<String> nonRepeating = new ArrayList<>();
            for (String policyId : leastDrawn) {
                if (!lastDrawn.equals(policyId)) {
                    nonRepeating.add(policyId);
                }
            }
            if (!nonRepeating.isEmpty()) {
                return nonRepeating.get(ThreadLocalRandom.current().nextInt(nonRepeating.size()));
            }
        }

        return leastDrawn.get(ThreadLocalRandom.current().nextInt(leastDrawn.size()));
    }

    private int countPolicyDraw(ObjectNode state, String policyId) {
        if (policyId == null || policyId.isBlank()) {
            return 0;
        }
        return state.with("policyDrawStats").with("drawCount").path(policyId).asInt(0);
    }

    private void recordPolicyDraw(ObjectNode state, String policyId) {
        if (policyId == null || policyId.isBlank()) {
            return;
        }
        ObjectNode drawStats = state.with("policyDrawStats");
        ObjectNode drawCount = drawStats.with("drawCount");
        int current = drawCount.path(policyId).asInt(0);
        drawCount.put(policyId, current + 1);
        drawStats.put("lastDrawn", policyId);
    }

    private Set<String> activeNegativeEventTypeSet(ObjectNode state) {
        Set<String> types = new HashSet<>();
        for (JsonNode node : state.withArray("activeNegativeEvents")) {
            String eventType = node.path("eventType").asText("");
            if (!eventType.isBlank()) {
                types.add(eventType);
            }
        }
        return types;
    }

    private void applyCarbonQuotaSettlement(ObjectNode state) {
        int carbon = state.with("metrics").path("carbon").asInt();
        int requiredQuota = carbon > CARBON_QUOTA_BASELINE
            ? Math.max(0, (carbon - CARBON_QUOTA_BASELINE) / CARBON_QUOTA_PER_N_OVER)
            : 0;
        ObjectNode trade = state.with("carbonTrade");
        int quota = trade.path("quota").asInt(INITIAL_CARBON_QUOTA);
        int consumed = Math.min(requiredQuota, quota);
        int shortage = Math.max(0, requiredQuota - consumed);

        trade.put("quota", Math.max(0, quota - consumed));
        trade.put("lastQuotaConsumed", consumed);
        trade.put("lastQuotaShortage", shortage);
        trade.put("quotaDeductionStreak", consumed > 0 ? trade.path("quotaDeductionStreak").asInt(0) + 1 : 0);
        if (shortage > 0) {
            trade.put("quotaExhaustedCount", trade.path("quotaExhaustedCount").asInt(0) + 1);
            ObjectNode record = objectMapper.createObjectNode();
            record.put("turn", state.path("turn").asInt());
            record.put("eventType", "quota_shortage");
            record.put("shortage", shortage);
            state.withArray("eventHistory").add(record);
        }
    }

    private void processCarbonTradeWindow(ObjectNode state) {
        int turn = state.path("turn").asInt();
        ObjectNode trade = state.with("carbonTrade");
        trade.put("windowOpened", false);
        trade.put("windowExpiresAt", 0L);
        if (turn % tradeWindowInterval() != 0) {
            return;
        }

        int carbon = state.with("metrics").path("carbon").asInt();
        int pricePctModifier = trade.path("pricePctModifier").asInt(0);
        double price = calculateCarbonTradePrice(carbon, pricePctModifier);
        trade.put("windowOpened", true);
        trade.put("lastWindowTurn", turn);
        trade.put("lastPrice", price);
        trade.put("windowExpiresAt", 0L);
    }

    private int handleCarbonTrade(ObjectNode state, JsonNode actionData) {
        ObjectNode trade = state.with("carbonTrade");
        if (!trade.path("windowOpened").asBoolean(false)) {
            markTradeViolation(state, "window_not_open");
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Carbon trade window is not open");
        }

        String tradeType = readRequiredText(actionData, "tradeType").toLowerCase();
        int amount = readRequiredInt(actionData, "amount");
        if (amount <= 0) {
            markTradeViolation(state, "invalid_amount");
            throw new BizException(ErrorCode.INVALID_PARAMETER, "amount must be greater than 0");
        }

        ObjectNode resources = state.with("resources");
        int currentQuota = trade.path("quota").asInt(0);
        int maxQuota = maxCarbonQuota();
        double price = trade.path("lastPrice").asDouble(baseCarbonPrice());
        double tradeValue = roundToOneDecimal(amount * price);
        if (!Double.isFinite(tradeValue) || tradeValue < 0D) {
            markTradeViolation(state, "invalid_amount");
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Trade amount exceeds supported range");
        }
        double buyTotal = trade.path("buyAmountTotal").asDouble(0D);
        double sellTotal = trade.path("sellAmountTotal").asDouble(0D);
        int industryBefore = resources.path("industry").asInt();

        if ("buy".equals(tradeType)) {
            if (amount > maxQuota) {
                markTradeViolation(state, "quota_overflow");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Quota exceeds maximum capacity");
            }
            long quotaAfter = (long) currentQuota + amount;
            if (quotaAfter > maxQuota) {
                markTradeViolation(state, "quota_overflow");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Quota exceeds maximum capacity");
            }
            long industryCostLong = (long) Math.ceil(tradeValue);
            if (industryCostLong > Integer.MAX_VALUE) {
                markTradeViolation(state, "invalid_amount");
                throw new BizException(ErrorCode.INVALID_PARAMETER, "Trade amount exceeds supported range");
            }
            int industryCost = (int) industryCostLong;
            if (industryBefore < industryCost) {
                markTradeViolation(state, "insufficient_industry");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Insufficient industry value for trade");
            }
            resources.put("industry", industryBefore - industryCost);
            trade.put("quota", (int) quotaAfter);
            buyTotal = roundToOneDecimal(buyTotal + tradeValue);
            trade.put("buyAmountTotal", buyTotal);
        } else if ("sell".equals(tradeType)) {
            if (currentQuota < amount) {
                markTradeViolation(state, "insufficient_quota");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Insufficient quota for selling");
            }
            long industryGainLong = (long) Math.floor(tradeValue);
            if (industryGainLong > Integer.MAX_VALUE) {
                markTradeViolation(state, "invalid_amount");
                throw new BizException(ErrorCode.INVALID_PARAMETER, "Trade amount exceeds supported range");
            }
            int industryGain = (int) industryGainLong;
            long industryAfter = (long) industryBefore + industryGain;
            if (industryAfter > Integer.MAX_VALUE) {
                markTradeViolation(state, "invalid_amount");
                throw new BizException(ErrorCode.INVALID_PARAMETER, "Trade amount exceeds supported range");
            }
            resources.put("industry", (int) industryAfter);
            trade.put("quota", currentQuota - amount);
            sellTotal = roundToOneDecimal(sellTotal + tradeValue);
            trade.put("sellAmountTotal", sellTotal);
        } else {
            markTradeViolation(state, "invalid_trade_type");
            throw new BizException(ErrorCode.INVALID_PARAMETER, "tradeType must be buy or sell");
        }

        double profitAfter = roundToOneDecimal(sellTotal - buyTotal);
        trade.put("profit", profitAfter);
        // Keep trade window open for potential additional trades in same turn
        // Only close window during turn settlement or manual close
        // trade.put("windowOpened", false);
        // trade.put("windowExpiresAt", 0L);

        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", trade.path("lastWindowTurn").asInt(state.path("turn").asInt()));
        history.put("price", price);
        history.put("action", tradeType);
        history.put("amount", amount);
        history.put("industryDelta", resources.path("industry").asInt() - industryBefore);
        history.put("profitAfter", profitAfter);
        trade.withArray("history").add(history);
        return 1;
    }

    private void markTradeViolation(ObjectNode state, String reason) {
        ObjectNode trade = state.with("carbonTrade");
        trade.put("invalidOperationCount", trade.path("invalidOperationCount").asInt(0) + 1);

        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.put("action", "violation");
        history.put("reason", reason);
        history.put("profitAfter", roundToOneDecimal(trade.path("profit").asDouble(0D)));
        trade.withArray("history").add(history);
    }

    private void settlePendingTradeWindowAsSkip(ObjectNode state) {
        ObjectNode trade = state.with("carbonTrade");
        if (!trade.path("windowOpened").asBoolean(false)) {
            return;
        }

        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", trade.path("lastWindowTurn").asInt(state.path("turn").asInt()));
        history.put("price", trade.path("lastPrice").asDouble(baseCarbonPrice()));
        history.put("action", "skip");
        history.put("amount", 0);
        history.put("industryDelta", 0);
        history.put("profitAfter", roundToOneDecimal(trade.path("profit").asDouble(0D)));
        trade.withArray("history").add(history);
        trade.put("windowOpened", false);
        trade.put("windowExpiresAt", 0L);
    }

    private void processTradeWindowTimeout(ObjectNode state) {
        // Trade window timeout is intentionally disabled:
        // players can decide within the turn and end turn manually.
    }

    private double calculateCarbonTradePrice(int carbon, int pricePctModifier) {
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        double randomFactor = balance.tradeRandomBaseMin() + ThreadLocalRandom.current().nextDouble() * balance.tradeRandomSpan();
        double carbonFactor;
        if (carbon > balance.tradeHighCarbonThreshold()) {
            carbonFactor = balance.tradeHighCarbonFactor();
        } else if (carbon < balance.tradeLowCarbonThreshold()) {
            carbonFactor = balance.tradeLowCarbonFactor();
        } else {
            carbonFactor = 1.0D;
        }
        double basePrice = baseCarbonPrice() * randomFactor * carbonFactor;
        return roundToOneDecimal(basePrice * (1.0D + pricePctModifier / 100.0D));
    }

    private void updateFailureStreak(ObjectNode state) {
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        int carbon = state.path("metrics").path("carbon").asInt();
        if (carbon > balance.failureHighCarbonThreshold()) {
            state.put("highCarbonStreak", state.path("highCarbonStreak").asInt() + 1);
        } else {
            state.put("highCarbonStreak", 0);
        }
    }

    private void updateCarbonOverLimitStreak(ObjectNode state) {
        int carbon = state.path("metrics").path("carbon").asInt();
        // Accumulate per-turn carbon tier score
        int tierScore = calculateCarbonTierScore(carbon);
        state.put("carbonTierScoreAccumulated", state.path("carbonTierScoreAccumulated").asInt(0) + tierScore);
        if (carbon > CARBON_QUOTA_BASELINE) {
            state.put("highCarbonOverLimitStreak", state.path("highCarbonOverLimitStreak").asInt(0) + 1);
            state.put("carbonOverLimitCount", state.path("carbonOverLimitCount").asInt(0) + 1);
        } else {
            state.put("highCarbonOverLimitStreak", 0);
        }
    }

    private void applyEndingEvaluationByDocument(ObjectNode state, DomainCounts counts, int lowCarbonScore) {
        if (state.path("sessionEnded").asBoolean(false)) {
            return;
        }

        ObjectNode metrics = state.with("metrics");
        ObjectNode resources = state.with("resources");
        int turn = state.path("turn").asInt();
        boolean boundaryReached = turn >= maxTurn() || countRemainingCoreCards(state) <= 0;
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        if (!boundaryReached) {
            return;
        }

        boolean immediateFailure = state.path("highCarbonStreak").asInt() >= balance.failureHighCarbonStreakLimit();
        boolean tradeFailure = state.with("carbonTrade").path("quotaExhaustedCount").asInt(0) >= balance.tradeFailureQuotaExhaustedLimit()
            && state.with("carbonTrade").path("profit").asDouble(0D) < balance.tradeFailureProfitThreshold();
        if (immediateFailure) {
            setEnding(state, ENDING_FAILURE, endingFailureReason(ENDING_FAILURE_REASON_HIGH_CARBON));
            return;
        }
        if (tradeFailure) {
            setEnding(state, ENDING_FAILURE, endingFailureReason(ENDING_FAILURE_REASON_TRADE));
            return;
        }

        if (lowCarbonScore < balance.lowCarbonMinForPositiveEnding()) {
            setEnding(state, ENDING_FAILURE, endingFailureReason(ENDING_FAILURE_REASON_LOW_SCORE));
            return;
        }

        int maxDomain = Math.max(Math.max(counts.industry, counts.ecology), Math.max(counts.science, counts.society));
        int minDomain = Math.min(Math.min(counts.industry, counts.ecology), Math.min(counts.science, counts.society));
        int usage6768 = countPolicyUsage(state, "card067") + countPolicyUsage(state, "card068");
        double eventResolveRate = calculateNegativeEventResolveRate(state);
        ObjectNode trade = state.with("carbonTrade");
        ObjectNode eventStats = state.with("eventStats");
        int unlockedPolicyCount = state.withArray("policyUnlocked").size();
        int comboTriggeredCount = countTotalTriggeredCombos(state);
        int positiveEventCount = eventStats.path("positiveTriggered").asInt(0);
        int ecologySinkPositiveEventCount = eventStats.path("positiveEcologySinkTriggered").asInt(0);
        int carbon = metrics.path("carbon").asInt();
        int quota = trade.path("quota").asInt(0);
        double buyAmountTotal = trade.path("buyAmountTotal").asDouble(0D);
        double sellAmountTotal = trade.path("sellAmountTotal").asDouble(0D);
        double tradeProfit = trade.path("profit").asDouble(0D);
        int carbonOverLimitCount = state.path("carbonOverLimitCount").asInt(0);

        boolean ending19ZeroTradeEcology = lowCarbonScore >= 140
            && lowCarbonScore < 160
            && counts.total >= 28
            && unlockedPolicyCount >= 3
            && unlockedPolicyCount <= 5
            && nearlyZero(tradeProfit)
            && nearlyZero(buyAmountTotal)
            && nearlyZero(sellAmountTotal)
            && quota >= 40
            && counts.ecology >= 8
            && metrics.path("green").asInt() >= 110
            && carbon <= CARBON_QUOTA_BASELINE
            && carbonOverLimitCount <= 0
            && ecologySinkPositiveEventCount >= 1;

        boolean ending21SpeedrunEfficient = lowCarbonScore >= 130
            && lowCarbonScore < 150
            && counts.total >= 25
            && unlockedPolicyCount >= 2
            && unlockedPolicyCount <= 4
            && turn <= 25
            && tradeProfit >= 60
            && trade.path("quotaExhaustedCount").asInt(0) <= 0
            && positiveEventCount >= 1
            && state.with("eventStats").path("negativeTriggered").asInt(0) <= 0
            && atLeastTwoDomainsAtLeast(counts, 8)
            && atLeastAllDomains(counts, 4)
            && comboTriggeredCount >= 3;

        if (ending19ZeroTradeEcology) {
            setEnding(state, ENDING_ZERO_TRADE_ECOLOGY, null);
            return;
        }
        if (ending21SpeedrunEfficient) {
            setEnding(state, ENDING_SPEEDRUN_EFFICIENT, null);
            return;
        }

        boolean innovation = counts.science == maxDomain
            && counts.science >= balance.endingInnovationMinScience()
            && resources.path("tech").asInt() >= balance.endingInnovationMinTech()
            && lowCarbonScore >= balance.endingInnovationMinLowCarbon()
            && metrics.path("carbon").asInt() <= balance.endingInnovationMaxCarbon()
            && trade.path("profit").asDouble(0D) >= balance.endingInnovationMinProfit()
            && eventResolveRate >= balance.endingEventResolveRateRequired();

        boolean ecology = counts.ecology == maxDomain
            && counts.ecology >= balance.endingEcologyMinEcology()
            && metrics.path("green").asInt() >= balance.endingEcologyMinGreen()
            && metrics.path("carbon").asInt() <= balance.endingEcologyMaxCarbon()
            && lowCarbonScore >= balance.endingEcologyMinLowCarbon()
            && trade.path("quota").asInt(0) >= balance.endingEcologyMinQuota()
            && eventResolveRate >= balance.endingEventResolveRateRequired();

        boolean doughnut = counts.society == maxDomain
            && counts.society >= balance.endingDoughnutMinSociety()
            && metrics.path("satisfaction").asInt() >= balance.endingDoughnutMinSatisfaction()
            && resources.path("population").asInt() >= balance.endingDoughnutMinPopulation()
            && minDomain >= balance.endingDoughnutMinDomain()
            && metrics.path("carbon").asInt() <= balance.endingDoughnutMaxCarbon()
            && lowCarbonScore >= balance.endingDoughnutMinLowCarbon()
            && usage6768 >= balance.endingDoughnutMinPolicyUsage6768();

        if (innovation) {
            setEnding(state, ENDING_INNOVATION, null);
            return;
        }
        if (ecology) {
            setEnding(state, ENDING_ECOLOGY, null);
            return;
        }
        if (doughnut) {
            setEnding(state, ENDING_DOUGHNUT, null);
            return;
        }

        // Safety net: if the player reaches low-carbon baseline with controlled risk,
        // avoid forcing a failure solely due to strict specialization thresholds.
        boolean positiveBaselineReached = lowCarbonScore >= balance.lowCarbonMinForPositiveEnding()
            && metrics.path("carbon").asInt() <= balance.failureHighCarbonThreshold()
            && eventResolveRate >= Math.max(40D, balance.endingEventResolveRateRequired() - 30D);
        if (positiveBaselineReached) {
            if (counts.science >= counts.ecology && counts.science >= counts.society && counts.science >= counts.industry) {
                setEnding(state, ENDING_INNOVATION, null);
                return;
            }
            if (counts.ecology >= counts.society && counts.ecology >= counts.industry) {
                setEnding(state, ENDING_ECOLOGY, null);
                return;
            }
            setEnding(state, ENDING_DOUGHNUT, null);
            return;
        }

        setEnding(state, ENDING_FAILURE, endingFailureReason(ENDING_FAILURE_REASON_BOUNDARY_DEFAULT));
    }

    private int countPolicyUsage(ObjectNode state, String policyId) {
        int count = 0;
        for (JsonNode node : state.withArray("policyHistory")) {
            if (policyId.equals(node.path("policyId").asText())) {
                count++;
            }
        }
        return count;
    }

    private int countTotalTriggeredCombos(ObjectNode state) {
        int total = 0;
        for (JsonNode history : state.withArray("comboHistory")) {
            total += history.withArray("combos").size();
        }
        return total;
    }

    private boolean nearlyZero(double value) {
        return Math.abs(value) < 0.0001D;
    }

    private boolean atLeastTwoDomainsAtLeast(DomainCounts counts, int threshold) {
        int reached = 0;
        if (counts.industry >= threshold) reached++;
        if (counts.ecology >= threshold) reached++;
        if (counts.science >= threshold) reached++;
        if (counts.society >= threshold) reached++;
        return reached >= 2;
    }

    private boolean atLeastAllDomains(DomainCounts counts, int threshold) {
        return counts.industry >= threshold
            && counts.ecology >= threshold
            && counts.science >= threshold
            && counts.society >= threshold;
    }

    private double calculateNegativeEventResolveRate(ObjectNode state) {
        ObjectNode stats = state.with("eventStats");
        int triggered = stats.path("negativeTriggered").asInt(0);
        int resolved = stats.path("negativeResolved").asInt(0);
        if (triggered <= 0) {
            return 100D;
        }
        return (resolved * 100.0D) / triggered;
    }

    private static final String ENDING_FAILURE_REASON_HIGH_CARBON = "high_carbon";
    private static final String ENDING_FAILURE_REASON_TRADE = "trade";
    private static final String ENDING_FAILURE_REASON_LOW_SCORE = "low_score";
    private static final String ENDING_FAILURE_REASON_BOUNDARY_DEFAULT = "boundary_default";

    private String endingFailureReason(String reasonType) {
        GameRuleConfigService.EndingContentConfig failure = endingContent(ENDING_FAILURE);
        return switch (reasonType) {
            case ENDING_FAILURE_REASON_HIGH_CARBON -> nonBlankOrDefault(failure.failureReasonHighCarbon(), failure.defaultReason());
            case ENDING_FAILURE_REASON_TRADE -> nonBlankOrDefault(failure.failureReasonTrade(), failure.defaultReason());
            case ENDING_FAILURE_REASON_LOW_SCORE -> nonBlankOrDefault(failure.failureReasonLowScore(), failure.defaultReason());
            case ENDING_FAILURE_REASON_BOUNDARY_DEFAULT -> nonBlankOrDefault(failure.failureReasonBoundaryDefault(), failure.defaultReason());
            default -> failure.defaultReason();
        };
    }

    private String nonBlankOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private GameRuleConfigService.EndingContentConfig endingContent(String endingId) {
        GameRuleConfigService.EndingContentConfig config = gameRuleConfigService.endingContentMap().get(endingId);
        if (config == null) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "Missing ending content config: " + endingId);
        }
        return config;
    }

    private void setEnding(ObjectNode state, String endingId, String reasonOverride) {
        GameRuleConfigService.EndingContentConfig content = endingContent(endingId);
        String reason = (reasonOverride == null || reasonOverride.isBlank()) ? content.defaultReason() : reasonOverride;
        ObjectNode ending = objectMapper.createObjectNode();
        ending.put("endingId", endingId);
        ending.put("endingName", content.endingName());
        ending.put("imageKey", content.imageKey());
        ending.put("reason", reason);
        ending.put("turn", state.path("turn").asInt());
        state.set("ending", ending);
        state.put("sessionEnded", true);
    }

    private int calculateLowCarbonScore(ObjectNode state, int latePlaced) {
        return calculateLowCarbonScoreBreakdown(state, latePlaced).totalBeforeBonuses();
    }

    private LowCarbonScoreBreakdown calculateLowCarbonScoreBreakdown(ObjectNode state, int latePlaced) {
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        DomainCounts counts = countPlacedDomains(state);
        int policyUnlocked = state.withArray("policyUnlocked").size();
        int carbon = state.with("metrics").path("carbon").asInt();
        ObjectNode trade = state.with("carbonTrade");
        ObjectNode eventStats = state.with("eventStats");

        int baseCards = counts.total;
        int lateBonus = latePlaced * 2;

        int domainBonus = 0;
        if (counts.industry >= balance.lowCarbonDomainThreshold()) domainBonus += balance.lowCarbonDomainBonus();
        if (counts.ecology >= balance.lowCarbonDomainThreshold()) domainBonus += balance.lowCarbonDomainBonus();
        if (counts.science >= balance.lowCarbonDomainThreshold()) domainBonus += balance.lowCarbonDomainBonus();
        if (counts.society >= balance.lowCarbonDomainThreshold()) domainBonus += balance.lowCarbonDomainBonus();

        int policyUnlockScore = policyUnlocked * balance.lowCarbonPolicyUnlockScore();
        int policyUnlockAllBonus = policyUnlocked >= balance.lowCarbonPolicyUnlockAllCount()
            ? balance.lowCarbonPolicyUnlockAllBonus()
            : 0;

        int resolvedEvents = eventStats.path("negativeResolved").asInt(0);
        int triggeredEvents = eventStats.path("negativeTriggered").asInt(0);
        int unresolvedEvents = Math.max(0, triggeredEvents - resolvedEvents);
        int eventResolveScore = resolvedEvents * balance.lowCarbonEventResolvedScore();
        int eventUnresolvedPenalty = unresolvedEvents * balance.lowCarbonEventTriggeredPenalty();

        int carbonTierScore = state.path("carbonTierScoreAccumulated").asInt(calculateCarbonTierScore(carbon));
        int overLimitPenalty = state.path("highCarbonOverLimitStreak").asInt(0) >= balance.lowCarbonOverLimitStreakThreshold()
            ? balance.lowCarbonOverLimitStreakPenalty()
            : 0;

        int tradeProfitScore = 0;
        double profit = trade.path("profit").asDouble(0D);
        if (profit > 0 && balance.lowCarbonTradeProfitDivisor() > 0) {
            tradeProfitScore = ((int) Math.floor(profit / balance.lowCarbonTradeProfitDivisor())) * balance.lowCarbonTradeProfitBonus();
        }
        int quotaPenalty = trade.path("quotaExhaustedCount").asInt(0) * balance.lowCarbonQuotaExhaustedPenalty();
        int invalidPenalty = trade.path("invalidOperationCount").asInt(0) * balance.lowCarbonInvalidOperationPenalty();

        int total = baseCards
            + lateBonus
            + domainBonus
            + policyUnlockScore
            + policyUnlockAllBonus
            + eventResolveScore
            - eventUnresolvedPenalty
            + carbonTierScore
            - overLimitPenalty
            + tradeProfitScore
            - quotaPenalty
            - invalidPenalty;

        return new LowCarbonScoreBreakdown(
            baseCards,
            lateBonus,
            domainBonus,
            policyUnlockScore,
            policyUnlockAllBonus,
            eventResolveScore,
            eventUnresolvedPenalty,
            carbonTierScore,
            overLimitPenalty,
            tradeProfitScore,
            quotaPenalty,
            invalidPenalty,
            Math.max(0, total)
        );
    }

    private void updateLowCarbonScoreBreakdown(
        ObjectNode state,
        LowCarbonScoreBreakdown breakdown,
        int settlementBonus,
        int phaseMatchBonus,
        int percentageBonus,
        int rawTotal,
        int finalTotal
    ) {
        int target = balanceRule().lowCarbonMinForPositiveEnding();
        ObjectNode node = objectMapper.createObjectNode();
        node.put("baseCards", breakdown.baseCards());
        node.put("latePhaseBonus", breakdown.latePhaseBonus());
        node.put("domainBonus", breakdown.domainBonus());
        node.put("policyUnlockScore", breakdown.policyUnlockScore());
        node.put("policyUnlockAllBonus", breakdown.policyUnlockAllBonus());
        node.put("eventResolveScore", breakdown.eventResolveScore());
        node.put("eventUnresolvedPenalty", breakdown.eventUnresolvedPenalty());
        node.put("carbonTierScore", breakdown.carbonTierScore());
        node.put("overLimitPenalty", breakdown.overLimitPenalty());
        node.put("tradeProfitScore", breakdown.tradeProfitScore());
        node.put("quotaPenalty", breakdown.quotaPenalty());
        node.put("invalidPenalty", breakdown.invalidPenalty());
        node.put("scoreBeforeBonuses", breakdown.totalBeforeBonuses());
        node.put("settlementBonus", settlementBonus);
        node.put("phaseMatchBonus", phaseMatchBonus);
        node.put("percentageBonus", percentageBonus);
        node.put("rawTotal", rawTotal);
        node.put("finalTotal", finalTotal);
        node.put("target", target);
        node.put("gapToTarget", Math.max(0, target - finalTotal));
        state.set("lowCarbonScoreBreakdown", node);
    }

    private int calculateCarbonTierScore(int carbon) {
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        if (carbon <= balance.carbonTier1Max()) {
            return balance.carbonTier1Score();
        }
        if (carbon <= balance.carbonTier2Max()) {
            return balance.carbonTier2Score();
        }
        if (carbon <= balance.carbonTier3Max()) {
            return balance.carbonTier3Score();
        }
        if (carbon <= balance.carbonTier4Max()) {
            return balance.carbonTier4Score();
        }
        return balance.carbonTier5Score();
    }

    private void applyEventCheck(ObjectNode state) {
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        int cooldown = state.path("eventCooldown").asInt();
        if (cooldown <= 0) {
            maybeTriggerPositiveEvent(state);
            boolean triggeredSpecialNegative = maybeTriggerDocumentSpecialNegativeEvent(state);
            if (!triggeredSpecialNegative) {
                maybeTriggerNegativeEvent(state);
            }
            state.put("eventCooldown", balance.eventCooldownResetTurns());
        }
    }

    private void decrementEventCooldownAtTurnStart(ObjectNode state) {
        int cooldown = state.path("eventCooldown").asInt();
        state.put("eventCooldown", cooldown - 1);
    }

    private void tickActiveNegativeEvents(ObjectNode state) {
        ArrayNode activeEvents = state.withArray("activeNegativeEvents");
        for (int i = activeEvents.size() - 1; i >= 0; i--) {
            ObjectNode event = (ObjectNode) activeEvents.get(i);
            int remain = event.path("remainingTurns").asInt(1) - 1;
            if (remain <= 0) {
                activeEvents.remove(i);
            } else {
                event.put("remainingTurns", remain);
            }
        }
    }

    private void tickActivePositiveEvents(ObjectNode state) {
        ArrayNode activeEvents = state.withArray("activePositiveEvents");
        for (int i = activeEvents.size() - 1; i >= 0; i--) {
            ObjectNode event = (ObjectNode) activeEvents.get(i);
            int remain = event.path("remainingTurns").asInt(1) - 1;
            if (remain <= 0) {
                activeEvents.remove(i);
            } else {
                event.put("remainingTurns", remain);
            }
        }
    }

    private void maybeTriggerPositiveEvent(ObjectNode state) {
        ObjectNode metrics = state.with("metrics");
        ObjectNode resources = state.with("resources");
        DomainCounts counts = countPlacedDomains(state);
        int lowCarbonIndustryCount = countPlacedTaggedCardsByTagAndDomain(state, "industry", TAG_LOW_CARBON_CORE);
        int baseProbability = resolveSpecialEventBaseProbability(state, counts);

        List<SpecialPositiveEvent> candidates = new ArrayList<>();
        if (counts.science >= 8 && resources.path("tech").asInt(0) >= 80) {
            candidates.add(new SpecialPositiveEvent(
                "positive_science_breakthrough",
                "深圳低碳科创突破",
                10,
                2,
                0,
                -10,
                0,
                0,
                0,
                0,
                30,
                0,
                "科创点+30%，碳排放-10/回合，持续2回合"
            ));
        }
        if (counts.ecology >= 8 && metrics.path("green").asInt(0) >= 80) {
            candidates.add(new SpecialPositiveEvent(
                "positive_ecology_sink_growth",
                "生态碳汇增值",
                10,
                1,
                15,
                0,
                0,
                0,
                10,
                0,
                0,
                0,
                "绿建度+15，低碳总分+10，持续1回合"
            ));
        }
        if (lowCarbonIndustryCount >= 5 && resources.path("industry").asInt(0) >= 70) {
            candidates.add(new SpecialPositiveEvent(
                "positive_low_carbon_industry_support",
                "低碳产业扶持",
                10,
                2,
                0,
                0,
                0,
                0,
                0,
                25,
                0,
                100,
                "工业产业值+25%，无碳排放增加，持续2回合"
            ));
        }
        if (counts.society >= 8 && metrics.path("satisfaction").asInt(0) >= 85) {
            candidates.add(new SpecialPositiveEvent(
                "positive_citizen_low_carbon_wave",
                "市民低碳参与热潮",
                10,
                1,
                0,
                0,
                15,
                10,
                0,
                0,
                0,
                0,
                "人口+10，市民满意度+15，持续1回合"
            ));
        }
        if (candidates.isEmpty()) {
            return;
        }

        Collections.shuffle(candidates);
        for (SpecialPositiveEvent event : candidates) {
            int finalProbability = clamp(baseProbability + event.probabilityBonusPct(), 0, 100);
            if (ThreadLocalRandom.current().nextInt(100) >= finalProbability) {
                continue;
            }
            applyPositiveEventImmediateEffect(state, event);
            appendPositiveEventHistory(state, event);
            appendPositiveActiveEvent(state, event);
            ObjectNode stats = state.with("eventStats");
            stats.put("positiveTriggered", stats.path("positiveTriggered").asInt(0) + 1);
            if ("positive_ecology_sink_growth".equals(event.eventType())) {
                stats.put("positiveEcologySinkTriggered", stats.path("positiveEcologySinkTriggered").asInt(0) + 1);
            }
            return;
        }
    }

    private boolean maybeTriggerDocumentSpecialNegativeEvent(ObjectNode state) {
        ObjectNode metrics = state.with("metrics");
        ObjectNode resources = state.with("resources");
        DomainCounts counts = countPlacedDomains(state);
        int baseProbability = resolveSpecialEventBaseProbability(state, counts);
        List<SpecialNegativeEvent> candidates = new ArrayList<>();

        if (counts.industry >= 10 && metrics.path("carbon").asInt(0) >= 130) {
            candidates.add(new SpecialNegativeEvent(
                "negative_industrial_carbon_abnormal",
                "工业碳排放异常",
                15,
                1,
                0,
                30,
                0,
                0,
                0,
                -15,
                0,
                false,
                "碳排放+30，工业产业值-15%，持续1回合",
                List.of("card062")
            ));
        }
        if (counts.ecology <= 5 && metrics.path("green").asInt(0) <= 60) {
            candidates.add(new SpecialNegativeEvent(
                "negative_ecology_warning",
                "生态破坏预警",
                15,
                2,
                -8,
                0,
                -5,
                0,
                0,
                0,
                0,
                false,
                "绿建度-8/回合，市民满意度-5/回合，持续2回合",
                List.of("card064")
            ));
        }
        if (counts.science <= 5 && resources.path("tech").asInt(0) <= 60) {
            candidates.add(new SpecialNegativeEvent(
                "negative_science_research_blocked",
                "科创研发受阻",
                15,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                -25,
                true,
                "科创点-25%，无法触发科学板块联动，持续1回合",
                List.of("card065")
            ));
        }
        if (counts.society <= 5 && resources.path("population").asInt(0) >= 80 && metrics.path("green").asInt(0) <= 70) {
            candidates.add(new SpecialNegativeEvent(
                "negative_livability_decline",
                "人口宜居性下降",
                10,
                2,
                0,
                0,
                -8,
                0,
                -20,
                0,
                0,
                false,
                "人口产出-20%，市民满意度-8/回合，持续2回合",
                List.of("card067")
            ));
        }
        if (candidates.isEmpty()) {
            return false;
        }

        Collections.shuffle(candidates);
        for (SpecialNegativeEvent event : candidates) {
            int finalProbability = clamp(baseProbability + event.probabilityBonusPct(), 0, 100);
            if (ThreadLocalRandom.current().nextInt(100) >= finalProbability) {
                continue;
            }
            applySpecialNegativeImmediateEffect(state, event);
            appendSpecialNegativeEventHistory(state, event);
            appendSpecialNegativeActiveEvent(state, event);
            ObjectNode stats = state.with("eventStats");
            stats.put("negativeTriggered", stats.path("negativeTriggered").asInt(0) + 1);
            return true;
        }
        return false;
    }

    private int resolveSpecialEventBaseProbability(ObjectNode state, DomainCounts counts) {
        int base = clamp(gameRuleConfigService.eventTriggerProbabilityPct(), 0, 100);
        if (counts.science >= 8) {
            base += 10;
        }
        if (hasActivePolicy(state, "card065")) {
            base += 15;
        }
        return clamp(base, 0, 100);
    }

    private boolean hasActivePolicy(ObjectNode state, String policyId) {
        if (policyId == null || policyId.isBlank()) {
            return false;
        }
        for (JsonNode node : state.withArray("activePolicies")) {
            if (policyId.equals(node.path("policyId").asText("")) && node.path("remainingTurns").asInt(0) > 0) {
                return true;
            }
        }
        return false;
    }

    private void applySpecialNegativeImmediateEffect(ObjectNode state, SpecialNegativeEvent event) {
        ObjectNode metrics = state.with("metrics");
        metrics.put("green", Math.max(0, metrics.path("green").asInt() + event.greenDelta()));
        metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() + event.carbonDelta()));
        metrics.put("satisfaction", clamp(metrics.path("satisfaction").asInt() + event.satisfactionDelta(), 0, balanceRule().satisfactionMax()));
    }

    private void appendSpecialNegativeEventHistory(ObjectNode state, SpecialNegativeEvent event) {
        ObjectNode eventNode = objectMapper.createObjectNode();
        eventNode.put("turn", state.path("turn").asInt());
        eventNode.put("eventType", event.eventType());
        eventNode.put("eventName", event.eventName());
        eventNode.put("effectSummary", event.effectSummary());
        eventNode.put("resolutionHint", "使用对应政策卡可立即化解");
        ArrayNode resolvableBy = objectMapper.createArrayNode();
        event.resolvablePolicyIds().forEach(resolvableBy::add);
        eventNode.set("resolvablePolicyIds", resolvableBy);
        state.withArray("eventHistory").add(eventNode);
    }

    private void appendSpecialNegativeActiveEvent(ObjectNode state, SpecialNegativeEvent event) {
        ObjectNode activeEvent = objectMapper.createObjectNode();
        activeEvent.put("eventType", event.eventType());
        activeEvent.put("eventName", event.eventName());
        activeEvent.put("remainingTurns", Math.max(1, event.durationTurns()));
        activeEvent.put("greenDelta", event.greenDelta());
        activeEvent.put("carbonDelta", event.carbonDelta());
        activeEvent.put("satisfactionDelta", event.satisfactionDelta());
        activeEvent.put("greenPctDelta", event.greenPctDelta());
        activeEvent.put("populationPctDelta", event.populationPctDelta());
        activeEvent.put("industryPctDelta", event.industryPctDelta());
        activeEvent.put("techPctDelta", event.techPctDelta());
        activeEvent.put("blockScienceCombo", event.blockScienceCombo());
        ArrayNode resolvableBy = objectMapper.createArrayNode();
        event.resolvablePolicyIds().forEach(resolvableBy::add);
        activeEvent.set("resolvablePolicyIds", resolvableBy);
        state.withArray("activeNegativeEvents").add(activeEvent);
    }

    private void applyPositiveEventImmediateEffect(ObjectNode state, SpecialPositiveEvent event) {
        ObjectNode metrics = state.with("metrics");
        ObjectNode resources = state.with("resources");
        metrics.put("green", Math.max(0, metrics.path("green").asInt() + event.greenDelta()));
        metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() + event.carbonDelta()));
        metrics.put("satisfaction", clamp(metrics.path("satisfaction").asInt() + event.satisfactionDelta(), 0, balanceRule().satisfactionMax()));
        metrics.put("lowCarbonScore", Math.max(0, metrics.path("lowCarbonScore").asInt(0) + event.lowCarbonDelta()));
        resources.put("population", Math.max(0, resources.path("population").asInt() + event.populationDelta()));
    }

    private void appendPositiveEventHistory(ObjectNode state, SpecialPositiveEvent event) {
        ObjectNode eventNode = objectMapper.createObjectNode();
        eventNode.put("turn", state.path("turn").asInt());
        eventNode.put("eventType", event.eventType());
        eventNode.put("eventName", event.eventName());
        eventNode.put("effectSummary", event.effectSummary());
        eventNode.put("resolutionHint", "");
        eventNode.put("eventCategory", "positive");
        state.withArray("eventHistory").add(eventNode);
    }

    private void appendPositiveActiveEvent(ObjectNode state, SpecialPositiveEvent event) {
        ObjectNode activeEvent = objectMapper.createObjectNode();
        activeEvent.put("eventType", event.eventType());
        activeEvent.put("eventName", event.eventName());
        activeEvent.put("remainingTurns", Math.max(1, event.durationTurns()));
        activeEvent.put("greenDelta", event.greenDelta());
        activeEvent.put("carbonDelta", event.carbonDelta());
        activeEvent.put("satisfactionDelta", event.satisfactionDelta());
        activeEvent.put("populationDelta", event.populationDelta());
        activeEvent.put("lowCarbonDelta", event.lowCarbonDelta());
        activeEvent.put("industryPctDelta", event.industryPctDelta());
        activeEvent.put("techPctDelta", event.techPctDelta());
        activeEvent.put("industryCarbonReductionPct", event.industryCarbonReductionPct());
        activeEvent.put("populationPctDelta", 0);
        state.withArray("activePositiveEvents").add(activeEvent);
    }

    private void maybeTriggerNegativeEvent(ObjectNode state) {
        int probabilityPct = clamp(gameRuleConfigService.eventTriggerProbabilityPct(), 0, 100);
        if (ThreadLocalRandom.current().nextInt(100) >= probabilityPct) {
            return;
        }

        ObjectNode metrics = state.with("metrics");
        int turn = state.path("turn").asInt();
        ArrayNode candidates = objectMapper.createArrayNode();
        Map<String, GameRuleConfigService.EventRuleConfig> eventRuleMap = gameRuleConfigService.eventRuleMap();
        for (GameRuleConfigService.EventRuleConfig rule : eventRuleMap.values()) {
            if (isEventRuleMatched(state, metrics, turn, rule)) {
                candidates.add(rule.eventType());
            }
        }
        if (candidates.isEmpty()) {
            return;
        }

        String selected = weightedPick(candidates);
        GameRuleConfigService.EventRuleConfig config = eventRuleMap.get(selected);
        if (config == null) {
            return;
        }
        if ("flood".equals(selected) && isFloodEventResisted(state)) {
            ObjectNode resisted = objectMapper.createObjectNode();
            resisted.put("turn", state.path("turn").asInt());
            resisted.put("eventType", "flood_resisted");
            state.withArray("eventHistory").add(resisted);
            return;
        }
        applyNegativeEventImmediateEffect(state, metrics, config);

        ObjectNode eventNode = objectMapper.createObjectNode();
        eventNode.put("turn", state.path("turn").asInt());
        eventNode.put("eventType", selected);
        eventNode.put("eventName", config.displayName());
        eventNode.put("effectSummary", config.effectSummary());
        eventNode.put("resolutionHint", config.resolutionHint());
        ArrayNode resolvableBy = objectMapper.createArrayNode();
        config.resolvablePolicyIds().forEach(resolvableBy::add);
        eventNode.set("resolvablePolicyIds", resolvableBy);
        state.withArray("eventHistory").add(eventNode);

        ObjectNode activeEvent = objectMapper.createObjectNode();
        activeEvent.put("eventType", selected);
        activeEvent.put("eventName", config.displayName());
        activeEvent.put("remainingTurns", Math.max(1, config.durationTurns()));
        activeEvent.put("greenDelta", config.greenDelta());
        activeEvent.put("carbonDelta", config.carbonDelta());
        activeEvent.put("satisfactionDelta", config.satisfactionDelta());
        activeEvent.put("greenPctDelta", config.greenPctDelta());
        activeEvent.put("populationPctDelta", config.populationPctDelta());
        ArrayNode activeResolvableBy = objectMapper.createArrayNode();
        config.resolvablePolicyIds().forEach(activeResolvableBy::add);
        activeEvent.set("resolvablePolicyIds", activeResolvableBy);
        state.withArray("activeNegativeEvents").add(activeEvent);

        ObjectNode stats = state.with("eventStats");
        stats.put("negativeTriggered", stats.path("negativeTriggered").asInt(0) + 1);
    }

    private String weightedPick(ArrayNode candidates) {
        Map<String, GameRuleConfigService.EventRuleConfig> eventRuleMap = gameRuleConfigService.eventRuleMap();
        int total = 0;
        int[] weights = new int[candidates.size()];
        for (int i = 0; i < candidates.size(); i++) {
            String eventType = candidates.get(i).asText();
            GameRuleConfigService.EventRuleConfig config = eventRuleMap.get(eventType);
            int weight = config == null ? 1 : Math.max(1, config.weight());
            weights[i] = weight;
            total += weight;
        }
        int roll = ThreadLocalRandom.current().nextInt(total);
        int cursor = 0;
        for (int i = 0; i < candidates.size(); i++) {
            cursor += weights[i];
            if (roll < cursor) {
                return candidates.get(i).asText();
            }
        }
        return candidates.get(0).asText();
    }

    private boolean isEventRuleMatched(
        ObjectNode state,
        ObjectNode metrics,
        int turn,
        GameRuleConfigService.EventRuleConfig rule
    ) {
        if (rule.requireEvenTurn() && turn % 2 != 0) {
            return false;
        }
        if (rule.minGreen() != null && metrics.path("green").asInt() > rule.minGreen()) {
            return false;
        }
        if (rule.minCarbon() != null && metrics.path("carbon").asInt() < rule.minCarbon()) {
            return false;
        }
        if (rule.maxSatisfaction() != null && metrics.path("satisfaction").asInt() > rule.maxSatisfaction()) {
            return false;
        }
        if (rule.minPopulation() != null && state.with("resources").path("population").asInt() < rule.minPopulation()) {
            return false;
        }
        return true;
    }

    private void applyNegativeEventImmediateEffect(
        ObjectNode state,
        ObjectNode metrics,
        GameRuleConfigService.EventRuleConfig config
    ) {
        metrics.put("green", Math.max(0, metrics.path("green").asInt() + config.greenDelta()));
        metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() + config.carbonDelta()));
        metrics.put(
            "satisfaction",
            clamp(metrics.path("satisfaction").asInt() + config.satisfactionDelta(), 0, balanceRule().satisfactionMax())
        );
        if (config.quotaDelta() != 0) {
            ObjectNode trade = state.with("carbonTrade");
            trade.put("quota", clamp(trade.path("quota").asInt(0) + config.quotaDelta(), 0, maxCarbonQuota()));
        }
    }

    private boolean isFloodEventResisted(ObjectNode state) {
        int resistancePct = resolveFloodResistancePct(state);
        if (resistancePct <= 0) {
            return false;
        }
        int clamped = clamp(resistancePct, 0, 95);
        return ThreadLocalRandom.current().nextInt(100) < clamped;
    }

    private String updatePhaseByProgress(ObjectNode state, int placedCount, int lowCarbonScore) {
        GameRuleConfigService.BalanceRuleConfig balance = balanceRule();
        String previousPhase = state.path("phase").asText("early");
        int remainingCoreCards = countRemainingCoreCards(state);
        boolean shouldEnterLate = (placedCount >= balance.phaseLateMinCards() && lowCarbonScore >= balance.phaseLateMinScore())
            || remainingCoreCards <= balance.phaseLateRemainingCardsThreshold();
        boolean shouldStayEarly = placedCount <= balance.phaseEarlyMaxCards() && lowCarbonScore <= balance.phaseEarlyMaxScore();
        boolean shouldEnterMid = placedCount >= balance.phaseMidMinCards()
            && placedCount <= balance.phaseMidMaxCards()
            && lowCarbonScore >= balance.phaseMidMinScore()
            && lowCarbonScore <= balance.phaseMidMaxScore();

        String phase;
        if (shouldEnterLate) {
            phase = "late";
        } else if (shouldStayEarly) {
            phase = "early";
        } else if (shouldEnterMid) {
            phase = "mid";
        } else {
            if (placedCount <= balance.phaseEarlyMaxCards()) {
                phase = "early";
            } else if (placedCount >= balance.phaseLateMinCards()) {
                phase = "late";
            } else {
                phase = "mid";
            }
        }
        applyPhaseTransition(state.with("remainingPools"), previousPhase, phase);
        state.put("phase", phase);
        return phase;
    }

    private void applyPhaseTransition(ObjectNode pools, String previousPhase, String currentPhase) {
        if (previousPhase.equals(currentPhase)) {
            return;
        }

        if ("mid".equals(currentPhase)) {
            mergePoolInto(pools.withArray("early"), pools.withArray("mid"));
            return;
        }

        if ("late".equals(currentPhase)) {
            if (!"late".equals(previousPhase)) {
                mergePoolInto(pools.withArray("early"), pools.withArray("late"));
                mergePoolInto(pools.withArray("mid"), pools.withArray("late"));
            }
        }
    }

    private void mergePoolInto(ArrayNode from, ArrayNode to) {
        while (!from.isEmpty()) {
            to.add(from.remove(0));
        }
    }

    private void drawCoreCards(ObjectNode state, String phase, int count) {
        if (count <= 0) {
            return;
        }

        ArrayNode hand = state.withArray("handCore");
        ObjectNode pools = state.with("remainingPools");
        int remainingInPools = countRemainingCardsInPools(pools, phase);
        int drawLimit = Math.min(count, remainingInPools);
        Map<String, Double> domainFactors = resolveCoreDomainDrawFactors(state);
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");

        if (drawLimit <= 0) {
            return;
        }

        for (int i = 0; i < drawLimit; i++) {
            String cardId = drawOneCoreCardFromPools(pools, phase, domainFactors, resources, metrics);
            if (cardId == null) {
                break;
            }
            hand.add(cardId);
        }

        enforceCoreHandLimit(state);
    }

    private String drawOneCoreCardFromPools(
        ObjectNode pools,
        String phase,
        Map<String, Double> domainFactors,
        ObjectNode resources,
        ObjectNode metrics
    ) {
        ArrayNode primaryPool = pools.withArray(phase);
        if (!primaryPool.isEmpty()) {
            return removeWeightedCard(primaryPool, domainFactors, resources, metrics);
        }

        if ("early".equals(phase)) {
            ArrayNode midPool = pools.withArray("mid");
            if (!midPool.isEmpty()) {
                return removeWeightedCard(midPool, domainFactors, resources, metrics);
            }
            ArrayNode latePool = pools.withArray("late");
            if (!latePool.isEmpty()) {
                return removeWeightedCard(latePool, domainFactors, resources, metrics);
            }
            return null;
        }

        if ("mid".equals(phase)) {
            ArrayNode latePool = pools.withArray("late");
            if (!latePool.isEmpty()) {
                return removeWeightedCard(latePool, domainFactors, resources, metrics);
            }
            return null;
        }

        return null;
    }

    private String removeWeightedCard(ArrayNode pool, Map<String, Double> domainFactors, ObjectNode resources, ObjectNode metrics) {
        int index = pickWeightedIndex(pool, domainFactors, resources, metrics);
        String cardId = pool.get(index).asText();
        pool.remove(index);
        return cardId;
    }

    private int pickWeightedIndex(ArrayNode pool, Map<String, Double> domainFactors, ObjectNode resources, ObjectNode metrics) {
        if (pool.size() == 1) {
            return 0;
        }

        double[] weights = new double[pool.size()];
        double totalWeight = 0D;
        for (int i = 0; i < pool.size(); i++) {
            String cardId = pool.get(i).asText();
            String domain = cardCatalogService.getRequiredCard(cardId).getDomain();
            double factor = domainFactors.getOrDefault(domain, 1.0D);
            double affordabilityFactor = isCoreAffordableForDraw(cardId, resources, metrics) ? 2.8D : 0.35D;
            double weight = Math.max(0.01D, factor * affordabilityFactor);
            weights[i] = weight;
            totalWeight += weight;
        }

        double roll = ThreadLocalRandom.current().nextDouble(totalWeight);
        double cursor = 0D;
        for (int i = 0; i < weights.length; i++) {
            cursor += weights[i];
            if (roll <= cursor) {
                return i;
            }
        }
        return weights.length - 1;
    }

    private boolean isCoreAffordableForDraw(String cardId, ObjectNode resources, ObjectNode metrics) {
        GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
        GameCardMetaDTO.UnlockCost unlockCost = card.getUnlockCost();
        int industry = resources.path("industry").asInt();
        int tech = resources.path("tech").asInt();
        int population = resources.path("population").asInt();
        int green = metrics.path("green").asInt();

        int needIndustry = unlockCost == null || unlockCost.getIndustry() == null ? 0 : unlockCost.getIndustry();
        int needTech = unlockCost == null || unlockCost.getTech() == null ? 0 : unlockCost.getTech();
        int needPopulation = unlockCost == null || unlockCost.getPopulation() == null ? 0 : unlockCost.getPopulation();
        int needGreen = unlockCost == null || unlockCost.getGreen() == null ? 0 : unlockCost.getGreen();

        return industry >= needIndustry
            && tech >= needTech
            && population >= needPopulation
            && green >= needGreen;
    }

    private Map<String, Double> resolveCoreDomainDrawFactors(ObjectNode state) {
        DomainCounts counts = countPlacedDomains(state);
        Map<String, Double> factors = new HashMap<>();
        factors.put("industry", 1.0D);
        factors.put("ecology", 1.0D);
        factors.put("science", 1.0D);
        factors.put("society", 1.0D);

        if (counts.total <= 0) {
            return factors;
        }

        applyDomainFactor(factors, "industry", counts.industry, counts.total);
        applyDomainFactor(factors, "ecology", counts.ecology, counts.total);
        applyDomainFactor(factors, "science", counts.science, counts.total);
        applyDomainFactor(factors, "society", counts.society, counts.total);
        return factors;
    }

    private void applyDomainFactor(Map<String, Double> factors, String domain, int count, int total) {
        double ratio = (double) count / (double) total;
        if (ratio >= 0.40D) {
            factors.put(domain, 0.9D);
        } else if (ratio <= 0.10D) {
            factors.put(domain, 1.1D);
        }
    }

    private int countRemainingCardsInPools(ObjectNode pools, String phase) {
        if ("early".equals(phase)) {
            return pools.withArray("early").size() + pools.withArray("mid").size() + pools.withArray("late").size();
        }
        if ("mid".equals(phase)) {
            return pools.withArray("mid").size() + pools.withArray("late").size();
        }
        return pools.withArray("late").size();
    }

    private int countRemainingCoreCards(ObjectNode state) {
        ObjectNode pools = state.with("remainingPools");
        return state.withArray("handCore").size()
            + pools.withArray("early").size()
            + pools.withArray("mid").size()
            + pools.withArray("late").size();
    }

    private void enforceCoreHandLimit(ObjectNode state) {
        ArrayNode hand = state.withArray("handCore");
        if (hand.size() > coreHandLimit()) {
            armPendingDiscard(state);
        }
    }

    private void enforcePolicyHandLimit(ObjectNode state) {
        ArrayNode hand = state.withArray("handPolicy");
        if (hand.size() > policyHandLimit()) {
            armPendingDiscard(state);
        }
    }

    private void armPendingDiscard(ObjectNode state) {
        ObjectNode pending = state.with("pendingDiscard");
        pending.put("active", true);
        pending.put("expiresAt", 0L);
        pending.put("coreRequired", Math.max(0, state.withArray("handCore").size() - coreHandLimit()));
        pending.put("policyRequired", Math.max(0, state.withArray("handPolicy").size() - policyHandLimit()));
    }

    private void refreshPendingDiscardState(ObjectNode state) {
        ObjectNode pending = state.with("pendingDiscard");
        int coreRequired = Math.max(0, state.withArray("handCore").size() - coreHandLimit());
        int policyRequired = Math.max(0, state.withArray("handPolicy").size() - policyHandLimit());
        pending.put("coreRequired", coreRequired);
        pending.put("policyRequired", policyRequired);
        if (coreRequired == 0 && policyRequired == 0) {
            pending.put("active", false);
            pending.put("expiresAt", 0L);
        }
    }

    private void processPendingDiscardTimeout(ObjectNode state) {
        ObjectNode pending = state.with("pendingDiscard");
        if (!pending.path("active").asBoolean(false)) {
            return;
        }
        long expiresAt = pending.path("expiresAt").asLong(0L);
        if (expiresAt <= 0L) {
            return;
        }
        if (System.currentTimeMillis() < expiresAt) {
            return;
        }
        while (state.withArray("handCore").size() > coreHandLimit()) {
            String cardId = state.withArray("handCore").remove(0).asText();
            state.withArray("discardCore").add(cardId);
            recordAutoDiscard(state, "core", cardId);
        }
        while (state.withArray("handPolicy").size() > policyHandLimit()) {
            String cardId = state.withArray("handPolicy").remove(0).asText();
            state.withArray("discardPolicy").add(cardId);
            recordAutoDiscard(state, "policy", cardId);
        }
        refreshPendingDiscardState(state);
    }

    private void discardFromHand(
        ArrayNode hand,
        ArrayNode discard,
        ObjectNode state,
        String handType,
        String cardId,
        String reason
    ) {
        int idx = indexOf(hand, cardId);
        if (idx < 0) {
            throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Card is not in hand");
        }
        hand.remove(idx);
        discard.add(cardId);
        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.put("handType", handType);
        history.put("cardId", cardId);
        history.put("reason", reason);
        state.withArray("handOverflowHistory").add(history);
    }

    private void recordAutoDiscard(ObjectNode state, String handType, String cardId) {
        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.put("handType", handType);
        history.put("cardId", cardId);
        history.put("reason", "timeout_auto_discard");
        state.withArray("handOverflowHistory").add(history);
    }

    private ArrayNode toShuffledArray(List<String> cards) {
        ArrayNode array = objectMapper.createArrayNode();
        cards.forEach(array::add);
        for (int i = array.size() - 1; i > 0; i--) {
            int swapIndex = ThreadLocalRandom.current().nextInt(i + 1);
            JsonNode tmp = array.get(i);
            array.set(i, array.get(swapIndex));
            array.set(swapIndex, tmp);
        }
        return array;
    }

    private ObjectNode ensureStateObject(JsonNode state) {
        if (state instanceof ObjectNode objectNode) {
            return objectNode;
        }
        throw new BizException(ErrorCode.SYSTEM_ERROR, "Invalid session state");
    }

    private String readRequiredText(JsonNode actionData, String fieldName) {
        if (actionData == null || actionData.path(fieldName).asText().isBlank()) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, fieldName + " is required");
        }
        return actionData.path(fieldName).asText();
    }

    private int readRequiredInt(JsonNode actionData, String fieldName) {
        if (actionData == null || !actionData.hasNonNull(fieldName) || !actionData.path(fieldName).canConvertToInt()) {
            throw new BizException(ErrorCode.INVALID_PARAMETER, fieldName + " must be an integer");
        }
        return actionData.path(fieldName).asInt();
    }

    private int indexOf(ArrayNode arrayNode, String value) {
        for (int i = 0; i < arrayNode.size(); i++) {
            if (value.equals(arrayNode.get(i).asText())) {
                return i;
            }
        }
        return -1;
    }

    private ObjectNode captureValueNode(ObjectNode source, String... fields) {
        ObjectNode captured = objectMapper.createObjectNode();
        for (String field : fields) {
            captured.put(field, source.path(field).asInt(0));
        }
        return captured;
    }

    private void appendSettlementHistory(
        ObjectNode state,
        ObjectNode settlementBonus,
        ObjectNode resourcesBefore,
        ObjectNode metricsBefore,
        ObjectNode tradeBefore
    ) {
        ObjectNode resourcesAfter = state.with("resources");
        ObjectNode metricsAfter = state.with("metrics");
        ObjectNode tradeAfter = state.with("carbonTrade");

        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.set("cardEffects", settlementBonus.deepCopy());
        history.set("resources", buildDeltaNode(resourcesBefore, resourcesAfter, "industry", "tech", "population"));
        history.set("metrics", buildDeltaNode(metricsBefore, metricsAfter, "green", "carbon", "satisfaction", "lowCarbonScore"));
        history.set("trade", buildDeltaNode(tradeBefore, tradeAfter, "quota", "pricePctModifier"));
        state.withArray("settlementHistory").add(history);
    }

    private ObjectNode buildDeltaNode(ObjectNode before, ObjectNode after, String... fields) {
        ObjectNode deltaNode = objectMapper.createObjectNode();
        for (String field : fields) {
            int beforeValue = before.path(field).asInt(0);
            int afterValue = after.path(field).asInt(0);
            ObjectNode item = objectMapper.createObjectNode();
            item.put("before", beforeValue);
            item.put("delta", afterValue - beforeValue);
            item.put("after", afterValue);
            deltaNode.set(field, item);
        }
        return deltaNode;
    }

    private void putAllBonusFields(ObjectNode bonus, int init) {
        bonus.put("industry", init);
        bonus.put("tech", init);
        bonus.put("population", init);
        bonus.put("industryPct", init);
        bonus.put("techPct", init);
        bonus.put("populationPct", init);
        bonus.put("green", init);
        bonus.put("greenPct", init);
        bonus.put("carbon", init);
        bonus.put("carbonDeltaReductionPct", init);
        bonus.put("industryCarbonReductionPct", init);
        bonus.put("satisfaction", init);
        bonus.put("quota", init);
        bonus.put("tradePricePct", init);
        bonus.put("comboPct", init);
        bonus.put("newEnergyIndustryPct", init);
        bonus.put("lowCarbon", init);
        bonus.put("lowCarbonPct", init);
        bonus.put("globalPct", init);
    }

    private void addBonus(ObjectNode bonus, String field, int delta) {
        bonus.put(field, bonus.path(field).asInt() + delta);
    }

    private void addPercentBonus(ObjectNode bonus, String field, int delta) {
        bonus.put(field, bonus.path(field).asInt() + delta);
    }

    private void applyComboEffect(ObjectNode settlementBonus, GameRuleConfigService.ComboEffectConfig effect) {
        int comboPct = settlementBonus.path("comboPct").asInt(0);
        addBonus(settlementBonus, "industry", applyPercentage(effect.industryDelta(), comboPct));
        addBonus(settlementBonus, "tech", applyPercentage(effect.techDelta(), comboPct));
        addBonus(settlementBonus, "population", applyPercentage(effect.populationDelta(), comboPct));
        addBonus(settlementBonus, "green", applyPercentage(effect.greenDelta(), comboPct));
        addBonus(settlementBonus, "carbon", applyPercentage(effect.carbonDelta(), comboPct));
        addBonus(settlementBonus, "satisfaction", applyPercentage(effect.satisfactionDelta(), comboPct));
        addBonus(settlementBonus, "quota", applyPercentage(effect.quotaDelta(), comboPct));
        addBonus(settlementBonus, "lowCarbon", applyPercentage(effect.lowCarbonDelta(), comboPct));
        addPercentBonus(settlementBonus, "techPct", applyPercentage(effect.techPct(), comboPct));
        addPercentBonus(settlementBonus, "populationPct", applyPercentage(effect.populationPct(), comboPct));
        addPercentBonus(settlementBonus, "industryPct", applyPercentage(effect.industryPct(), comboPct));
        addPercentBonus(settlementBonus, "lowCarbonPct", applyPercentage(effect.lowCarbonPct(), comboPct));
        addPercentBonus(settlementBonus, "greenPct", applyPercentage(effect.greenPct(), comboPct));
        addPercentBonus(settlementBonus, "globalPct", applyPercentage(effect.globalPct(), comboPct));
    }

    private void applyCoreContinuousEffects(ObjectNode state, DomainCounts counts, ObjectNode settlementBonus) {
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            CoreContinuousEffect effect = resolveCoreContinuousEffect(cardId, card);
            if (effect == null || !isCoreEffectConditionMatched(cardId, card, state, counts, resources, metrics)) {
                continue;
            }
            addBonus(settlementBonus, "industry", effect.industryDelta());
            addBonus(settlementBonus, "tech", effect.techDelta());
            addBonus(settlementBonus, "population", effect.populationDelta());
            addBonus(settlementBonus, "green", effect.greenDelta());
            addBonus(settlementBonus, "carbon", effect.carbonDelta());
            addBonus(settlementBonus, "satisfaction", effect.satisfactionDelta());
            addBonus(settlementBonus, "quota", effect.quotaDelta());
            addBonus(settlementBonus, "lowCarbon", effect.lowCarbonDelta());
            addPercentBonus(settlementBonus, "industryPct", effect.industryPct());
            addPercentBonus(settlementBonus, "techPct", effect.techPct());
            addPercentBonus(settlementBonus, "populationPct", effect.populationPct());
            addPercentBonus(settlementBonus, "greenPct", effect.greenPct());
            addPercentBonus(settlementBonus, "globalPct", effect.globalPct());
            addPercentBonus(settlementBonus, "lowCarbonPct", effect.lowCarbonPct());
            addPercentBonus(settlementBonus, "industryCarbonReductionPct", effect.industryCarbonReductionPct());
            addPercentBonus(settlementBonus, "carbonDeltaReductionPct", effect.carbonDeltaReductionPct());
            addPercentBonus(settlementBonus, "tradePricePct", effect.tradePricePct());
            addPercentBonus(settlementBonus, "comboPct", effect.comboPct());
            addPercentBonus(settlementBonus, "techPct", effect.sciencePct());
            addPercentBonus(settlementBonus, "comboPct", effect.sharedMobilityPct());
            addBonus(settlementBonus, "carbon", effect.crossDomainCarbonDelta());
            addPercentBonus(settlementBonus, "comboPct", effect.crossDomainComboPct());
            addBonus(settlementBonus, "carbon", effect.industryCarbonOffset());
        }
    }

    private void applyCoreSpecialEffects(ObjectNode state, DomainCounts counts, ObjectNode settlementBonus) {
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            CoreSpecialEffect effect = resolveCoreSpecialEffect(cardId, card);
            if (effect == null || !isCoreSpecialEffectMatched(cardId, card, state, counts, resources, metrics)) {
                continue;
            }
            addPercentBonus(settlementBonus, "newEnergyIndustryPct", effect.newEnergyIndustryPct());
            if (effect.ecologyCarbonSinkPerTenGreen() > 0) {
                int dynamicCarbonReduction = (metrics.path("green").asInt(0) / 10) * effect.ecologyCarbonSinkPerTenGreen();
                if (effect.ecologyCarbonSinkPct() > 0) {
                    dynamicCarbonReduction = applyPercentage(dynamicCarbonReduction, effect.ecologyCarbonSinkPct());
                }
                addBonus(settlementBonus, "carbon", -dynamicCarbonReduction);
            }
        }
    }

    private int resolveCorePlacementCostReductionPct(ObjectNode state, String targetDomain) {
        if (!"ecology".equals(targetDomain) && !"science".equals(targetDomain)) {
            return 0;
        }
        DomainCounts counts = countPlacedDomains(state);
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        int reductionPct = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            CoreSpecialEffect effect = resolveCoreSpecialEffect(cardId, card);
            if (effect == null || !isCoreSpecialEffectMatched(cardId, card, state, counts, resources, metrics)) {
                continue;
            }
            if ("ecology".equals(targetDomain)) {
                reductionPct += effect.ecologyCardCostReductionPct();
            } else {
                reductionPct += effect.scienceCardCostReductionPct();
            }
        }
        return clamp(reductionPct, 0, 90);
    }

    private int resolveFloodResistancePct(ObjectNode state) {
        DomainCounts counts = countPlacedDomains(state);
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        int resistancePct = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            CoreSpecialEffect effect = resolveCoreSpecialEffect(cardId, card);
            if (effect == null || !isCoreSpecialEffectMatched(cardId, card, state, counts, resources, metrics)) {
                continue;
            }
            resistancePct += effect.floodResistancePct();
        }
        return resistancePct;
    }

    private boolean isCoreSpecialEffectMatched(
        String cardId,
        GameCardMetaDTO card,
        ObjectNode state,
        DomainCounts counts,
        ObjectNode resources,
        ObjectNode metrics
    ) {
        return isCoreEffectConditionMatched(cardId, card, state, counts, resources, metrics);
    }

    private boolean isCoreEffectConditionMatched(
        String cardId,
        GameCardMetaDTO card,
        ObjectNode state,
        DomainCounts counts,
        ObjectNode resources,
        ObjectNode metrics
    ) {
        CoreEffectCondition condition = resolveCoreEffectCondition(cardId, card);
        if (condition == null) {
            return true;
        }
        if (state.path("turn").asInt() < condition.minTurn()) {
            return false;
        }
        if (resources.path("industry").asInt() < condition.minIndustryResource()) {
            return false;
        }
        if (resources.path("tech").asInt() < condition.minTechResource()) {
            return false;
        }
        if (metrics.path("carbon").asInt() < condition.minCarbon()) {
            return false;
        }
        if (metrics.path("carbon").asInt() > condition.maxCarbon()) {
            return false;
        }
        if (counts.industry < condition.minIndustryCards()) {
            return false;
        }
        if (counts.ecology < condition.minEcologyCards()) {
            return false;
        }
        if (counts.science < condition.minScienceCards()) {
            return false;
        }
        if (counts.society < condition.minSocietyCards()) {
            return false;
        }
        if (state.with("domainProgress").path("industry").asInt(0) < condition.minIndustryProgressPct()) {
            return false;
        }
        if (metrics.path("green").asInt() < condition.minGreen()) {
            return false;
        }
        if (resources.path("population").asInt() < condition.minPopulation()) {
            return false;
        }
        if (metrics.path("satisfaction").asInt() < condition.minSatisfaction()) {
            return false;
        }
        if (state.with("domainProgress").path("society").asInt(0) < condition.minSocietyProgressPct()) {
            return false;
        }
        if (condition.minTaggedCards() <= 0) {
            return true;
        }
        return countPlacedByConditionTag(state, condition.requiredTag()) >= condition.minTaggedCards();
    }

    private int countPlacedByConditionTag(ObjectNode state, String requiredTag) {
        if (requiredTag == null || requiredTag.isBlank()) {
            return 0;
        }
        return countPlacedByTag(state, requiredTag);
    }

    private void refreshDomainProgress(ObjectNode state, DomainCounts counts) {
        ObjectNode progress = state.with("domainProgress");
        progress.put("industry", calculateDomainProgressWithBonus(state, "industry", counts.industry));
        progress.put("ecology", calculateDomainProgressWithBonus(state, "ecology", counts.ecology));
        progress.put("science", calculateDomainProgressWithBonus(state, "science", counts.science));
        progress.put("society", calculateDomainProgressWithBonus(state, "society", counts.society));
    }

    private int calculateDomainProgressWithBonus(ObjectNode state, String domain, int domainCount) {
        int baseProgress = (int) Math.floor(domainCount * 100.0D / domainProgressCardCap());
        int bonusProgress = 0;
        for (JsonNode node : state.withArray("placedCore")) {
            String cardId = node.asText();
            GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
            int bonus = resolveCoreDomainProgressBonus(cardId, card);
            if (bonus <= 0) {
                continue;
            }
            if (domain.equals(card.getDomain())) {
                bonusProgress += bonus;
            }
        }
        return clamp(baseProgress + bonusProgress, 0, 200);
    }

    private int resolveCoreDomainProgressBonus(String cardId, GameCardMetaDTO card) {
        return defaultInt(card.getCoreDomainProgressBonus());
    }

    private CoreContinuousEffect resolveCoreContinuousEffect(String cardId, GameCardMetaDTO card) {
        return new CoreContinuousEffect(
            defaultInt(card.getCoreContinuousIndustryDelta()),
            defaultInt(card.getCoreContinuousTechDelta()),
            defaultInt(card.getCoreContinuousPopulationDelta()),
            defaultInt(card.getCoreContinuousGreenDelta()),
            defaultInt(card.getCoreContinuousCarbonDelta()),
            defaultInt(card.getCoreContinuousSatisfactionDelta()),
            defaultInt(card.getCoreContinuousQuotaDelta()),
            defaultInt(card.getCoreContinuousLowCarbonDelta()),
            defaultInt(card.getCoreContinuousIndustryPct()),
            defaultInt(card.getCoreContinuousTechPct()),
            defaultInt(card.getCoreContinuousPopulationPct()),
            defaultInt(card.getCoreContinuousGreenPct()),
            defaultInt(card.getCoreContinuousGlobalPct()),
            defaultInt(card.getCoreContinuousLowCarbonPct()),
            defaultInt(card.getCoreContinuousIndustryCarbonReductionPct()),
            defaultInt(card.getCoreContinuousCarbonDeltaReductionPct()),
            defaultInt(card.getCoreContinuousTradePricePct()),
            defaultInt(card.getCoreContinuousComboPct()),
            defaultInt(card.getCoreContinuousSciencePct()),
            defaultInt(card.getCoreContinuousSharedMobilityPct()),
            defaultInt(card.getCoreContinuousCrossDomainCarbonDelta()),
            defaultInt(card.getCoreContinuousCrossDomainComboPct()),
            defaultInt(card.getCoreContinuousIndustryCarbonOffset())
        );
    }

    private CoreImmediateEffect resolveCoreImmediateEffect(String cardId, GameCardMetaDTO card) {
        return new CoreImmediateEffect(
            defaultInt(card.getCoreImmediateIndustryDelta()),
            defaultInt(card.getCoreImmediateTechDelta()),
            defaultInt(card.getCoreImmediatePopulationDelta()),
            defaultInt(card.getCoreImmediateGreenDelta()),
            defaultInt(card.getCoreImmediateCarbonDelta()),
            defaultInt(card.getCoreImmediateSatisfactionDelta()),
            defaultInt(card.getCoreImmediateQuotaDelta()),
            defaultInt(card.getCoreImmediateComboPct()),
            defaultInt(card.getCoreImmediateIndustryCarbonDelta()),
            defaultInt(card.getCoreImmediateIndustryCarbonReductionPct())
        );
    }

    private CoreEffectCondition resolveCoreEffectCondition(String cardId, GameCardMetaDTO card) {
        return new CoreEffectCondition(
            defaultInt(card.getCoreConditionMinTurn()),
            defaultInt(card.getCoreConditionMinIndustryResource()),
            defaultInt(card.getCoreConditionMinTechResource()),
            defaultInt(card.getCoreConditionMinCarbon()),
            card.getCoreConditionMaxCarbon() == null ? Integer.MAX_VALUE : card.getCoreConditionMaxCarbon(),
            defaultInt(card.getCoreConditionMinIndustryCards()),
            defaultInt(card.getCoreConditionMinEcologyCards()),
            defaultInt(card.getCoreConditionMinScienceCards()),
            defaultInt(card.getCoreConditionMinSocietyCards()),
            defaultInt(card.getCoreConditionMinIndustryProgressPct()),
            defaultInt(card.getCoreConditionMinGreen()),
            defaultInt(card.getCoreConditionMinPopulation()),
            defaultInt(card.getCoreConditionMinSatisfaction()),
            defaultInt(card.getCoreConditionMinSocietyProgressPct()),
            defaultInt(card.getCoreConditionMinTaggedCards()),
            card.getCoreConditionRequiredTag() == null ? "" : card.getCoreConditionRequiredTag()
        );
    }

    private CoreSpecialEffect resolveCoreSpecialEffect(String cardId, GameCardMetaDTO card) {
        return new CoreSpecialEffect(
            defaultInt(card.getCoreSpecialEcologyCardCostReductionPct()),
            defaultInt(card.getCoreSpecialScienceCardCostReductionPct()),
            defaultInt(card.getCoreSpecialFloodResistancePct()),
            defaultInt(card.getCoreSpecialNewEnergyIndustryPct()),
            defaultInt(card.getCoreSpecialEcologyCarbonSinkPerTenGreen()),
            defaultInt(card.getCoreSpecialEcologyCarbonSinkBaseGreen()),
            defaultInt(card.getCoreSpecialEcologyCarbonSinkPct()),
            defaultInt(card.getCoreSpecialUpgradeCostReductionPct())
        );
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private boolean matchesComboTriggerRule(
        GameRuleConfigService.ComboRuleConfig rule,
        String lastPolicyUsed,
        DomainCounts counts,
        int lowCarbonIndustryCount,
        int shenzhenEcologyCount,
        int linkCardCount,
        AdjacencyStats adjacency
    ) {
        if (!rule.requiredPolicyId().isBlank() && !rule.requiredPolicyId().equals(lastPolicyUsed)) {
            return false;
        }
        return counts.industry >= rule.minIndustry()
            && counts.ecology >= rule.minEcology()
            && counts.science >= rule.minScience()
            && counts.society >= rule.minSociety()
            && lowCarbonIndustryCount >= rule.minLowCarbonIndustry()
            && shenzhenEcologyCount >= rule.minShenzhenEcology()
            && linkCardCount >= rule.minLinkCards()
            && adjacency.industryLowCarbonAdjacentPairs >= rule.minIndustryLowCarbonAdjacentPairs()
            && adjacency.scienceScienceAdjacentPairs >= rule.minScienceScienceAdjacentPairs()
            && adjacency.scienceIndustryAdjacentPairs >= rule.minScienceIndustryAdjacentPairs()
            && adjacency.industryEcologyAdjacentPairs >= rule.minIndustryEcologyAdjacentPairs()
            && adjacency.societyEcologyAdjacentPairs >= rule.minSocietyEcologyAdjacentPairs();
    }

    private int applyPercentage(int baseValue, int percent) {
        if (percent == 0) {
            return baseValue;
        }
        return (int) Math.round(baseValue * (1.0D + percent / 100.0D));
    }

    private int calculateLevel(long score) {
        return (int) (score / 100) + 1;
    }

    private record PolicyImmediateEffect(
        int industryDelta,
        int techDelta,
        int populationDelta,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int quotaDelta,
        String group,
        int turns
    ) {
    }

    private record PolicyContinuousEffect(
        int industryDelta,
        int techDelta,
        int populationDelta,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int lowCarbonDelta,
        int greenPct,
        int techPct,
        int populationPct,
        int industryPct,
        int industryCarbonReductionPct
    ) {
    }

    private record CoreContinuousEffect(
        int industryDelta,
        int techDelta,
        int populationDelta,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int quotaDelta,
        int lowCarbonDelta,
        int industryPct,
        int techPct,
        int populationPct,
        int greenPct,
        int globalPct,
        int lowCarbonPct,
        int industryCarbonReductionPct,
        int carbonDeltaReductionPct,
        int tradePricePct,
        int comboPct,
        int sciencePct,
        int sharedMobilityPct,
        int crossDomainCarbonDelta,
        int crossDomainComboPct,
        int industryCarbonOffset
    ) {
    }

    private record CoreImmediateEffect(
        int industryDelta,
        int techDelta,
        int populationDelta,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int quotaDelta,
        int comboPct,
        int industryCarbonDelta,
        int industryCarbonReductionPct
    ) {
    }

    private record CoreEffectCondition(
        int minTurn,
        int minIndustryResource,
        int minTechResource,
        int minCarbon,
        int maxCarbon,
        int minIndustryCards,
        int minEcologyCards,
        int minScienceCards,
        int minSocietyCards,
        int minIndustryProgressPct,
        int minGreen,
        int minPopulation,
        int minSatisfaction,
        int minSocietyProgressPct,
        int minTaggedCards,
        String requiredTag
    ) {
    }

    private record CoreSpecialEffect(
        int ecologyCardCostReductionPct,
        int scienceCardCostReductionPct,
        int floodResistancePct,
        int newEnergyIndustryPct,
        int ecologyCarbonSinkPerTenGreen,
        int ecologyCarbonSinkBaseGreen,
        int ecologyCarbonSinkPct,
        int upgradeCostReductionPct
    ) {
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0D) / 10.0D;
    }

    private int safeCost(Integer cost) {
        return cost == null ? 0 : Math.max(0, cost);
    }

    private GameRuleConfigService.RuntimeParamConfig runtimeParam() {
        return gameRuleConfigService.runtimeParam();
    }

    private GameRuleConfigService.BalanceRuleConfig balanceRule() {
        return gameRuleConfigService.balanceRule();
    }

    private int coreHandLimit() {
        return runtimeParam().coreHandLimit();
    }

    private int policyHandLimit() {
        return runtimeParam().policyHandLimit();
    }

    private int maxComboPerTurn() {
        return runtimeParam().maxComboPerTurn();
    }

    private int maxTurn() {
        return runtimeParam().maxTurn();
    }

    private int tradeWindowInterval() {
        return runtimeParam().tradeWindowInterval();
    }

    private double baseCarbonPrice() {
        return runtimeParam().baseCarbonPrice();
    }

    private int maxCarbonQuota() {
        return runtimeParam().maxCarbonQuota();
    }

    private int domainProgressCardCap() {
        return runtimeParam().domainProgressCardCap();
    }

    private int endingDisplaySeconds() {
        return runtimeParam().endingDisplaySeconds();
    }

    private boolean turnTransitionAnimationEnabledDefault() {
        return runtimeParam().turnTransitionAnimationEnabledDefault();
    }

    private int turnTransitionAnimationSeconds() {
        return runtimeParam().turnTransitionAnimationSeconds();
    }

    private boolean freePlacementEnabled() {
        return runtimeParam().freePlacementEnabled();
    }

    private boolean freePlacementEnabled(ObjectNode state) {
        JsonNode stateValue = state.path("runtimeConfig").path("freePlacementEnabled");
        if (!stateValue.isMissingNode() && !stateValue.isNull()) {
            return stateValue.asBoolean();
        }
        return freePlacementEnabled();
    }

    private void syncRuntimeConfigForSession(ObjectNode state) {
        ObjectNode runtimeConfig = state.with("runtimeConfig");
        runtimeConfig.put("tradeWindowInterval", tradeWindowInterval());
        runtimeConfig.put("maxCarbonQuota", maxCarbonQuota());
        runtimeConfig.put("freePlacementEnabled", freePlacementEnabled());
    }

    private UUID resolveCurrentUserId() {
        return SecurityUtil.getCurrentUserId();
    }

    private UUID resolveCurrentUserIdOptional() {
        return SecurityUtil.getCurrentUserIdOptional();
    }

    private GameSessionEntity createSession(UUID userId, boolean guestSession) {
        ObjectNode initialState = buildInitialState(guestSession);
        long initialScore = initialState.path("metrics").path("lowCarbonScore").asLong(0);
        OffsetDateTime now = OffsetDateTime.now();

        GameSessionEntity session = new GameSessionEntity();
        session.setId(UUID.randomUUID());
        session.setUserId(userId);
        session.setPondState(initialState);
        session.setScore(initialScore);
        session.setLevel(calculateLevel(initialScore));
        session.setStartedAt(now);
        session.setLastActionAt(now);
        session.setStatus(SESSION_ACTIVE);
        session.setCreatedAt(now);
        session.setUpdatedAt(now);
        return session;
    }

    private GameSessionEntity resolveGuestSession(UUID sessionId) {
        GameSessionEntity session = guestSessions.get(sessionId);
        if (session != null) {
            return session;
        }
        session = gameSessionMapper.selectById(sessionId);
        if (!isGuestSession(session)) {
            return null;
        }
        guestSessions.put(sessionId, session);
        return session;
    }

    private boolean isGuestSession(GameSessionEntity session) {
        if (session == null) {
            return false;
        }
        if (session.getUserId() == null) {
            return true;
        }
        JsonNode pondState = session.getPondState();
        return pondState != null && pondState.path("guestSession").asBoolean(false);
    }

    private GameSessionDTO toDTO(GameSessionEntity entity) {
        return GameSessionDTO.builder()
            .id(entity.getId())
            .userId(entity.getUserId())
            .pondState(sanitizeStateForClient(entity.getPondState()))
            .score(entity.getScore())
            .level(entity.getLevel())
            .startedAt(entity.getStartedAt())
            .lastActionAt(entity.getLastActionAt())
            .status(entity.getStatus())
            .build();
    }

    private GameActionLogDTO toActionLogDTO(GameActionEntity entity) {
        return GameActionLogDTO.builder()
            .id(entity.getId())
            .sessionId(entity.getSessionId())
            .userId(entity.getUserId())
            .actionType(entity.getActionType())
            .actionData(entity.getActionData())
            .pointsEarned(entity.getPointsEarned())
            .createdAt(entity.getCreatedAt())
            .build();
    }

    private ObjectNode sanitizeStateForClient(JsonNode source) {
        if (!(source instanceof ObjectNode objectNode)) {
            throw new BizException(ErrorCode.SYSTEM_ERROR, "Invalid session state");
        }
        return objectNode.deepCopy();
    }

    private record LowCarbonScoreBreakdown(
        int baseCards,
        int latePhaseBonus,
        int domainBonus,
        int policyUnlockScore,
        int policyUnlockAllBonus,
        int eventResolveScore,
        int eventUnresolvedPenalty,
        int carbonTierScore,
        int overLimitPenalty,
        int tradeProfitScore,
        int quotaPenalty,
        int invalidPenalty,
        int totalBeforeBonuses
    ) {
    }

    private record SpecialPositiveEvent(
        String eventType,
        String eventName,
        int probabilityBonusPct,
        int durationTurns,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int populationDelta,
        int lowCarbonDelta,
        int industryPctDelta,
        int techPctDelta,
        int industryCarbonReductionPct,
        String effectSummary
    ) {
    }

    private record SpecialNegativeEvent(
        String eventType,
        String eventName,
        int probabilityBonusPct,
        int durationTurns,
        int greenDelta,
        int carbonDelta,
        int satisfactionDelta,
        int greenPctDelta,
        int populationPctDelta,
        int industryPctDelta,
        int techPctDelta,
        boolean blockScienceCombo,
        String effectSummary,
        List<String> resolvablePolicyIds
    ) {
    }

    private static class Coord {
        private final int row;
        private final int col;

        private Coord(int row, int col) {
            this.row = row;
            this.col = col;
        }
    }

    private void applyAdjacencySynergy(ObjectNode settlementBonus, AdjacencyStats adjacency) {
        // Industry + Ecology: Nature-based Carbon Reduction
        if (adjacency.industryEcologyAdjacentPairs > 0) {
            addBonus(settlementBonus, "carbon", -2 * adjacency.industryEcologyAdjacentPairs);
        }
        // Industry + Science: Smart Manufacturing Bonus
        if (adjacency.scienceIndustryAdjacentPairs > 0) {
            addBonus(settlementBonus, "tech", 2 * adjacency.scienceIndustryAdjacentPairs);
            addBonus(settlementBonus, "carbon", -1 * adjacency.scienceIndustryAdjacentPairs);
        }
        // Society + Ecology: Clean Living Awareness
        if (adjacency.societyEcologyAdjacentPairs > 0) {
            addBonus(settlementBonus, "satisfaction", 2 * adjacency.societyEcologyAdjacentPairs);
        }
        // Same Domain Bonus: Shared Resources
        if (adjacency.scienceScienceAdjacentPairs > 0) {
            addBonus(settlementBonus, "tech", 1 * adjacency.scienceScienceAdjacentPairs);
        }
        if (adjacency.industryLowCarbonAdjacentPairs > 0) {
            addBonus(settlementBonus, "industry", 2 * adjacency.industryLowCarbonAdjacentPairs);
        }
    }

    private int calculatePhaseMatchBonus(ObjectNode state) {
        String currentPhase = state.path("phase").asText("early");
        int bonus = 0;
        ArrayNode placed = state.withArray("placedCore");
        for (JsonNode node : placed) {
            String cardId = node.asText();
            try {
                GameCardMetaDTO card = cardCatalogService.getRequiredCard(cardId);
                if (card != null && currentPhase.equalsIgnoreCase(card.getPhaseBucket())) {
                    bonus++;
                }
            } catch (Exception e) {
                // Ignore unknown cards
            }
        }
        return bonus;
    }

    private static class AdjacencyStats {
        private int industryLowCarbonAdjacentPairs;
        private int scienceScienceAdjacentPairs;
        private int scienceIndustryAdjacentPairs;
        private int industryEcologyAdjacentPairs;
        private int societyEcologyAdjacentPairs;
    }

    private static class DomainCounts {
        private int industry;
        private int ecology;
        private int science;
        private int society;
        private int late;
        private int total;
    }
}
