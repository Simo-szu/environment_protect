package com.youthloop.game.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.youthloop.common.api.ErrorCode;
import com.youthloop.common.exception.BizException;
import com.youthloop.common.util.SecurityUtil;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
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

    private static final int SESSION_ACTIVE = 1;
    private static final int SESSION_ENDED = 3;

    private static final int CORE_HAND_LIMIT = 6;
    private static final int POLICY_HAND_LIMIT = 2;
    private static final int MAX_COMBO_PER_TURN = 2;
    private static final int MAX_TURN = 30;
    private static final int HAND_DISCARD_DECISION_SECONDS = 10;
    private static final int TRADE_WINDOW_INTERVAL = 2;
    private static final double BASE_CARBON_PRICE = 2.0D;
    private static final int MAX_CARBON_QUOTA = 200;

    private static final String ENDING_FAILURE = "failure";
    private static final String ENDING_INNOVATION = "innovation_technology";
    private static final String ENDING_ECOLOGY = "ecology_priority";
    private static final String ENDING_DOUGHNUT = "doughnut_city";

    private final GameSessionMapper gameSessionMapper;
    private final GameActionMapper gameActionMapper;
    private final CardCatalogService cardCatalogService;
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
            GameSessionEntity session = createSession(userId);
            gameSessionMapper.insert(session);
            return toDTO(session);
        }

        GameSessionEntity guestSession = createSession(null);
        guestSessions.put(guestSession.getId(), guestSession);
        return toDTO(guestSession);
    }

    public GameSessionDTO getCurrentSession() {
        UUID userId = resolveCurrentUserId();
        GameSessionEntity session = gameSessionMapper.selectActiveByUserId(userId);
        if (session == null) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
        }
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
            return toDTO(session);
        }

        GameSessionEntity guestSession = guestSessions.get(sessionId);
        if (guestSession == null) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
        }
        return toDTO(guestSession);
    }

    public List<GameCardMetaDTO> listCards(boolean includePolicy) {
        return cardCatalogService.listCards(includePolicy);
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
            session = guestSessions.get(request.getSessionId());
            if (session == null) {
                throw new BizException(ErrorCode.GAME_SESSION_INVALID);
            }
        }
        if (session.getStatus() != SESSION_ACTIVE) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_ACTIVE);
        }

        ObjectNode state = ensureStateObject(session.getPondState());
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
        } else if (request.getActionType() == ACTION_END_TURN) {
            pointsEarned = handleEndTurn(state);
            summary = "Turn ended";
        } else {
            throw new BizException(ErrorCode.INVALID_PARAMETER, "Unsupported actionType: " + request.getActionType());
        }

        long latestScore = state.path("metrics").path("lowCarbonScore").asLong(0);
        boolean sessionEnded = state.path("sessionEnded").asBoolean(false) || state.path("turn").asInt() > MAX_TURN;
        session.setPondState(state);
        session.setScore(latestScore);
        session.setLevel(calculateLevel(latestScore));
        session.setLastActionAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
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
            action.setCreatedAt(LocalDateTime.now());
            gameActionMapper.insert(action);
        } else {
            guestSessions.put(session.getId(), session);
        }

        ObjectNode ending = state.path("ending").isObject() ? (ObjectNode) state.path("ending") : null;
        return GameActionResponse.builder()
            .newPondState(state)
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
            session = guestSessions.get(sessionId);
            if (session == null) {
                throw new BizException(ErrorCode.GAME_SESSION_NOT_FOUND);
            }
        }
        if (session.getStatus() != SESSION_ACTIVE) {
            throw new BizException(ErrorCode.GAME_SESSION_NOT_ACTIVE);
        }
        session.setStatus(SESSION_ENDED);
        session.setUpdatedAt(LocalDateTime.now());
        if (authenticated) {
            gameSessionMapper.update(session);
        } else {
            guestSessions.put(session.getId(), session);
        }

        return GameActionResponse.builder()
            .newPondState(session.getPondState())
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

    private ObjectNode buildInitialState() {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("turn", 1);
        root.put("phase", "early");
        root.put("eventCooldown", 0);
        root.put("maxTurn", MAX_TURN);
        root.put("highCarbonStreak", 0);
        root.put("highCarbonOverLimitStreak", 0);
        root.put("sessionEnded", false);
        root.putNull("ending");

        ObjectNode resources = root.putObject("resources");
        resources.put("industry", 30);
        resources.put("tech", 20);
        resources.put("population", 25);

        ObjectNode metrics = root.putObject("metrics");
        metrics.put("green", 50);
        metrics.put("carbon", 80);
        metrics.put("satisfaction", 60);
        metrics.put("lowCarbonScore", 0);

        ObjectNode carbonTrade = root.putObject("carbonTrade");
        carbonTrade.put("quota", 50);
        carbonTrade.put("buyAmountTotal", 0D);
        carbonTrade.put("sellAmountTotal", 0D);
        carbonTrade.put("profit", 0D);
        carbonTrade.put("lastPrice", BASE_CARBON_PRICE);
        carbonTrade.put("lastWindowTurn", 0);
        carbonTrade.put("windowOpened", false);
        carbonTrade.put("quotaExhaustedCount", 0);
        carbonTrade.put("invalidOperationCount", 0);
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
        root.set("comboHistory", objectMapper.createArrayNode());
        root.set("policyHistory", objectMapper.createArrayNode());
        root.put("policyUsedThisTurn", false);
        root.putNull("lastPolicyUsed");
        root.set("handOverflowHistory", objectMapper.createArrayNode());

        ObjectNode eventStats = root.putObject("eventStats");
        eventStats.put("negativeTriggered", 0);
        eventStats.put("negativeResolved", 0);

        drawCoreCards(root, "early", 4);
        return root;
    }

    private int handlePlaceCoreCard(ObjectNode state, JsonNode actionData) {
        String cardId = readRequiredText(actionData, "cardId");
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

        int placedCount = state.withArray("placedCore").size();
        metrics.put("lowCarbonScore", Math.max(0, metrics.path("lowCarbonScore").asInt() + 1));
        updatePhaseByProgress(state, placedCount, metrics.path("lowCarbonScore").asInt());
        return 1;
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
        resolvePolicyUnlocks(state, counts);

        ObjectNode settlementBonus = objectMapper.createObjectNode();
        putAllBonusFields(settlementBonus, 0);
        int comboTriggered = applyTurnCombos(state, counts, settlementBonus);
        applyActivePolicyEffects(state, settlementBonus);
        applyActiveNegativeEventEffects(state, settlementBonus);

        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        resources.put("industry", resources.path("industry").asInt() + 2 + counts.industry + settlementBonus.path("industry").asInt());
        resources.put("tech", resources.path("tech").asInt() + 1 + counts.science + settlementBonus.path("tech").asInt());
        resources.put("population", resources.path("population").asInt() + 1 + counts.society + settlementBonus.path("population").asInt());

        metrics.put("green", Math.max(0, metrics.path("green").asInt() + counts.ecology + settlementBonus.path("green").asInt()));
        metrics.put(
            "carbon",
            Math.max(0, metrics.path("carbon").asInt() + counts.industry * 3 - counts.ecology * 2 - counts.science + settlementBonus.path("carbon").asInt())
        );
        metrics.put(
            "satisfaction",
            clamp(
                metrics.path("satisfaction").asInt()
                    + counts.society
                    - Math.max(0, counts.industry - counts.ecology)
                    + settlementBonus.path("satisfaction").asInt(),
                0,
                200
            )
        );
        applyCarbonQuotaSettlement(state);
        updateCarbonOverLimitStreak(state);

        int lowCarbonScore = calculateLowCarbonScore(state, counts.late);
        metrics.put("lowCarbonScore", lowCarbonScore);

        String phase = updatePhaseByProgress(state, counts.total, lowCarbonScore);
        int drawCount = switch (phase) {
            case "early" -> 4;
            case "mid" -> 3;
            default -> 2;
        };

        tickActiveNegativeEvents(state);
        applyEventCheck(state);
        processCarbonTradeWindow(state);
        drawCoreCards(state, phase, drawCount);
        drawPolicyCards(state);
        state.put("policyUsedThisTurn", false);
        state.putNull("lastPolicyUsed");
        updateFailureStreak(state);
        applyEndingEvaluationByDocument(state, counts, lowCarbonScore);

        if (!state.path("sessionEnded").asBoolean(false)) {
            state.put("turn", state.path("turn").asInt() + 1);
        }

        int baseTurnPoint = Math.max(0, lowCarbonScore - Math.max(0, state.path("turn").asInt() - 1));
        return baseTurnPoint + comboTriggered;
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

        tryUnlockPolicy(state, unlocked, "card061", counts.industry >= 6 && resources.path("industry").asInt() >= 50);
        tryUnlockPolicy(state, unlocked, "card062", counts.industry >= 8 || metrics.path("carbon").asInt() >= 110);
        tryUnlockPolicy(state, unlocked, "card063", counts.ecology >= 6 && metrics.path("green").asInt() >= 58);
        tryUnlockPolicy(state, unlocked, "card064", counts.ecology >= 8 && metrics.path("green").asInt() >= 68);
        tryUnlockPolicy(state, unlocked, "card065", counts.science >= 6 && resources.path("tech").asInt() >= 35);
        tryUnlockPolicy(state, unlocked, "card066", counts.science >= 8 && resources.path("tech").asInt() >= 45);
        tryUnlockPolicy(state, unlocked, "card067", counts.society >= 6 && metrics.path("satisfaction").asInt() >= 70);
        tryUnlockPolicy(state, unlocked, "card068", counts.society >= 8 && resources.path("population").asInt() >= 40);
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

    private int applyTurnCombos(ObjectNode state, DomainCounts counts, ObjectNode settlementBonus) {
        int triggered = 0;
        ArrayNode combos = objectMapper.createArrayNode();
        String lastPolicyUsed = state.path("lastPolicyUsed").asText("");

        if (!lastPolicyUsed.isBlank()) {
            if ("card061".equals(lastPolicyUsed) && counts.industry >= 4 && triggered < MAX_COMBO_PER_TURN) {
                addBonus(settlementBonus, "industry", 8);
                addBonus(settlementBonus, "carbon", -6);
                combos.add("policy_industry_chain");
                triggered++;
            }
            if ("card063".equals(lastPolicyUsed) && counts.ecology >= 4 && triggered < MAX_COMBO_PER_TURN) {
                addBonus(settlementBonus, "green", 6);
                addBonus(settlementBonus, "satisfaction", 3);
                combos.add("policy_ecology_chain");
                triggered++;
            }
            if ("card065".equals(lastPolicyUsed) && counts.science >= 4 && triggered < MAX_COMBO_PER_TURN) {
                addBonus(settlementBonus, "tech", 5);
                combos.add("policy_science_chain");
                triggered++;
            }
            if ("card067".equals(lastPolicyUsed) && counts.society >= 4 && triggered < MAX_COMBO_PER_TURN) {
                addBonus(settlementBonus, "satisfaction", 8);
                addBonus(settlementBonus, "carbon", -4);
                combos.add("policy_society_chain");
                triggered++;
            }
        }

        if (counts.industry >= 3 && counts.ecology >= 3 && triggered < MAX_COMBO_PER_TURN) {
            addBonus(settlementBonus, "carbon", -8);
            addBonus(settlementBonus, "green", 4);
            combos.add("cross_industry_ecology");
            triggered++;
        }
        if (counts.science >= 3 && counts.society >= 3 && triggered < MAX_COMBO_PER_TURN) {
            addBonus(settlementBonus, "tech", 2);
            addBonus(settlementBonus, "satisfaction", 6);
            combos.add("cross_science_society");
            triggered++;
        }

        if (counts.industry >= 6 && triggered < MAX_COMBO_PER_TURN) {
            addBonus(settlementBonus, "industry", 6);
            addBonus(settlementBonus, "carbon", 4);
            combos.add("intra_industry_scale");
            triggered++;
        }
        if (counts.ecology >= 6 && triggered < MAX_COMBO_PER_TURN) {
            addBonus(settlementBonus, "green", 6);
            combos.add("intra_ecology_restore");
            triggered++;
        }
        if (counts.science >= 6 && triggered < MAX_COMBO_PER_TURN) {
            addBonus(settlementBonus, "tech", 4);
            combos.add("intra_science_boost");
            triggered++;
        }
        if (counts.society >= 6 && triggered < MAX_COMBO_PER_TURN) {
            addBonus(settlementBonus, "population", 3);
            addBonus(settlementBonus, "satisfaction", 3);
            combos.add("intra_society_mobilize");
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

    private void applyPolicyEffectNow(ObjectNode state, String policyId) {
        ObjectNode resources = state.with("resources");
        ObjectNode metrics = state.with("metrics");
        switch (policyId) {
            case "card061" -> resources.put("industry", resources.path("industry").asInt() + 12);
            case "card062" -> {
                metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() - 8));
                upsertActivePolicy(state, policyId, "carbon_control", 3);
            }
            case "card063" -> metrics.put("green", metrics.path("green").asInt() + 8);
            case "card064" -> {
                metrics.put("green", metrics.path("green").asInt() + 5);
                upsertActivePolicy(state, policyId, "ecology", 3);
            }
            case "card065" -> {
                resources.put("tech", resources.path("tech").asInt() + 8);
                upsertActivePolicy(state, policyId, "industry_support", 2);
            }
            case "card066" -> {
                metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() - 5));
                upsertActivePolicy(state, policyId, "carbon_control", 3);
            }
            case "card067" -> {
                metrics.put("satisfaction", clamp(metrics.path("satisfaction").asInt() + 10, 0, 200));
                resources.put("population", resources.path("population").asInt() + 2);
            }
            case "card068" -> {
                metrics.put("satisfaction", clamp(metrics.path("satisfaction").asInt() + 6, 0, 200));
                upsertActivePolicy(state, policyId, "citizen", 3);
            }
            default -> throw new BizException(ErrorCode.INVALID_PARAMETER, "Unknown policy id: " + policyId);
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
            switch (policyId) {
                case "card062" -> addBonus(settlementBonus, "carbon", -6);
                case "card064" -> addBonus(settlementBonus, "green", 4);
                case "card065" -> addBonus(settlementBonus, "tech", 3);
                case "card066" -> {
                    addBonus(settlementBonus, "carbon", -4);
                    addBonus(settlementBonus, "tech", 2);
                }
                case "card068" -> addBonus(settlementBonus, "satisfaction", 5);
                default -> {
                    // no-op
                }
            }

            int remain = policy.path("remainingTurns").asInt();
            if (remain <= 1) {
                activePolicies.remove(i);
            } else {
                policy.put("remainingTurns", remain - 1);
            }
        }
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
        }
    }

    private void resolveNegativeEventsByPolicy(ObjectNode state, String policyId) {
        ArrayNode activeEvents = state.withArray("activeNegativeEvents");
        if (activeEvents.isEmpty()) {
            return;
        }

        List<String> resolvableTypes = resolvableEventTypes(policyId);
        if (resolvableTypes.isEmpty()) {
            return;
        }

        ObjectNode metrics = state.with("metrics");
        int resolvedCount = 0;
        for (int i = activeEvents.size() - 1; i >= 0; i--) {
            ObjectNode event = (ObjectNode) activeEvents.get(i);
            String eventType = event.path("eventType").asText();
            if (!resolvableTypes.contains(eventType)) {
                continue;
            }

            metrics.put("green", clamp(metrics.path("green").asInt() - event.path("greenDelta").asInt(), 0, 200));
            metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() - event.path("carbonDelta").asInt()));
            metrics.put("satisfaction", clamp(metrics.path("satisfaction").asInt() - event.path("satisfactionDelta").asInt(), 0, 200));
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

    private List<String> resolvableEventTypes(String policyId) {
        return switch (policyId) {
            case "card062", "card066" -> List.of("sea_level_rise");
            case "card063", "card064" -> List.of("flood");
            case "card067", "card068" -> List.of("citizen_protest");
            default -> List.of();
        };
    }

    private void drawPolicyCards(ObjectNode state) {
        ArrayNode unlocked = state.withArray("policyUnlocked");
        if (unlocked.isEmpty()) {
            return;
        }

        ArrayNode handPolicy = state.withArray("handPolicy");
        String selected = unlocked.get(ThreadLocalRandom.current().nextInt(unlocked.size())).asText();
        handPolicy.add(selected);
        enforcePolicyHandLimit(state);
    }

    private void applyCarbonQuotaSettlement(ObjectNode state) {
        int carbon = state.with("metrics").path("carbon").asInt();
        int requiredQuota = Math.max(0, (carbon - 80) / 10);
        ObjectNode trade = state.with("carbonTrade");
        int quota = trade.path("quota").asInt(50);
        int consumed = Math.min(requiredQuota, quota);
        int shortage = Math.max(0, requiredQuota - consumed);

        trade.put("quota", Math.max(0, quota - consumed));
        trade.put("lastQuotaConsumed", consumed);
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
        if (turn % TRADE_WINDOW_INTERVAL != 0) {
            return;
        }

        int carbon = state.with("metrics").path("carbon").asInt();
        double price = calculateCarbonTradePrice(carbon);
        trade.put("windowOpened", true);
        trade.put("lastWindowTurn", turn);
        trade.put("lastPrice", price);
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
        double price = trade.path("lastPrice").asDouble(BASE_CARBON_PRICE);
        double tradeValue = roundToOneDecimal(amount * price);
        double buyTotal = trade.path("buyAmountTotal").asDouble(0D);
        double sellTotal = trade.path("sellAmountTotal").asDouble(0D);
        int industryBefore = resources.path("industry").asInt();

        if ("buy".equals(tradeType)) {
            if (currentQuota + amount > MAX_CARBON_QUOTA) {
                markTradeViolation(state, "quota_overflow");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Quota exceeds maximum capacity");
            }
            int industryCost = (int) Math.ceil(tradeValue);
            if (industryBefore < industryCost) {
                markTradeViolation(state, "insufficient_industry");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Insufficient industry value for trade");
            }
            resources.put("industry", industryBefore - industryCost);
            trade.put("quota", currentQuota + amount);
            buyTotal = roundToOneDecimal(buyTotal + tradeValue);
            trade.put("buyAmountTotal", buyTotal);
        } else if ("sell".equals(tradeType)) {
            if (currentQuota < amount) {
                markTradeViolation(state, "insufficient_quota");
                throw new BizException(ErrorCode.OPERATION_NOT_ALLOWED, "Insufficient quota for selling");
            }
            int industryGain = (int) Math.floor(tradeValue);
            resources.put("industry", industryBefore + industryGain);
            trade.put("quota", currentQuota - amount);
            sellTotal = roundToOneDecimal(sellTotal + tradeValue);
            trade.put("sellAmountTotal", sellTotal);
        } else {
            markTradeViolation(state, "invalid_trade_type");
            throw new BizException(ErrorCode.INVALID_PARAMETER, "tradeType must be buy or sell");
        }

        double profitAfter = roundToOneDecimal(sellTotal - buyTotal);
        trade.put("profit", profitAfter);
        trade.put("windowOpened", false);

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
        history.put("price", trade.path("lastPrice").asDouble(BASE_CARBON_PRICE));
        history.put("action", "skip");
        history.put("amount", 0);
        history.put("industryDelta", 0);
        history.put("profitAfter", roundToOneDecimal(trade.path("profit").asDouble(0D)));
        trade.withArray("history").add(history);
        trade.put("windowOpened", false);
    }

    private double calculateCarbonTradePrice(int carbon) {
        double randomFactor = 0.8D + ThreadLocalRandom.current().nextDouble() * 0.4D;
        double carbonFactor;
        if (carbon > 100) {
            carbonFactor = 1.1D;
        } else if (carbon < 60) {
            carbonFactor = 0.9D;
        } else {
            carbonFactor = 1.0D;
        }
        return roundToOneDecimal(BASE_CARBON_PRICE * randomFactor * carbonFactor);
    }

    private void updateFailureStreak(ObjectNode state) {
        int carbon = state.path("metrics").path("carbon").asInt();
        if (carbon > 130) {
            state.put("highCarbonStreak", state.path("highCarbonStreak").asInt() + 1);
        } else {
            state.put("highCarbonStreak", 0);
        }
    }

    private void updateCarbonOverLimitStreak(ObjectNode state) {
        int carbon = state.path("metrics").path("carbon").asInt();
        if (carbon > 80) {
            state.put("highCarbonOverLimitStreak", state.path("highCarbonOverLimitStreak").asInt(0) + 1);
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
        int remainingCoreCards = state.withArray("handCore").size()
            + state.with("remainingPools").withArray("early").size()
            + state.with("remainingPools").withArray("mid").size()
            + state.with("remainingPools").withArray("late").size();
        boolean boundaryReached = remainingCoreCards == 0 || turn >= MAX_TURN;
        boolean immediateFailure = state.path("highCarbonStreak").asInt() >= 5;
        boolean tradeFailure = state.with("carbonTrade").path("quotaExhaustedCount").asInt(0) >= 4
            && state.with("carbonTrade").path("profit").asDouble(0D) < 0D;

        if (immediateFailure) {
            setEnding(
                state,
                ENDING_FAILURE,
                "失败结局",
                "endings/失败结局.jpg",
                "碳排放连续5回合高于130，系统进入失控状态。"
            );
            return;
        }
        if (tradeFailure) {
            setEnding(
                state,
                ENDING_FAILURE,
                "失败结局",
                "endings/失败结局.jpg",
                "配额耗尽记录达到4次且碳交易盈利为负。"
            );
            return;
        }
        if (!boundaryReached) {
            return;
        }

        if (lowCarbonScore < 120) {
            setEnding(
                state,
                ENDING_FAILURE,
                "失败结局",
                "endings/失败结局.jpg",
                "终局时低碳总分低于120。"
            );
            return;
        }

        int maxDomain = Math.max(Math.max(counts.industry, counts.ecology), Math.max(counts.science, counts.society));
        int minDomain = Math.min(Math.min(counts.industry, counts.ecology), Math.min(counts.science, counts.society));
        int usage6768 = countPolicyUsage(state, "card067") + countPolicyUsage(state, "card068");
        double eventResolveRate = calculateNegativeEventResolveRate(state);
        ObjectNode trade = state.with("carbonTrade");

        boolean innovation = counts.science == maxDomain
            && counts.science >= 14
            && resources.path("tech").asInt() >= 220
            && lowCarbonScore >= 170
            && metrics.path("carbon").asInt() <= 95
            && trade.path("profit").asDouble(0D) >= 120D
            && eventResolveRate >= 70D;

        boolean ecology = counts.ecology == maxDomain
            && counts.ecology >= 14
            && metrics.path("green").asInt() >= 140
            && metrics.path("carbon").asInt() <= 70
            && lowCarbonScore >= 170
            && trade.path("quota").asInt(0) >= 30
            && eventResolveRate >= 70D;

        boolean doughnut = counts.society == maxDomain
            && counts.society >= 12
            && metrics.path("satisfaction").asInt() >= 92
            && resources.path("population").asInt() >= 110
            && minDomain >= 8
            && metrics.path("carbon").asInt() <= 80
            && lowCarbonScore >= 165
            && usage6768 >= 3;

        if (innovation) {
            setEnding(
                state,
                ENDING_INNOVATION,
                "创新科技结局",
                "endings/创新科技结局.jpg",
                "科技板块成为主导，城市通过技术迭代实现减排与增长。"
            );
            return;
        }
        if (ecology) {
            setEnding(
                state,
                ENDING_ECOLOGY,
                "生态优先结局",
                "endings/生态优先结局.jpg",
                "生态板块成为主导，绿建和碳汇能力达成高水平。"
            );
            return;
        }
        if (doughnut) {
            setEnding(
                state,
                ENDING_DOUGHNUT,
                "甜甜圈结局",
                "endings/甜甜圈结局.jpg",
                "社会公平与低碳协同，城市进入甜甜圈稳态。"
            );
            return;
        }

        setEnding(
            state,
            ENDING_FAILURE,
            "失败结局",
            "endings/失败结局.jpg",
            "已达到终局边界但未满足任一正向结局条件。"
        );
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

    private double calculateNegativeEventResolveRate(ObjectNode state) {
        ObjectNode stats = state.with("eventStats");
        int triggered = stats.path("negativeTriggered").asInt(0);
        int resolved = stats.path("negativeResolved").asInt(0);
        if (triggered <= 0) {
            return 100D;
        }
        return (resolved * 100.0D) / triggered;
    }

    private void setEnding(ObjectNode state, String endingId, String endingName, String imageKey, String reason) {
        ObjectNode ending = objectMapper.createObjectNode();
        ending.put("endingId", endingId);
        ending.put("endingName", endingName);
        ending.put("imageKey", imageKey);
        ending.put("reason", reason);
        ending.put("turn", state.path("turn").asInt());
        state.set("ending", ending);
        state.put("sessionEnded", true);
    }

    private int calculateLowCarbonScore(ObjectNode state, int latePlaced) {
        DomainCounts counts = countPlacedDomains(state);
        int policyUnlocked = state.withArray("policyUnlocked").size();
        int carbon = state.with("metrics").path("carbon").asInt();
        ObjectNode trade = state.with("carbonTrade");
        ObjectNode eventStats = state.with("eventStats");

        int score = counts.total + latePlaced * 2;
        if (counts.industry >= 8) score += 5;
        if (counts.ecology >= 8) score += 5;
        if (counts.science >= 8) score += 5;
        if (counts.society >= 8) score += 5;

        score += policyUnlocked * 3;
        if (policyUnlocked >= 8) {
            score += 10;
        }

        score += eventStats.path("negativeResolved").asInt(0) * 10;
        score -= eventStats.path("negativeTriggered").asInt(0) * 10;

        score += calculateCarbonTierScore(carbon);
        if (state.path("highCarbonOverLimitStreak").asInt(0) >= 3) {
            score -= 15;
        }

        double profit = trade.path("profit").asDouble(0D);
        if (profit > 0) {
            score += ((int) Math.floor(profit / 50D)) * 3;
        }
        score -= trade.path("quotaExhaustedCount").asInt(0) * 5;
        score -= trade.path("invalidOperationCount").asInt(0) * 8;

        return Math.max(0, score);
    }

    private int calculateCarbonTierScore(int carbon) {
        if (carbon <= 70) {
            return 3;
        }
        if (carbon <= 80) {
            return 0;
        }
        if (carbon <= 100) {
            return -2;
        }
        if (carbon <= 130) {
            return -5;
        }
        return -8;
    }

    private void applyEventCheck(ObjectNode state) {
        int cooldown = state.path("eventCooldown").asInt();
        cooldown -= 1;
        if (cooldown <= 0) {
            maybeTriggerNegativeEvent(state);
            state.put("eventCooldown", 3);
        } else {
            state.put("eventCooldown", cooldown);
        }
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

    private void maybeTriggerNegativeEvent(ObjectNode state) {
        if (ThreadLocalRandom.current().nextDouble() > 0.30D) {
            return;
        }

        ObjectNode metrics = state.with("metrics");
        int turn = state.path("turn").asInt();
        ArrayNode candidates = objectMapper.createArrayNode();
        if (metrics.path("green").asInt() <= 75 && turn % 2 == 0) {
            candidates.add("flood");
        }
        if (metrics.path("carbon").asInt() >= 95) {
            candidates.add("sea_level_rise");
        }
        if (metrics.path("satisfaction").asInt() <= 70 || state.with("resources").path("population").asInt() >= 100) {
            candidates.add("citizen_protest");
        }
        if (candidates.isEmpty()) {
            return;
        }

        String selected = weightedPick(candidates);
        int greenDelta = 0;
        int carbonDelta = 0;
        int satisfactionDelta = 0;
        int durationTurns = 1;
        switch (selected) {
            case "flood" -> {
                greenDelta = -10;
                durationTurns = 1;
                metrics.put("green", Math.max(0, metrics.path("green").asInt() + greenDelta));
            }
            case "sea_level_rise" -> {
                carbonDelta = 15;
                durationTurns = 2;
                metrics.put("carbon", Math.max(0, metrics.path("carbon").asInt() + carbonDelta));
            }
            case "citizen_protest" -> {
                satisfactionDelta = -12;
                durationTurns = 1;
                metrics.put("satisfaction", Math.max(0, metrics.path("satisfaction").asInt() + satisfactionDelta));
            }
            default -> {
                return;
            }
        }

        ObjectNode eventNode = objectMapper.createObjectNode();
        eventNode.put("turn", state.path("turn").asInt());
        eventNode.put("eventType", selected);
        state.withArray("eventHistory").add(eventNode);

        ObjectNode activeEvent = objectMapper.createObjectNode();
        activeEvent.put("eventType", selected);
        activeEvent.put("remainingTurns", durationTurns);
        activeEvent.put("greenDelta", greenDelta);
        activeEvent.put("carbonDelta", carbonDelta);
        activeEvent.put("satisfactionDelta", satisfactionDelta);
        state.withArray("activeNegativeEvents").add(activeEvent);

        ObjectNode stats = state.with("eventStats");
        stats.put("negativeTriggered", stats.path("negativeTriggered").asInt(0) + 1);
    }

    private String weightedPick(ArrayNode candidates) {
        int total = 0;
        int[] weights = new int[candidates.size()];
        for (int i = 0; i < candidates.size(); i++) {
            String eventType = candidates.get(i).asText();
            int weight = switch (eventType) {
                case "sea_level_rise" -> 40;
                case "flood" -> 35;
                case "citizen_protest" -> 25;
                default -> 10;
            };
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

    private String updatePhaseByProgress(ObjectNode state, int placedCount, int lowCarbonScore) {
        String previousPhase = state.path("phase").asText("early");
        int remainingCoreCards = countRemainingCoreCards(state);
        boolean shouldEnterLate = (placedCount >= 31 && lowCarbonScore >= 101) || remainingCoreCards <= 10;
        boolean shouldStayEarly = placedCount <= 15 && lowCarbonScore < 60;
        boolean shouldEnterMid = placedCount >= 16 && placedCount <= 30 && lowCarbonScore >= 60 && lowCarbonScore <= 100;

        String phase;
        if (shouldEnterLate) {
            phase = "late";
        } else if (shouldStayEarly) {
            phase = "early";
        } else if (shouldEnterMid) {
            phase = "mid";
        } else {
            if (placedCount <= 15) {
                phase = "early";
            } else if (placedCount >= 31) {
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

        if (drawLimit <= 0) {
            return;
        }

        for (int i = 0; i < drawLimit; i++) {
            String cardId = drawOneCoreCardFromPools(pools, phase, domainFactors);
            if (cardId == null) {
                break;
            }
            hand.add(cardId);
        }

        enforceCoreHandLimit(state);
    }

    private String drawOneCoreCardFromPools(ObjectNode pools, String phase, Map<String, Double> domainFactors) {
        ArrayNode primaryPool = pools.withArray(phase);
        if (!primaryPool.isEmpty()) {
            return removeWeightedCard(primaryPool, domainFactors);
        }

        if ("early".equals(phase)) {
            ArrayNode midPool = pools.withArray("mid");
            if (!midPool.isEmpty()) {
                return removeWeightedCard(midPool, domainFactors);
            }
            ArrayNode latePool = pools.withArray("late");
            if (!latePool.isEmpty()) {
                return removeWeightedCard(latePool, domainFactors);
            }
            return null;
        }

        if ("mid".equals(phase)) {
            ArrayNode latePool = pools.withArray("late");
            if (!latePool.isEmpty()) {
                return removeWeightedCard(latePool, domainFactors);
            }
            return null;
        }

        return null;
    }

    private String removeWeightedCard(ArrayNode pool, Map<String, Double> domainFactors) {
        int index = pickWeightedIndex(pool, domainFactors);
        String cardId = pool.get(index).asText();
        pool.remove(index);
        return cardId;
    }

    private int pickWeightedIndex(ArrayNode pool, Map<String, Double> domainFactors) {
        if (pool.size() == 1) {
            return 0;
        }

        double[] weights = new double[pool.size()];
        double totalWeight = 0D;
        for (int i = 0; i < pool.size(); i++) {
            String cardId = pool.get(i).asText();
            String domain = cardCatalogService.getRequiredCard(cardId).getDomain();
            double factor = domainFactors.getOrDefault(domain, 1.0D);
            double weight = Math.max(0.01D, factor);
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
        ArrayNode discard = state.withArray("discardCore");
        while (hand.size() > CORE_HAND_LIMIT) {
            String discardedCard = hand.remove(0).asText();
            discard.add(discardedCard);
            recordAutoDiscard(state, "core", discardedCard);
        }
    }

    private void enforcePolicyHandLimit(ObjectNode state) {
        ArrayNode hand = state.withArray("handPolicy");
        ArrayNode discard = state.withArray("discardPolicy");
        while (hand.size() > POLICY_HAND_LIMIT) {
            String discardedCard = hand.remove(0).asText();
            discard.add(discardedCard);
            recordAutoDiscard(state, "policy", discardedCard);
        }
    }

    private void recordAutoDiscard(ObjectNode state, String handType, String cardId) {
        ObjectNode history = objectMapper.createObjectNode();
        history.put("turn", state.path("turn").asInt());
        history.put("handType", handType);
        history.put("cardId", cardId);
        history.put("decisionWindowSeconds", HAND_DISCARD_DECISION_SECONDS);
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

    private void putAllBonusFields(ObjectNode bonus, int init) {
        bonus.put("industry", init);
        bonus.put("tech", init);
        bonus.put("population", init);
        bonus.put("green", init);
        bonus.put("carbon", init);
        bonus.put("satisfaction", init);
    }

    private void addBonus(ObjectNode bonus, String field, int delta) {
        bonus.put(field, bonus.path(field).asInt() + delta);
    }

    private int calculateLevel(long score) {
        return (int) (score / 100) + 1;
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

    private UUID resolveCurrentUserId() {
        return SecurityUtil.getCurrentUserId();
    }

    private UUID resolveCurrentUserIdOptional() {
        return SecurityUtil.getCurrentUserIdOptional();
    }

    private GameSessionEntity createSession(UUID userId) {
        ObjectNode initialState = buildInitialState();
        long initialScore = initialState.path("metrics").path("lowCarbonScore").asLong(0);
        LocalDateTime now = LocalDateTime.now();

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

    private GameSessionDTO toDTO(GameSessionEntity entity) {
        return GameSessionDTO.builder()
            .id(entity.getId())
            .userId(entity.getUserId())
            .pondState(entity.getPondState())
            .score(entity.getScore())
            .level(entity.getLevel())
            .startedAt(entity.getStartedAt())
            .lastActionAt(entity.getLastActionAt())
            .status(entity.getStatus())
            .build();
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
